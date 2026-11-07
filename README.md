# The Cat — interactive portfolio

    npm install
    npm run dev        # development
    npm run build      # type-check + production build

## Structure
- `src/data/` content (services, projects, facts, marquee) and `catAssets.ts` (the face list), `events.ts` (cat:mood / cat:toast bus)
- `src/components/interactions/`
  - `SoftSheetPhysics.ts` damped-wave sheet, fixed 1/240s step, untangle pass
  - `PortraitRenderer.ts` WebGL (shaders, textures, cleanup)
  - `LivingPortrait.ts` which picture to show: gaze, blink, tap, hover, drag, idle acts
  - `EyeTracking.ts`, `CatBehavior.ts` (zones, reactions, idle acts), `CatCursor`, `CatReactions` (small section cat), `Toast`
- `src/components/{hero,sections,layout,ui}/`, `src/hooks/`
- `public/assets/cat/{640,480}/*.webp` aligned transparent frames; `public/assets/manifest.json`

Gaze has 4 directions plus half/closed lids (diagonals use the dominant axis plus head lean).
To add frames: add the name to `FACES` in `data/catAssets.ts`, then use it in `CatBehavior.ts`.
