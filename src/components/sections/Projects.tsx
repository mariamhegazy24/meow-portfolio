import {useScroll} from 'framer-motion';
import {useRef} from 'react';
import {projects} from '../../data/projects';
import {ProjectCard} from '../ui/ProjectCard';
import {SectionHeading} from '../ui/SectionHeading';

export function Projects() {
  const stack = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({target: stack, offset: ['start start', 'end end']});

  return (
    <section id="projects" data-section="projects" className="px-3 pt-20 md:px-6 md:pt-32">
      <div className="mb-14">
        <SectionHeading subtitle="Proof that greatness comes in small, fluffy packages.">My masterpieces.</SectionHeading>
      </div>
      <div ref={stack} className="mx-auto max-w-6xl">
        {projects.map((project, i) => (
          <ProjectCard key={project.name} project={project} index={i} total={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
