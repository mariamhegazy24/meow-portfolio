import type {ReactNode} from 'react';
import {FadeIn} from './FadeIn';

interface SectionHeadingProps {
  children: ReactNode;
  subtitle?: string;
  /** 'gradient' for light sections, or a Tailwind text color class for dark ones. */
  tone?: 'gradient' | string;
}

export function SectionHeading({children, subtitle, tone = 'gradient'}: SectionHeadingProps) {
  const color = tone === 'gradient' ? 'cat-gradient-text' : tone;
  return (
    <div className="text-center">
      <FadeIn>
        <h2
          className={`font-heading font-black uppercase leading-none tracking-tight ${color}`}
          style={{fontSize: 'clamp(2.6rem, 10vw, 150px)'}}
        >
          {children}
        </h2>
      </FadeIn>
      {subtitle && (
        <FadeIn delay={0.1}>
          <p className="mt-6 text-cocoa opacity-90">{subtitle}</p>
        </FadeIn>
      )}
    </div>
  );
}
