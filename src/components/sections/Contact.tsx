import {catMood, catToast} from '../../data/events';
import {Footer} from '../layout/Footer';
import {FadeIn} from '../ui/FadeIn';
import {MagneticButton} from '../ui/MagneticButton';

export function Contact() {
  return (
    <section id="contact" data-section="contact" className="flex flex-col items-center gap-8 rounded-t-[40px] bg-blush px-5 py-24 text-center md:rounded-t-[60px] md:py-40">
      <FadeIn>
        <h2 className="font-heading font-black uppercase leading-none tracking-tight text-espresso" style={{fontSize: 'clamp(2.6rem, 10vw, 150px)'}}>
          Important business.<br />Very serious cat.
        </h2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className="max-w-xl text-lg text-cocoa">
          Have an important matter to discuss? Please approach with caution and snacks.
          <br />
          I am currently accepting treats, compliments, and premium cardboard boxes.
        </p>
      </FadeIn>
      <FadeIn delay={0.2}>
        <div className="flex flex-wrap justify-center gap-3">
          <MagneticButton
            mood="happy"
            onClick={() => {
              catMood('laugh', 2200);
              catToast('MEOW! YOUR MESSAGE HAS BEEN RECEIVED. HUMAN.');
            }}
          >
            Say meow
          </MagneticButton>
          <MagneticButton
            variant="ghost"
            mood="stars"
            onClick={() => {
              catMood('hearts', 2200);
              catToast('TREATS ACCEPTED. YOU MAY NOW LEAVE.');
            }}
          >
            Send treats
          </MagneticButton>
        </div>
      </FadeIn>
      <Footer />
    </section>
  );
}
