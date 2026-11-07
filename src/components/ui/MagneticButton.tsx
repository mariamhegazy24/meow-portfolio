import {PointerEvent, ReactNode, useRef} from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  variant?: 'solid' | 'ghost';
  onClick?: () => void;
  /** Face the cat makes while this button is hovered. */
  mood?: string;
}

const STYLES = {
  solid: 'bg-espresso text-cream hover:bg-deep',
  ghost: 'border-2 border-espresso text-espresso hover:bg-espresso/10',
};

/** Pill button that leans toward the pointer. */
export function MagneticButton({children, variant = 'solid', onClick, mood = 'hearts'}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const lean = (e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - box.left - box.width / 2) / 6}px, ${(e.clientY - box.top - box.height / 2) / 6}px)`;
  };

  return (
    <button
      ref={ref}
      data-cat-mood={mood}
      onClick={onClick}
      onPointerMove={lean}
      onPointerLeave={() => ref.current && (ref.current.style.transform = '')}
      className={`font-heading font-medium uppercase tracking-widest rounded-full px-8 py-3 md:px-12 md:py-4 text-xs sm:text-sm md:text-base transition-all duration-500 ${STYLES[variant]}`}
    >
      {children}
    </button>
  );
}
