import type {FaceName} from '../../types';

/** The supplied pictures contain four gaze directions, so the cursor angle snaps to the dominant axis. */
export function gazeFace(dx: number, dy: number, deadZone = 0.13): FaceName {
  if (Math.hypot(dx, dy) < deadZone) return 'rest';
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** Decides when the cat blinks (every 2.2 to 5.6 seconds). */
export class Blinker {
  private nextBlink = 0;
  private closedUntil = 0;

  schedule(now: number, delay = 1600): void {
    this.nextBlink = now + delay;
  }

  isClosed(now: number): boolean {
    if (now < this.closedUntil) return true;
    if (now > this.nextBlink) {
      this.closedUntil = now + 110;
      this.nextBlink = now + 2200 + Math.random() * 3400;
    }
    return false;
  }
}
