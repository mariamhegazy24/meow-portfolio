import type {FaceName} from '../../types';

/** One step of a self-playing act: [face, crossfade ms, hold ms, extras]. */
export interface ActStep {
  face: FaceName;
  fadeMs: number;
  holdMs: number;
  /** A shove on the skin as [u, v, dx, dy, radius]. */
  jolt?: [number, number, number, number, number];
  lean?: [number, number];
}

const step = (face: FaceName, fadeMs: number, holdMs: number, extra: Partial<ActStep> = {}): ActStep => ({
  face, fadeMs, holdMs, ...extra,
});

/** Acts that only start after 30 to 45 seconds without input. Any input ends them. */
export const IDLE_ACTS: Record<string, ActStep[]> = {
  yawn: [step('half', 140, 300), step('yawn', 170, 1300), step('happy', 150, 600)],
  sneeze: [
    step('half', 130, 400),
    step('sneeze', 60, 700, {jolt: [0.5, 0.55, 0, 1.4, 0.3]}),
    step('dizzy', 110, 700),
    step('happy', 140, 500),
  ],
  flirt: [step('happy', 130, 500), step('winkr', 80, 420), step('kiss', 120, 560), step('hearts', 120, 900), step('rest', 160, 300)],
  cheeky: [step('winkl', 90, 340), step('tongue', 110, 900), step('happy', 120, 620)],
  doze: [
    step('half', 450, 700, {lean: [0.006, 0.006]}),
    step('closed', 320, 1800, {lean: [0.015, 0.015]}),
    step('shock', 50, 650, {jolt: [0.5, 0.5, 0, -0.9, 0.3]}),
  ],
  wow: [step('stars', 130, 1000), step('happy', 140, 640)],
  sad: [step('scared', 140, 500), step('cry', 240, 1500), step('rest', 200, 400)],
  silly: [step('dizzy', 110, 1000), step('puff', 120, 700), step('laugh', 90, 800)],
};

export const IDLE_ACT_ORDER = ['yawn', 'cheeky', 'flirt', 'sneeze', 'doze', 'wow', 'silly', 'sad'];

export type Zone = 'brow' | 'eyeL' | 'eyeR' | 'nose' | 'mouth' | 'cheek' | 'chin';

/** Tap reactions: a face name, or an act to play. */
export const TAP_REACTIONS: Record<Zone, {face?: FaceName; act?: string}> = {
  brow: {face: 'angry'},
  eyeL: {face: 'ouch'},
  eyeR: {face: 'ouch'},
  nose: {act: 'sneeze'},
  mouth: {face: 'tongue'},
  cheek: {face: 'puff'},
  chin: {face: 'laugh'},
};

/** Hover reactions (the eyes keep following the cursor everywhere else). */
export const HOVER_REACTIONS: Partial<Record<Zone, FaceName>> = {
  eyeL: 'winkl',
  eyeR: 'winkr',
  mouth: 'kiss',
};

/** Which part of the face is under (u, v) of the picture. Returns null outside the head. */
export function zoneAt(u: number, v: number): Zone | null {
  const a = (u - 0.5) / 0.42;
  const b = (v - 0.45) / 0.36;
  if (a * a + b * b > 1.3) return null;
  if (v < 0.3) return 'brow';
  const onEyeRow = Math.abs(v - 0.43) < 0.07;
  if (onEyeRow && u > 0.22 && u < 0.45) return 'eyeL';
  if (onEyeRow && u > 0.55 && u < 0.78) return 'eyeR';
  if (Math.abs(u - 0.5) < 0.06 && v < 0.54) return 'nose';
  if (v > 0.54 && v < 0.66 && Math.abs(u - 0.5) < 0.12) return 'mouth';
  return v > 0.68 ? 'chin' : 'cheek';
}

/** Face while the visitor drags the skin: pull distance moves her from shock to ouch to scared. */
export function faceWhileDragging(pull: number): FaceName {
  if (pull > 0.24) return 'scared';
  if (pull > 0.1) return 'ouch';
  return 'shock';
}

/** Face just after a drag is released. 5 pulls in 14 seconds make her angry, 8 make her cry. */
export function faceAfterDrag(pull: number, recentPulls: number): {face: FaceName; ms: number} {
  const face = recentPulls >= 8 ? 'cry' : recentPulls >= 5 ? 'angry' : pull > 0.22 ? 'dizzy' : pull > 0.1 ? 'ouch' : 'shock';
  return {face, ms: recentPulls >= 5 ? 2600 : 700 + pull * 2800};
}
