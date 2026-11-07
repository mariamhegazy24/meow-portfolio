import type {CatMoodDetail, FaceName} from '../types';

/** One shared event bus, so the hero portrait and the little section cat never disagree. */
export function catMood(face: FaceName, ms = 1200): void {
  window.dispatchEvent(new CustomEvent<CatMoodDetail>('cat:mood', {detail: {face, ms}}));
}

export function catToast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>('cat:toast', {detail: message}));
}

/** Face the small cat makes when each section is on screen. */
export const SECTION_FACES: Record<string, FaceName> = {
  about: 'right',
  services: 'happy',
  projects: 'stars',
  contact: 'half',
};
