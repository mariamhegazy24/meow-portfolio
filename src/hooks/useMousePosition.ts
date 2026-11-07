import {useEffect, useRef} from 'react';

/** Latest pointer position, kept in a ref so reading it never re-renders React. */
export function useMousePosition() {
  const position = useRef({x: 0, y: 0});
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      position.current.x = e.clientX;
      position.current.y = e.clientY;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return position;
}
