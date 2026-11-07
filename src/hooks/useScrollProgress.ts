import {RefObject, useEffect, useState} from 'react';

/** How far the page has scrolled past the bottom of the viewport edge of an element, scaled by `factor`. */
export function useScrollOffset(ref: RefObject<HTMLElement>, factor = 0.3): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const update = () => {
      const top = ref.current?.offsetTop ?? 0;
      setOffset((window.scrollY - top + window.innerHeight) * factor);
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref, factor]);
  return offset;
}
