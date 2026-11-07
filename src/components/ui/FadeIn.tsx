import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  className?: string;
}

/** Fades and slides its children in once, when they scroll into view. */
export function FadeIn({children, delay = 0, x = 0, y = 30, className}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{opacity: 0, x, y}}
      whileInView={{opacity: 1, x: 0, y: 0}}
      viewport={{once: true, margin: '50px'}}
      transition={{duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1]}}
    >
      {children}
    </motion.div>
  );
}
