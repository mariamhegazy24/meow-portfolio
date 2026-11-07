/**
 * A soft, stretchy sheet: every node of a grid follows a damped wave equation.
 * Rules that prevent visual bugs:
 *  - fixed 1/240s sub-steps, whatever the frame rate
 *  - every frame each row and column is forced back into order (no folded triangles)
 */
export const OVER = 1.7; // the sheet is 1.7x larger than the picture, so edges can move freely
export const CELLS = 72;
export const NODES = CELLS + 1;
export const NODE_COUNT = NODES * NODES;
const SPAN = OVER / CELLS;
const ORIGIN = 0.5 - OVER / 2;

const WOBBLE = 2.3 * 2 * Math.PI;
const WAVE_SPEED = (0.085 / SPAN) * WOBBLE;
const DAMPING = 2 * 0.14 * WOBBLE;
const VISCOSITY = 0.2 * WAVE_SPEED;
const FIXED_STEP = 1 / 240;
const MAX_STEPS_PER_FRAME = 9;
const MIN_GAP = SPAN * 0.34;
const HOLD_STIFFNESS = 3000;
const HOLD_DAMPING = 90;

interface HeldNode {
  index: number;
  weight: number;
  startX: number;
  startY: number;
}

export class SoftSheet {
  /** Rest uv position of every node: [u0, v0, u1, v1, ...] */
  readonly restUv = new Float32Array(NODE_COUNT * 2);
  readonly triangles = new Uint16Array(CELLS * CELLS * 6);

  private readonly restU = new Float32Array(NODE_COUNT);
  private readonly restV = new Float32Array(NODE_COUNT);
  private readonly dispX = new Float32Array(NODE_COUNT);
  private readonly dispY = new Float32Array(NODE_COUNT);
  private readonly velX = new Float32Array(NODE_COUNT);
  private readonly velY = new Float32Array(NODE_COUNT);
  private readonly smoothX = new Float32Array(NODE_COUNT);
  private readonly smoothY = new Float32Array(NODE_COUNT);
  private readonly lineLow = new Float32Array(NODES);
  private readonly lineHigh = new Float32Array(NODES);
  private readonly linePos = new Float32Array(NODES);

  private held: HeldNode[] = [];
  private holdU = 0;
  private holdV = 0;
  private pullX = 0;
  private pullY = 0;
  private leftover = 0;

  constructor() {
    for (let row = 0, k = 0; row < NODES; row++) {
      for (let col = 0; col < NODES; col++, k++) {
        this.restU[k] = ORIGIN + col * SPAN;
        this.restV[k] = ORIGIN + row * SPAN;
        this.restUv[k * 2] = this.restU[k];
        this.restUv[k * 2 + 1] = this.restV[k];
      }
    }
    let t = 0;
    for (let row = 0; row < CELLS; row++) {
      for (let col = 0; col < CELLS; col++) {
        const a = row * NODES + col;
        const b = a + 1;
        const c = a + NODES;
        const d = c + 1;
        this.triangles.set([a, c, b, b, c, d], t);
        t += 6;
      }
    }
  }

  get isHeld(): boolean {
    return this.held.length > 0;
  }

  /** How far the visitor has pulled the skin (in uv units). */
  get pullDistance(): number {
    return Math.hypot(this.pullX, this.pullY);
  }

  get pull(): [number, number] {
    return [this.pullX, this.pullY];
  }

  /** Grab the skin around (u, v); nodes close to it follow the hand. */
  grab(u: number, v: number, radius = 0.22): void {
    this.held = [];
    for (let k = 0; k < NODE_COUNT; k++) {
      const dx = this.restU[k] + this.dispX[k] - u;
      const dy = this.restV[k] + this.dispY[k] - v;
      const weight = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
      if (weight > 0.02) {
        this.held.push({index: k, weight, startX: this.dispX[k], startY: this.dispY[k]});
      }
    }
    this.holdU = u;
    this.holdV = v;
    this.pullX = 0;
    this.pullY = 0;
  }

  /** Move the hand to (u, v). The pull is limited so the sheet can never fold. */
  dragTo(u: number, v: number): void {
    let px = u - this.holdU;
    let py = v - this.holdV;
    const length = Math.hypot(px, py);
    const limit = 0.24;
    if (length > 0) {
      const k = (limit * (1 - Math.exp(-length / limit))) / length;
      px *= k;
      py *= k;
    }
    this.pullX = px;
    this.pullY = py;
  }

  release(): void {
    this.held = [];
    this.pullX = 0;
    this.pullY = 0;
  }

  /** A shove from nowhere: sneezes, jolts, a cursor rubbing the skin. */
  poke(u: number, v: number, dx: number, dy: number, radius = 0.09): void {
    for (let k = 0; k < NODE_COUNT; k++) {
      const ax = this.restU[k] - u;
      const ay = this.restV[k] - v;
      const weight = Math.exp(-(ax * ax + ay * ay) / (radius * radius));
      this.velX[k] += dx * weight;
      this.velY[k] += dy * weight;
    }
  }

