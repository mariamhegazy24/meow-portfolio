import {useEffect} from 'react';
import {catMood} from '../data/events';

/**
 * Any element with data-cat-mood="face" makes the cat pull that face while hovered,
 * and a happy face when the pointer leaves. One listener for the whole page.
 */
export function useHoverMoods(): void {
  useEffect(() => {
    const find = (e: Event) => (e.target as HTMLElement).closest<HTMLElement>('[data-cat-mood]');
    const onOver = (e: PointerEvent) => {
      const el = find(e);
      if (el?.dataset.catMood) catMood(el.dataset.catMood, 1e5);
    };
    const onOut = (e: PointerEvent) => {
      if (find(e)) catMood('happy', 700);
    };
    window.addEventListener('pointerover', onOver);
    window.addEventListener('pointerout', onOut);
    return () => {
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerout', onOut);
    };
  }, []);
}
