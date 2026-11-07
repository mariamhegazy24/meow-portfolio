import {FACES, catSrc} from '../../data/catAssets';
import {catToast} from '../../data/events';
import type {CatMoodDetail, FaceName} from '../../types';
import {
  ActStep, HOVER_REACTIONS, IDLE_ACTS, IDLE_ACT_ORDER, TAP_REACTIONS, Zone,
  faceAfterDrag, faceWhileDragging, zoneAt,
} from './CatBehavior';
import {Blinker, gazeFace} from './EyeTracking';
import {PortraitRenderer} from './PortraitRenderer';
import {OVER, SoftSheet} from './SoftSheetPhysics';

const IDLE_AFTER_MS = 30000;
const IDLE_RANDOM_MS = 15000;
const MAX_CROSSFADE_MS = 70; // only ONE picture is ever visible; changes are a very short crossfade
const GAZE_ORIGIN_V = 0.43;
const HOVER_DELAY_MS = 80;

interface Act {
  steps: ActStep[];
  index: number;
  startedAt: number;
}

/**
 * The living cat. Decides WHICH picture to show (gaze, blink, tap, hover, drag, idle acts)
 * and lets the SoftSheet move the skin. It never composites pictures: one face at a time.
 */
export class LivingPortrait {
  private readonly blinker = new Blinker();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly textureWidth: 640 | 480 = window.innerWidth < 760 ? 480 : 640;

  private rafId = 0;
  private disposed = false;
  private ready = false;
  private visible = true;
  private lastFrame = performance.now();
  private startedAt = 0;
  private alphaMap: Uint8ClampedArray | null = null;

  // pointer
  private lastClientX = 0;
  private lastClientY = 0;
  private pointerU = 0.5;
  private pointerV = 0.5;
  private speed = 0;
  private overHead = false;
  private zone: Zone | null = null;
  private zoneSince = 0;
  private lastInput = -1e9;
  private awake = false;
  private pressed = false;
  private pressStart = 0;
  private pressU = 0;
  private pressV = 0;
  private scrollUntil = 0;
  private lastScrollY = window.scrollY;

  // behaviour
  private mood: {face: FaceName; until: number} | null = null;
  private pulls: number[] = [];
  private taps: number[] = [];
  private act: Act | null = null;
  private actQueue: string[] = [];
  private nextIdleIn = IDLE_AFTER_MS;

  // what is on screen
  private logicalFace: FaceName = 'rest';
  private logicalFadeMs = 70;
  private eyeFace: FaceName = 'rest';
  private fromFace: FaceName = 'rest';
  private toFace: FaceName = 'rest';
  private fadeStart = 0;
  private fadeMs = 1;

  // head lean (a spring that follows the cursor and whatever the act asks)
  private leanX = 0;
  private leanY = 0;
  private leanVX = 0;
  private leanVY = 0;
  private actLean: [number, number] = [0, 0];

  private readonly observers: Array<{disconnect(): void}> = [];

  static create(wrap: HTMLElement, canvas: HTMLCanvasElement, fallback: HTMLImageElement): LivingPortrait | null {
    const sheet = new SoftSheet();
    const renderer = PortraitRenderer.create(canvas, sheet);
    return renderer ? new LivingPortrait(wrap, canvas, fallback, renderer, sheet) : null;
  }

  private constructor(
    private readonly wrap: HTMLElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly fallback: HTMLImageElement,
    private readonly renderer: PortraitRenderer,
    private readonly sheet: SoftSheet,
  ) {
    this.addListeners();
    this.watchCanvas();
    void this.loadPictures();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.wrap.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('cat:mood', this.onMood);
    this.observers.forEach((o) => o.disconnect());
    this.renderer.dispose();
  }

  // ---------- setup ----------

  private addListeners(): void {
    window.addEventListener('pointermove', this.onPointerMove);
    this.wrap.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('scroll', this.onScroll, {passive: true});
    window.addEventListener('cat:mood', this.onMood);
  }

