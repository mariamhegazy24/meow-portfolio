import type {FaceName} from '../types';

/** Every picture is the same cat, pixel-aligned, transparent. One is shown at a time. */
export const FACES = [
  'rest', 'right', 'left', 'up', 'down', 'half', 'closed',
  'angry', 'winkl', 'winkr', 'cheeky', 'stars', 'sneeze', 'ouch', 'yawn',
  'cry', 'kiss', 'puff', 'tongue', 'hearts', 'dizzy', 'laugh', 'shock',
  'shock2', 'scared', 'happy',
] as const;

export const FRAME_SIZE = {width: 640, height: 768} as const;

export function catSrc(face: FaceName, width: 640 | 480 = 640): string {
  return `/assets/cat/${width}/${face}.webp`;
}
