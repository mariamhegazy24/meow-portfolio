import type {CatFact} from '../../types';
import {FadeIn} from './FadeIn';

export function FactCard({fact, index}: {fact: CatFact; index: number}) {
  return (
    <FadeIn delay={index * 0.05} y={20}>
      <div
        data-cat-mood={fact.hoverFace}
        className="h-full rounded-3xl border border-peach/60 bg-ivory p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-blush"
      >
        <div className="text-xs uppercase tracking-widest text-deep">{fact.label}</div>
        <div className="font-heading font-bold text-lg md:text-xl mt-2 leading-tight">{fact.value}</div>
      </div>
    </FadeIn>
  );
}
