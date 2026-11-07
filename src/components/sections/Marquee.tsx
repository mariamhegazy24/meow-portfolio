import {useLayoutEffect, useRef, useState} from 'react';
import {catSrc} from '../../data/catAssets';
import {marqueeTiles} from '../../data/marquee';
import {useScrollOffset} from '../../hooks/useScrollProgress';
import type {MarqueeTile} from '../../types';

// Half of the expressions on each strip.
const SPLIT = Math.ceil(marqueeTiles.length / 2);
const firstRow = marqueeTiles.slice(0, SPLIT);
const secondRow = marqueeTiles.slice(SPLIT);

function TileCard({tile}: {tile: MarqueeTile}) {
  return (
    <div
      className="relative h-[200px] w-[300px] shrink-0 overflow-hidden rounded-2xl md:h-[270px] md:w-[420px]"
      style={{background: tile.background}}
    >
      <img src={catSrc(tile.face, 480)} alt="" loading="lazy" className="absolute bottom-0 left-1/2 h-[110%] -translate-x-1/2 object-contain" />
      <span className="absolute left-4 top-3 font-heading text-xs font-bold tracking-widest text-espresso md:text-sm">{tile.label}</span>
    </div>
  );
}

/** One strip. The tiles are repeated 3 times and the position wraps by one copy's width, so the loop has no gap and no jump. */
function MarqueeRow({tiles, offset, direction}: {tiles: MarqueeTile[]; offset: number; direction: 'left' | 'right'}) {
  const group = useRef<HTMLDivElement>(null);
  const [loopWidth, setLoopWidth] = useState(0);

  useLayoutEffect(() => {
    const el = group.current;
    if (!el) return;
    const measure = () => setLoopWidth(el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const travelled = loopWidth ? ((offset % loopWidth) + loopWidth) % loopWidth : 0;
  const x = direction === 'right' ? travelled - loopWidth : -travelled;

  return (
    <div className="flex" style={{transform: `translateX(${x}px)`, willChange: 'transform'}}>
      {[0, 1, 2].map((copy) => (
        <div key={copy} ref={copy === 0 ? group : undefined} className="flex shrink-0 gap-3 pr-3" aria-hidden={copy > 0}>
          {tiles.map((tile) => (
            <TileCard key={tile.face} tile={tile} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Two strips of expressions that move in opposite directions with the page scroll. */
export function Marquee() {
  const section = useRef<HTMLElement>(null);
  const offset = useScrollOffset(section, 0.4);

  return (
    <section ref={section} className="overflow-hidden pb-10 pt-24 sm:pt-32 md:pt-40">
      <div className="mb-3">
        <MarqueeRow tiles={firstRow} offset={offset} direction="right" />
      </div>
      <MarqueeRow tiles={secondRow} offset={offset} direction="left" />
    </section>
  );
}