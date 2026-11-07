import {motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {catSrc} from '../../data/catAssets';
import {SECTION_FACES} from '../../data/events';
import type {CatMoodDetail, FaceName} from '../../types';

/**
 * The small cat in the corner. It listens to the same 'cat:mood' events as the big portrait
 * and shows a face for the section on screen, so the two never conflict.
 */
export function CatReactions() {
  const [face, setFace] = useState<FaceName | null>(null);
  const sectionFace = useRef<FaceName | null>(null);

  useEffect(() => {
    let timeout = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          sectionFace.current = SECTION_FACES[(entry.target as HTMLElement).dataset.section ?? ''] ?? null;
          setFace(sectionFace.current);
        }
      },
      {threshold: 0.35},
    );
    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));

    const onMood = (e: Event) => {
      const {face: next, ms} = (e as CustomEvent<CatMoodDetail>).detail;
      setFace(next);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setFace(sectionFace.current), ms);
    };
    window.addEventListener('cat:mood', onMood);
    return () => {
      observer.disconnect();
      window.removeEventListener('cat:mood', onMood);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!face) return null;
  return (
    <motion.img
      key={face}
      initial={{scale: 0.7, opacity: 0}}
      animate={{scale: 1, opacity: 1}}
      src={catSrc(face, 480)}
      alt=""
      className="pointer-events-none fixed bottom-3 left-3 z-40 w-20 drop-shadow-xl md:w-28"
    />
  );
}