  advance(dt: number): void {
    this.leftover += dt;
    let steps = 0;
    while (this.leftover >= FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
      this.step(FIXED_STEP);
      this.leftover -= FIXED_STEP;
      steps++;
    }
    if (steps === MAX_STEPS_PER_FRAME) this.leftover = 0;
    this.smooth();
    this.untangle();
  }

  /** Writes [dx, dy, shade] for every node. Shade darkens squashed skin and lightens stretched skin. */
  writeVertices(out: Float32Array): void {
    let o = 0;
    for (let k = 0; k < NODE_COUNT; k++) {
      out[o++] = this.smoothX[k];
      out[o++] = this.smoothY[k];
      const col = k % NODES;
      const row = (k / NODES) | 0;
      let shade = 1;
      if (col > 0 && col < CELLS && row > 0 && row < CELLS) {
        const stretch = this.smoothX[k + 1] - this.smoothX[k - 1] + (this.smoothY[k + NODES] - this.smoothY[k - NODES]);
        shade = Math.max(0.9, Math.min(1.12, 1 - stretch * 1.8));
      }
      out[o++] = shade;
    }
  }

  private step(dt: number): void {
    const c2 = WAVE_SPEED * WAVE_SPEED;
    const w2 = WOBBLE * WOBBLE;
    const {dispX, dispY, velX, velY} = this;
    for (let row = 1; row < CELLS; row++) {
      for (let col = 1; col < CELLS; col++) {
        const k = row * NODES + col;
        const l = k - 1, r = k + 1, t = k - NODES, b = k + NODES;
        const lapX = dispX[l] + dispX[r] + dispX[t] + dispX[b] - 4 * dispX[k];
        const lapY = dispY[l] + dispY[r] + dispY[t] + dispY[b] - 4 * dispY[k];
        const lapVX = velX[l] + velX[r] + velX[t] + velX[b] - 4 * velX[k];
        const lapVY = velY[l] + velY[r] + velY[t] + velY[b] - 4 * velY[k];
        velX[k] += (c2 * lapX - w2 * dispX[k] - DAMPING * velX[k] + VISCOSITY * lapVX) * dt;
        velY[k] += (c2 * lapY - w2 * dispY[k] - DAMPING * velY[k] + VISCOSITY * lapVY) * dt;
      }
    }
    for (const node of this.held) {
      const k = node.index;
      const stiffness = HOLD_STIFFNESS * node.weight;
      const damping = HOLD_DAMPING * node.weight;
      velX[k] += ((node.startX + this.pullX * node.weight - dispX[k]) * stiffness - velX[k] * damping) * dt;
      velY[k] += ((node.startY + this.pullY * node.weight - dispY[k]) * stiffness - velY[k] * damping) * dt;
    }
    for (let k = 0; k < NODE_COUNT; k++) {
      dispX[k] += velX[k] * dt;
      dispY[k] += velY[k] * dt;
    }
  }

  private smooth(): void {
    const {dispX, dispY, smoothX, smoothY} = this;
    for (let row = 0; row < NODES; row++) {
      for (let col = 0; col < NODES; col++) {
        const k = row * NODES + col;
        const edge = col === 0 || row === 0 || col === CELLS || row === CELLS;
        if (edge) {
          smoothX[k] = dispX[k];
          smoothY[k] = dispY[k];
        } else {
          smoothX[k] = (dispX[k] * 4 + dispX[k - 1] + dispX[k + 1] + dispX[k - NODES] + dispX[k + NODES]) / 8;
          smoothY[k] = (dispY[k] * 4 + dispY[k - 1] + dispY[k + 1] + dispY[k - NODES] + dispY[k + NODES]) / 8;
        }
      }
    }
  }

  /** Forces each row and column back into order with a minimum gap, so triangles never overlap. */
  private untangle(): void {
    for (let pass = 0; pass < 2; pass++) {
      for (let row = 0; row < NODES; row++) this.orderLine(row * NODES, 1, this.smoothX, this.restU);
      for (let col = 0; col < NODES; col++) this.orderLine(col, NODES, this.smoothY, this.restV);
    }
  }

  private orderLine(start: number, stride: number, field: Float32Array, base: Float32Array): void {
    const {linePos, lineLow, lineHigh} = this;
    for (let i = 0; i < NODES; i++) {
      const k = start + i * stride;
      linePos[i] = base[k] + field[k];
    }
    lineLow[0] = linePos[0];
    for (let i = 1; i < NODES; i++) lineLow[i] = Math.max(linePos[i], lineLow[i - 1] + MIN_GAP);
    lineHigh[CELLS] = linePos[CELLS];
    for (let i = CELLS - 1; i >= 0; i--) lineHigh[i] = Math.min(linePos[i], lineHigh[i + 1] - MIN_GAP);
    for (let i = 0; i < NODES; i++) {
      const k = start + i * stride;
      field[k] = (lineLow[i] + lineHigh[i]) / 2 - base[k];
    }
  }
}