  private watchCanvas(): void {
    const visibility = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
    });
    visibility.observe(this.canvas);
    const resize = new ResizeObserver(() => this.renderer.resize(this.canvas));
    resize.observe(this.canvas);
    this.observers.push(visibility, resize);
  }

  private loadImage(face: FaceName): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = catSrc(face, this.textureWidth);
    });
  }

  private async loadPictures(): Promise<void> {
    const base = await this.loadImage('rest');
    if (!base || this.disposed) return;
    this.renderer.upload('rest', base);
    this.alphaMap = this.makeHitMap(base);
    this.fallback.style.visibility = 'hidden';
    this.ready = true;
    this.startedAt = performance.now();
    this.rafId = requestAnimationFrame(this.frame);

    // the other pictures stream in, four at a time
    const queue = FACES.filter((f) => f !== 'rest');
    let next = 0;
    const worker = async () => {
      while (next < queue.length && !this.disposed) {
        const face = queue[next++];
        const image = await this.loadImage(face);
        if (image && !this.disposed) this.renderer.upload(face, image);
      }
    };
    await Promise.all(Array.from({length: 4}, worker));
  }

  /** Small alpha map so the cat reacts only when the pointer is on the cat, not on the empty canvas. */
  private makeHitMap(image: HTMLImageElement): Uint8ClampedArray {
    const small = document.createElement('canvas');
    small.width = small.height = 128;
    const ctx = small.getContext('2d', {willReadFrequently: true})!;
    ctx.drawImage(image, 0, 0, 128, 128);
    return ctx.getImageData(0, 0, 128, 128).data;
  }

  // ---------- input ----------

  private toUv(clientX: number, clientY: number): [number, number] {
    const box = this.canvas.getBoundingClientRect();
    return [((clientX - box.left) / box.width - 0.5) * OVER + 0.5, ((clientY - box.top) / box.height - 0.5) * OVER + 0.5];
  }

  private isSolid(u: number, v: number): boolean {
    if (!this.alphaMap || u < 0 || v < 0 || u >= 1 || v >= 1) return false;
    return this.alphaMap[(((v * 128) | 0) * 128 + ((u * 128) | 0)) * 4 + 3] > 40;
  }

  private wake(now: number): void {
    this.lastInput = now;
    this.nextIdleIn = IDLE_AFTER_MS + Math.random() * IDLE_RANDOM_MS;
    if (this.awake) return;
    this.awake = true; // load: eyes closed; the first pointer move wakes her through half to open
    this.blinker.schedule(now);
    this.setEye('half');
    window.setTimeout(() => {
      if (!this.disposed) this.setEye('rest');
    }, 120);
  }

  private setEye(face: FaceName): void {
    if (this.renderer.has(face)) this.eyeFace = face;
  }

  private readonly onPointerMove = (e: PointerEvent): void => {
    const now = performance.now();
    const dx = e.clientX - this.lastClientX;
    const dy = e.clientY - this.lastClientY;
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
    [this.pointerU, this.pointerV] = this.toUv(e.clientX, e.clientY);
    this.speed += Math.hypot(dx, dy) * 0.004;
    this.wake(now);
    if (this.act && !this.pressed) this.endAct();

    this.overHead = this.isSolid(this.pointerU, this.pointerV);
    const zone = this.overHead ? zoneAt(this.pointerU, this.pointerV) : null;
    if (zone !== this.zone) {
      this.zone = zone;
      this.zoneSince = now;
    }
    this.wrap.style.cursor = this.pressed ? 'grabbing' : this.overHead ? 'grab' : '';

    if (this.overHead && !this.pressed) this.sheet.poke(this.pointerU, this.pointerV, dx * 0.00035, dy * 0.00035, 0.07);
    if (this.pressed) this.sheet.dragTo(this.pointerU, this.pointerV);
  };

  private readonly onPointerDown = (e: PointerEvent): void => {
    const [u, v] = this.toUv(e.clientX, e.clientY);
    if (!this.isSolid(u, v)) return;
    const now = performance.now();
    this.wake(now);
    this.endAct();
    this.pressed = true;
    this.pressStart = now;
    this.pressU = u;
    this.pressV = v;
    this.mood = null;
    this.sheet.grab(u, v);
    this.wrap.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  private readonly onPointerUp = (): void => {
    if (!this.pressed) return;
    const now = performance.now();
    const pull = this.sheet.pullDistance;
    const zone = zoneAt(this.pressU, this.pressV) ?? 'cheek';
    const held = now - this.pressStart;
    this.pressed = false;
    this.sheet.release();
    this.wrap.style.cursor = this.overHead ? 'grab' : '';

    if (pull < 0.03 && held < 380) {
      this.onTap(zone, now);
    } else {
      this.pulls = this.pulls.filter((t) => now - t < 14000);
      this.pulls.push(now);
      const {face, ms} = faceAfterDrag(pull, this.pulls.length);
      this.mood = {face, until: now + ms};
    }
  };

  private onTap(zone: Zone, now: number): void {
    this.taps = this.taps.filter((t) => now - t < 2000);
    this.taps.push(now);
    this.sheet.poke(this.pressU, this.pressV, 0, 0.5, 0.06);
    if (this.taps.length >= 3) {
      this.taps = [];
      this.mood = {face: 'shock', until: now + 1800};
      this.sheet.poke(this.pressU, this.pressV, 0, 1.2, 0.1);
      catToast('EXCUSE ME. I AM A CELEBRITY.');
      return;
    }
    const reaction = TAP_REACTIONS[zone];
    if (reaction.act) this.startAct(reaction.act, now);
    else if (reaction.face) this.mood = {face: reaction.face, until: now + 1100};
  }

  private readonly onScroll = (): void => {
    const now = performance.now();
    if (Math.abs(window.scrollY - this.lastScrollY) > 2) {
      this.scrollUntil = now + 500; // scrolling makes her look down
      this.lastScrollY = window.scrollY;
    }
    this.wake(now);
  };

  /** Other parts of the page can ask the cat to make a face (hover on a CTA, a click on the crown...). */
  private readonly onMood = (e: Event): void => {
    const {face, ms} = (e as CustomEvent<CatMoodDetail>).detail;
    if (this.renderer.has(face)) this.mood = {face, until: performance.now() + ms};
  };

  // ---------- idle acts ----------

  private startAct(name: string, now: number): void {
    const steps = IDLE_ACTS[name];
    if (!steps) return;
    this.endAct();
    this.act = {steps, index: -1, startedAt: now};
    this.advanceAct(now);
  }

  private advanceAct(now: number): void {
    const act = this.act;
    if (!act) return;
    act.index++;
    if (act.index >= act.steps.length) {
      this.endAct();
      return;
    }
    const step = act.steps[act.index];
    act.startedAt = now;
    this.logicalFace = step.face;
    this.logicalFadeMs = step.fadeMs;
    this.actLean = step.lean ?? [0, 0];
    if (step.jolt) this.sheet.poke(...step.jolt);
  }

  private endAct(): void {
    this.act = null;
    this.actLean = [0, 0];
  }

  private maybeStartIdleAct(now: number): void {
    const quietFor = now - Math.max(this.lastInput, this.startedAt);
    if (this.act || this.pressed || this.reducedMotion || quietFor <= this.nextIdleIn) return;
    if (this.actQueue.length === 0) this.actQueue = [...IDLE_ACT_ORDER];
    this.startAct(this.actQueue.shift()!, now);
    this.lastInput = now;
    this.nextIdleIn = IDLE_AFTER_MS + Math.random() * IDLE_RANDOM_MS;
    if (!this.awake) this.wake(now);
  }

  // ---------- frame ----------

  private chooseFace(now: number): void {
    if (this.act) {
      const act = this.act;
      if (now - act.startedAt > act.steps[act.index].holdMs) this.advanceAct(now);
      return;
    }
    let face: FaceName = 'rest';
    if (this.pressed) face = faceWhileDragging(this.sheet.pullDistance);
    else if (this.mood && now < this.mood.until) face = this.mood.face;
    else if (this.speed > 2.4) face = 'dizzy'; // shaking the cursor fast
    else if (this.zone && now - this.zoneSince > HOVER_DELAY_MS && HOVER_REACTIONS[this.zone]) face = HOVER_REACTIONS[this.zone]!;
    this.logicalFace = face;
    this.logicalFadeMs = face === 'rest' ? 110 : 90;
  }

  private chooseEyes(now: number): void {
    if (this.logicalFace !== 'rest') return;
    if (!this.awake || this.blinker.isClosed(now)) {
      this.setEye('closed');
      return;
    }
    const lookingDown = now < this.scrollUntil;
    const dx = lookingDown ? 0 : this.pointerU - 0.5;
    const dy = lookingDown ? 1 : this.pointerV - GAZE_ORIGIN_V;
    this.setEye(gazeFace(dx, dy));
  }

  /** One picture on screen at a time: a very short crossfade between the old and the new one. */
  private showFace(face: FaceName, now: number): void {
    if (!this.renderer.has(face) || face === this.toFace) return;
    const progress = (now - this.fadeStart) / this.fadeMs;
    this.fromFace = progress > 0.5 ? this.toFace : this.fromFace;
    this.toFace = face;
    this.fadeStart = now;
    this.fadeMs = Math.min(MAX_CROSSFADE_MS, Math.max(1, this.logicalFadeMs));
  }

  private updateLean(now: number, dt: number): void {
    let targetX = this.actLean[0] + Math.sin(now * 0.0009) * 0.0015;
    let targetY = this.actLean[1] + Math.sin(now * 0.0013) * 0.0022;
    if (this.pressed) {
      const [px, py] = this.sheet.pull;
      targetX += px * 0.16;
      targetY += py * 0.16;
    } else if (this.awake) {
      targetX += (this.pointerU - 0.5) * 0.02;
      targetY += (this.pointerV - 0.45) * 0.012;
    }
    this.leanVX += ((targetX - this.leanX) * 70 - this.leanVX * 8) * dt;
    this.leanVY += ((targetY - this.leanY) * 70 - this.leanVY * 8) * dt;
    this.leanX += this.leanVX * dt;
    this.leanY += this.leanVY * dt;
  }

  private readonly frame = (now: number): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.frame);
    const dt = Math.min(0.04, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (!this.ready || !this.visible) return;

    this.speed *= Math.exp(-dt * 6);
    this.maybeStartIdleAct(now);
    this.chooseFace(now);
    this.chooseEyes(now);
    this.showFace(this.logicalFace === 'rest' ? this.eyeFace : this.logicalFace, now);
    this.updateLean(now, dt);
    this.sheet.advance(dt);
    this.renderer.draw(this.sheet, this.fromFace, this.toFace, (now - this.fadeStart) / this.fadeMs, this.leanX, this.leanY);
  };
}
