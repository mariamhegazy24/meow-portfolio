import {PawPrint} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {useMousePosition} from '../../hooks/useMousePosition';

const FOLLOW_SPEED = 0.2;

/** Paw cursor that eases toward the pointer and grows over clickable things. Disabled on touch devices. */
export function CatCursor() {
  const [enabled, setEnabled] = useState(false);
  const element = useRef<HTMLDivElement>(null);
  const pointer = useMousePosition();

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    setEnabled(true);
    let x = 0, y = 0, scale = 1, targetScale = 1, frame = 0;

    const onOver = (e: PointerEvent) => {
      targetScale = (e.target as HTMLElement).closest('a, button, [data-cat-mood]') ? 1.8 : 1;
    };
    const loop = () => {
      x += (pointer.current.x - x) * FOLLOW_SPEED;
      y += (pointer.current.y - y) * FOLLOW_SPEED;
      scale += (targetScale - scale) * FOLLOW_SPEED;
      if (element.current) element.current.style.transform = `translate(${x - 12}px, ${y - 12}px) scale(${scale}) rotate(-20deg)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('pointerover', onOver);
    loop();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointerover', onOver);
    };
  }, [pointer]);

  if (!enabled) return null;
  return (
    <div ref={element} className="pointer-events-none fixed left-0 top-0 z-[100]">
      <PawPrint size={24} fill="#E99A55" className="text-deep" />
    </div>
  );
}
