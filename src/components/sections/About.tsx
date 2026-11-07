import {Bone, Crown, Fish, PawPrint} from 'lucide-react';
import type {ReactNode} from 'react';
import {catFacts} from '../../data/catFacts';
import {catMood, catToast} from '../../data/events';
import {FactCard} from '../ui/FactCard';
import {FadeIn} from '../ui/FadeIn';
import {RevealText} from '../ui/RevealText';
import {SectionHeading} from '../ui/SectionHeading';

interface DecorationProps {
  position: string;
  delay: number;
  fromX: number;
  mood?: string;
  onClick?: () => void;
  children: ReactNode;
}

/** A floating corner object that enters from the edge of the viewport. */
function Decoration({position, delay, fromX, mood, onClick, children}: DecorationProps) {
  return (
    <FadeIn delay={delay} x={fromX} y={0} className={`absolute ${position}`}>
      <div className="bob text-ginger" data-cat-mood={mood} onClick={onClick}>{children}</div>
    </FadeIn>
  );
}

export function About() {
  return (
    <section id="about" data-section="about" className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-5 py-20 sm:px-8 md:gap-14 md:px-10">
      <Decoration position="top-[4%] left-[2%] md:left-[4%]" delay={0.1} fromX={-80}>
        <Fish size={96} strokeWidth={1.2} />
      </Decoration>
      <Decoration position="bottom-[8%] left-[4%] md:left-[10%]" delay={0.25} fromX={-80} mood="stars">
        <Bone size={88} strokeWidth={1.2} className="text-pink" />
      </Decoration>
      <Decoration
        position="top-[4%] right-[2%] md:right-[4%]"
        delay={0.15}
        fromX={80}
        onClick={() => {
          catMood('stars', 2000);
          catToast('YOUR MAJESTY APPRECIATES YOUR ATTENTION.');
        }}
      >
        <Crown size={96} strokeWidth={1.2} className="cursor-pointer text-deep" />
      </Decoration>
      <Decoration position="bottom-[8%] right-[4%] md:right-[10%]" delay={0.3} fromX={80}>
        <PawPrint size={92} strokeWidth={1.2} className="text-pink" />
      </Decoration>

      <SectionHeading>
        The legend<br />behind the paws.
      </SectionHeading>

      <RevealText
        className="max-w-[560px] text-center font-medium leading-relaxed text-cocoa"
        text="Some call me dramatic. I prefer the term artistically expressive. Born to be admired. Forced to live with humans. While others chase success, I chase laser pointers."
      />

      <div className="grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
        {catFacts.map((fact, i) => (
          <FactCard key={fact.label} fact={fact} index={i} />
        ))}
      </div>
    </section>
  );
}
