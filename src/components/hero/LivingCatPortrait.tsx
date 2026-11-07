import {useEffect, useRef} from 'react';
import {FRAME_SIZE, catSrc} from '../../data/catAssets';
import {LivingPortrait} from '../interactions/LivingPortrait';

/** WebGL portrait. If WebGL is unavailable, the plain picture stays visible as the fallback. */
export function LivingCatPortrait() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!wrap.current || !canvas.current || !fallback.current) return;
    const portrait = LivingPortrait.create(wrap.current, canvas.current, fallback.current);
    return () => portrait?.dispose();
  }, []);

  return (
    <div ref={wrap} className="hero-portrait-wrap">
      <div className="hero-portrait-inner">
        <img
          ref={fallback}
          src={catSrc('rest')}
          width={FRAME_SIZE.width}
          height={FRAME_SIZE.height}
          alt="The cat, wearing white round glasses and a pink polka-dot headscarf"
        />
        <canvas ref={canvas} id="faceGl" aria-hidden="true" />
      </div>
    </div>
  );
}
