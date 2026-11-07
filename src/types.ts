/** Name of one aligned cat picture (see data/catAssets.ts). */
export type FaceName = string;

export interface Service {
  title: string;
  description: string;
}

export interface CatFact {
  label: string;
  value: string;
  /** Face the cat makes while the visitor hovers this fact. */
  hoverFace?: FaceName;
}

export interface Project {
  name: string;
  category: string;
  description: string;
  tagline: string;
  features: string[];
  /** Gradient used behind the project visuals. */
  colors: [string, string];
  darkTheme?: boolean;
  /** Three cat pictures used for the three visuals of the card. */
  faces: [FaceName, FaceName, FaceName];
}

export interface MarqueeTile {
  face: FaceName;
  label: string;
  background: string;
}

export interface CatMoodDetail {
  face: FaceName;
  ms: number;
}
