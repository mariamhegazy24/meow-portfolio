import {catMood} from '../../data/events';
import type {Service} from '../../types';
import {FadeIn} from './FadeIn';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export function ServiceCard({service, index}: ServiceCardProps) {
  return (
    <FadeIn delay={(index % 4) * 0.1}>
      <div
        className="group flex gap-5 md:gap-10 py-8 md:py-10 border-t border-cream/15 hover:pl-4 transition-all duration-500"
        onPointerEnter={() => catMood(index % 2 ? 'happy' : 'stars', 1500)}
      >
        <span
          className="font-heading font-black text-ginger group-hover:text-pink transition-colors duration-300"
          style={{fontSize: 'clamp(3rem, 9vw, 120px)', lineHeight: 1}}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <h3 className="font-heading font-medium uppercase" style={{fontSize: 'clamp(1rem, 2.2vw, 2.1rem)'}}>
            {service.title}
          </h3>
          <p className="font-light leading-relaxed max-w-2xl opacity-70 mt-2" style={{fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)'}}>
            {service.description}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
