import {MotionValue, motion, useTransform} from 'framer-motion';
import type {ReactNode} from 'react';
import {catSrc} from '../../data/catAssets';
import type {Project} from '../../types';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  /** Scroll progress (0 to 1) of the whole stack. */
  progress: MotionValue<number>;
}

interface PanelProps {
  project: Project;
  height: string;
  children: ReactNode;
}

function Panel({project, height, children}: PanelProps) {
  const [from, to] = project.colors;
  return (
    <div
      className={`relative overflow-hidden rounded-[32px] md:rounded-[50px] ${project.darkTheme ? 'text-cream' : 'text-espresso'}`}
      style={{height, background: `linear-gradient(135deg, ${from}, ${to})`}}
    >
      {children}
    </div>
  );
}

/** Sticky card. Cards that are already stacked scale down slightly as the next one arrives. */
export function ProjectCard({project, index, total, progress}: ProjectCardProps) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);
  const [face1, face2, face3] = project.faces;

  return (
    // The WRAPPER is sticky (one full screen tall), so every card pins to the top and the next one slides over it.
    <div className="sticky top-0 flex h-screen items-start justify-center pt-20 md:pt-24">
      <motion.div
        style={{scale, marginTop: index * 28, transformOrigin: 'top center'}}
        className="w-full rounded-[40px] md:rounded-[60px] border-2 border-peach bg-ivory p-4 sm:p-6 md:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <span className="font-heading font-black text-ginger" style={{fontSize: 'clamp(2.5rem, 7vw, 100px)', lineHeight: 1}}>
              0{index + 1}
            </span>
            <div>
              <div className="text-xs uppercase tracking-widest text-deep">{project.category}</div>
              <div className="font-heading font-black text-2xl md:text-5xl">{project.name}</div>
            </div>
          </div>
          <div className="font-heading text-sm italic text-cocoa max-w-[240px]">{project.tagline}</div>
        </div>

        <div className="flex gap-3 md:gap-4">
          <div className="flex w-[40%] flex-col gap-3 md:gap-4">
            <Panel project={project} height="clamp(110px, 13vw, 190px)">
              <img
                src={catSrc(face1, 480)}
                alt=""
                loading="lazy"
                className="absolute bottom-0 left-1/2 h-[115%] -translate-x-1/2 object-contain transition-transform duration-500 hover:scale-105"
              />
            </Panel>
            <Panel project={project} height="clamp(140px, 18vw, 270px)">
              <div className="p-5 md:p-8 text-xs md:text-lg">
                <div className="font-heading font-bold mb-2 md:mb-4">FEATURES</div>
                {project.features.map((feature) => (
                  <div key={feature} className="py-1 border-b border-current/20">{feature}</div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="w-[60%]">
            <Panel project={project} height="clamp(260px, 33vw, 470px)">
              <p className="absolute left-5 top-4 max-w-[55%] text-xs font-medium md:left-8 md:top-8 md:text-lg">{project.description}</p>
              <img
                src={catSrc(face2, 640)}
                alt=""
                loading="lazy"
                className="absolute bottom-0 left-[6%] h-[96%] object-contain transition-transform duration-500 hover:-rotate-2"
              />
              <img src={catSrc(face3, 480)} alt="" loading="lazy" className="absolute bottom-0 right-[-4%] h-[60%] object-contain" />
            </Panel>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
