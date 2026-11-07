# Character art provenance

These files are cut directly from the approved character sheets. They are not redrawn.

| Files | Source | How they were made |
|---|---|---|
| `nadir-*.webp` | `assets/identity/characters/dr-nadir-character-sheet.png` | Cropped by `app/scripts/extract-character-art.mjs` |
| `nadir-pose.webp` | Same sheet, main pose | Same script, with the navy backdrop removed |
| `rivo-*.webp` | `assets/identity/characters/rivo-character-sheet.png` | Cropped by the same script |

The sheets were generated with OpenAI's image tool on 2026-11-06 from the prompts in `assets/identity/`. The project submission must describe this use of AI tools.

`nadir-body`, `nadir-arm`, `nadir-leg-*`, `nadir-head` and `nadir-head-*` are the same art split into puppet layers by `app/scripts/extract-nadir-puppet.mjs`.

The player avatars are original vector drawings in `app/src/components/Avatar.tsx`, not generated images.

RIVO's 3D model is built in `app/src/visual/Rivo.tsx` from the same sheet, and shows these face states on its display.
