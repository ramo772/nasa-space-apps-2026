# The Odyssey of a Meat-a-roid: the game

A browser game for the NASA Space Apps Challenge. Dr. Nadir and RIVO are stranded in the wrong orbit, and the player designs the way home. It plays with no AI, no account and no live NASA connection.

## Run it

    npm install
    npm run dev

Open <http://127.0.0.1:5183>.

## Checks

    npm test            # rules, content and stage logic
    npm run typecheck
    npm run build
    npx playwright install chromium
    npm run e2e         # the full mission in a browser

## Where things are

| Path | What it holds |
|---|---|
| `src/content/scenarios/return-home-v1.json` | Every mission value, with its unit, source, transformation and limitation |
| `src/content/sources.json` | The source records shown in the game's source drawer |
| `src/i18n/` | All words: English is canonical, and Arabic is a draft awaiting review |
| `src/content/script.ts` | The story's structure: who speaks, with which face, and which words |
| `src/domain/` | The mission rules: pure functions with no UI |
| `src/app/` | The game's state machine and player settings |
| `src/scenes/`, `src/components/` | The screens, in semantic HTML |
| `src/visual/` | The 3D workshop, and its flat fallback |
| `src/audio/` | All sound, synthesized in the browser |
| `public/characters/` | Art cut from the approved sheets |

## Rules for changing it

- All words go in `src/i18n/en.ts` and `src/i18n/ar.ts`. Tests fail if a key or placeholder is missing.
- Use CSS logical properties, so right-to-left keeps working.
- Mission numbers belong in the scenario pack. Don't put them in components or copy.
- The rule table is `docs/research/rule-table-draft.md`, and `tests/domain/rules.test.ts` holds the game to it. Change both together.
- Colors come from `design/tokens.json`. `npm test` fails on hard-coded colors in the stylesheets.
- Don't redesign Nadir or RIVO. See `docs/design/characters.md`.
