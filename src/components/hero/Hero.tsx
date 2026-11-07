import {FadeIn} from '../ui/FadeIn';
import {MagneticButton} from '../ui/MagneticButton';
import {Navbar} from '../layout/Navbar';
import {LivingCatPortrait} from './LivingCatPortrait';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});

export function Hero() {
  return (
    <section className="relative flex h-screen flex-col overflow-x-clip" data-section="hero">
      <Navbar />

      <FadeIn y={20} className="mt-6 text-center md:mt-8">
        <span className="font-heading text-xs font-medium tracking-[0.3em] text-deep md:text-sm">
          THE INTERNET&apos;S MOST IMPORTANT CAT
        </span>
      </FadeIn>

      <FadeIn delay={0.15} y={40}>
        <h1
          className="font-heading mt-2 w-full whitespace-nowrap text-center font-black uppercase leading-none tracking-tight cat-gradient-text"
          style={{fontSize: 'clamp(2.5rem, 11.5vw, 12vw)'}}
        >
          HELLO, HUMAN.
        </h1>
      </FadeIn>

      <FadeIn delay={0.3} y={20}>
        <p className="font-heading text-center text-[3.2vw] font-semibold uppercase tracking-wide text-ginger md:text-[1.6vw]">
          Too cute to be ignored.
        </p>
      </FadeIn>

      <FadeIn delay={0.6} y={30}>
        <LivingCatPortrait />
      </FadeIn>

      <div className="relative z-20 mt-auto flex items-end justify-between gap-4 px-6 pb-7 md:px-10 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <div className="max-w-[170px] uppercase leading-snug tracking-wide text-cocoa md:max-w-[280px]" style={{fontSize: 'clamp(0.7rem, 1.2vw, 1.2rem)'}}>
            Professional napper. Part-time troublemaker. Full-time icon.
            <span className="mt-2 block normal-case opacity-70">An extraordinary talent trapped inside an ordinary cat body.</span>
            <span className="mt-2 block font-medium text-deep">Currently busy doing absolutely nothing.</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <div className="flex flex-col items-end gap-2 md:flex-row">
            <MagneticButton onClick={() => scrollTo('services')}>Explore my empire</MagneticButton>
            <MagneticButton variant="ghost" mood="shock" onClick={() => scrollTo('about')}>Meet the legend</MagneticButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
