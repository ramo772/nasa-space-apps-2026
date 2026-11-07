# 3D workshop spike

**Status:** Disposable. Do not ship or import this into `app/`. Its numbers come from the unapproved `docs/research/rule-table-draft.md`.

**Question:** does a controlled 3D workshop improve game feel enough to replace the SVG stage in `app/`? See DEC-008.

## Run

    npm install
    npm run dev

Open <http://127.0.0.1:5184>.

## What it covers

One room, one fixed camera, one solar-array choice, and one power consequence. The array unfolds outside the window, and the engine conduit, engine ring and table bar respond to the power. Controls and explanations are HTML outside the canvas. It uses Three.js primitives only: no downloaded models, and no Nadir or RIVO.

## Results, 2026-11-07

| Criterion | SVG stage (`app/`) | 3D spike | Target |
|---|---:|---:|---|
| JavaScript loaded first (gzip) | 72 KB | 71 KB | Under 350 KB |
| Total JavaScript (gzip) | 72 KB | 317 KB | No separate target |
| Frame rate on this laptop's AMD Radeon | Not measured | 60 fps, slowest frame 16.8 ms | Smooth 60 fps |
| Frame rate with software rendering | Not measured | 19 fps during animation | No target |
| Keyboard choice | No controls yet | Passes | Required |
| WebGL unavailable | Not applicable | Flat view, choice still works | Required |
| Scene download fails | Not applicable | Flat view, choice still works | Required |
| Reduced motion | Passes | Same final values, no animation | Required |
| 1366×768 and 390×844 | Passes | Passes | Required |

The scene renders only while something moves, so an idle screen costs almost nothing. The numbers above were measured on one laptop. Nobody on the team has compared the two side by side yet.

## Costs if 3D stays

- Three.js uses most of the total budget, so later 3D code and models must stay small.
- Nadir and RIVO have only 2D sheets, and nobody owns 3D versions. Cutouts in the 3D room would keep the approved designs.
- `docs/technical/architecture.md` needs updating, because it rules out a full 3D engine for the MVP.

## Decision

Pending a side-by-side team review. Record the outcome in `docs/technical/decisions.md`.
