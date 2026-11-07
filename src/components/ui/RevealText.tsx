import {MotionValue, motion, useScroll, useTransform} from 'framer-motion';
import {useRef} from 'react';

interface CharProps {
  char: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function Char({char, index, total, progress}: CharProps) {
  const opacity = useTransform(progress, [index / total, (index + 1) / total], [0.2, 1]);
  return <motion.span style={{opacity}}>{char}</motion.span>;
}

/** Character-by-character reveal driven by scroll. */
export function RevealText({text, className}: {text: string; className?: string}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const {scrollYProgress} = useScroll({target: ref, offset: ['start 0.8', 'end 0.2']});
  const chars = Array.from(text);
  return (
    <p ref={ref} className={className}>
      {chars.map((char, i) => (
        <Char key={i} char={char} index={i} total={chars.length} progress={scrollYProgress} />
      ))}
    </p>
  );
}
