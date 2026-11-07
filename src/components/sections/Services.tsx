import {services} from '../../data/services';
import {SectionHeading} from '../ui/SectionHeading';
import {ServiceCard} from '../ui/ServiceCard';

export function Services() {
  return (
    <section id="services" data-section="services" className="rounded-t-[40px] bg-espresso px-5 py-20 text-cream sm:px-8 md:rounded-t-[60px] md:px-10 md:py-32">
      <div className="mb-16 md:mb-24">
        <SectionHeading tone="text-ginger" subtitle="Exceptional talent. Unreasonable prices. Payment accepted in treats.">
          My paw-fessional services.
        </SectionHeading>
      </div>
      <div className="mx-auto max-w-5xl">
        {services.map((service, i) => (
          <ServiceCard key={service.title} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
