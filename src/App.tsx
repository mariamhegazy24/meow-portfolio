import {Hero} from './components/hero/Hero';
import {CatCursor} from './components/interactions/CatCursor';
import {CatReactions} from './components/interactions/CatReactions';
import {Toast} from './components/interactions/Toast';
import {About} from './components/sections/About';
import {Contact} from './components/sections/Contact';
import {Marquee} from './components/sections/Marquee';
import {Projects} from './components/sections/Projects';
import {Services} from './components/sections/Services';
import {useHoverMoods} from './hooks/useHoverMoods';

export default function App() {
  useHoverMoods();
  return (
    <main className="overflow-x-clip bg-cream">
      <CatCursor />
      <Hero />
      <Marquee />
      <About />
      <Services />
      <Projects />
      <Contact />
      <CatReactions />
      <Toast />
    </main>
  );
}
