# Architecture and integration boundaries

**Status:** Approved planning architecture; implementation requires an approved feature issue

**Date:** 2026-11-07

## Architectural goals

1. One polished deterministic mission loop before optional features.
2. Scientific values and outcomes remain inspectable and testable.
3. AI failure never prevents play or changes the simulation.
4. The visual implementation follows the canonical identity instead of generating a new style.
5. The demo runs from a clean browser with bundled fallback content.

## Recommended stack

- **Frontend:** React + TypeScript + Vite.
- **State:** one typed reducer/state machine; no large state library unless implementation proves a need.
- **Visual layer:** semantic DOM for controls and text, CSS for layout and motion, SVG for orbital paths and causal graphs, optional Canvas only for restrained particles or background effects.
- **Rules:** pure TypeScript functions with no UI or network dependencies.
- **Content:** versioned JSON scenario packs validated at startup.
- **Validation:** JSON Schema or Zod at all content and AI boundaries.
- **Tests:** Vitest for rules and schemas; Playwright for the critical browser flow.
- **Audio:** Web Audio or HTML audio with independent voice/music/effects controls.
- **Optional AI:** server-only or serverless endpoint with a provider-agnostic adapter.

The workshop is a controlled 3D/2D hybrid (DEC-008, DEC-009): React Three Fiber with fixed camera shots and no free movement. Controls and scientific text stay in semantic HTML outside the canvas. The 3D scene loads separately, and a flat SVG workshop takes over if it is loading, fails, or WebGL is unavailable.

## System context

    Player
      ↓
    React game shell
      ├── onboarding and accessibility preferences
      ├── story and workshop presentation
      ├── scenario selector
      ├── deterministic rule engine
      ├── evidence/source drawer
      └── local cooperative role controller
              ↓
        validated scenario pack
              ├── source IDs
              ├── allowed variables and units
              ├── module choices
              ├── deterministic rules
              ├── allowed events
              └── curated fallback narration

    Optional narration request
      ↓
    server-side AI endpoint
      ├── receives non-identifying mode + approved facts/results
      ├── produces text fields only
      ├── validates schema, source IDs and allowed values
      └── returns fallback template on any error

## Trust boundary

### Rule engine owns

- initial state;
- resource calculations;
- allowed choices;
- variable ranges and units;
- event effects;
- feasibility;
- win/lose/result classification;
- causal chain;
- source IDs.

### AI owns only

- phrasing;
- reading-level adaptation;
- original Nadir/RIVO dialogue;
- hints constructed from supplied facts;
- narrative variation for an already approved event.

The AI response cannot contain authoritative numeric fields. If narration includes a number, it must exactly match a value supplied by the rule engine and pass validation.

## Core domain model

### ScenarioPack

- id and version
- title and fictional framing
- supported difficulty modes
- source IDs
- variables with units, bounds and display precision
- compatible module choices
- deterministic rule table
- allowed event IDs
- win/lose/partial-success conditions
- curated narration fallback
- explanation and limitation text

### MissionState

- scenario ID and content version
- reading mode and difficulty
- solo or local-coop mode
- current phase
- selected modules and choices
- current resource values
- causal events
- validation messages
- final result

### SourceRecord

- source ID
- title
- provider
- canonical URL
- retrieval or publication date
- fields used
- original units
- transformation
- limitations
- license/attribution status

### NarrationRequest

- scenario ID and content version
- reading-mode enum
- phase and allowed tone
- character speaker
- approved facts and result summary
- allowed source IDs
- no name, exact age, email, free-form profile or secret

### NarrationResponse

- speaker
- line
- optional caption
- optional approved face-state ID
- source IDs echoed from the request only
- provider and prompt-version metadata stored for debugging

## Game state machine

1. boot
2. onboarding
3. workshop module selection
4. wrong-orbit story beat
5. mission diagnosis
6. decision phase 1
7. decision phase 2
8. decision phase 3
9. optional decision phase 4 for Systems mode
10. simulation
11. mission review
12. retry or exit

Every transition is explicit. Refresh recovery may restore only non-sensitive local game state.

## Difficulty and age/reading support

- Ask for an optional age/reading band and a separate difficulty selection.
- Keep age/reading preference in memory or local storage only.
- Send only a reading-mode enum to the narration endpoint.
- Difficulty changes variable count, hint visibility and constraint margin.
- Scientific values and relationships remain consistent across modes.

## Solo and cooperative play

Solo is the default and only must-have.

Same-device cooperative mode reuses the same MissionState:

- one shared set of resources;
- rotating role prompt;
- visible proposed choice;
- one explicit confirm action;
- no hidden authoritative state;
- no network synchronization.

Online multiplayer, accounts, lobbies, presence and conflict resolution are out of scope.

## NASA data and scenario pipeline

1. Read official challenge resources after publication.
2. Select one authoritative resource and one mission objective.
3. Register sources in docs/research/source-register.md.
4. Extract only required fields.
5. Normalize units once in a documented script or build step.
6. Save a reviewed, key-free snapshot.
7. Convert the snapshot into a versioned scenario pack.
8. Validate schema, bounds, missing values and source coverage.
9. Review every simplified rule and record assumptions.
10. Build the feature against the snapshot.
11. Add a live call only if it materially improves the project.

Fallback order:

1. reviewed bundled snapshot;
2. cached good response if a live source is later added;
3. clearly labelled sample scenario.

No screen may become blank because NASA or AI is unavailable.

## AI narration pipeline

1. Rule engine completes a phase and produces an approved fact/result payload.
2. Client requests optional narration from the server endpoint.
3. Server applies a versioned system prompt and strict response schema.
4. Server rejects unknown fields, unknown source IDs, unapproved face states and unsupported numbers.
5. Server retries at most once for a transient error.
6. On timeout, rate limit, invalid output or missing configuration, return the curated fallback.
7. UI labels generated content as AI-written narration and never as a NASA fact.

The paid-provider key must never appear in browser code, committed files, screenshots or fallback JSON.

## Creative implementation boundary

The game must not become a dashboard with characters pasted onto it.

Required game feel:

- workshop objects respond to decisions;
- resource changes animate and settle on exact values;
- Nadir and RIVO change pose or face state at important beats;
- orbital path and causal connectors visibly update;
- every decision has immediate visual, numeric and audio feedback;
- transitions preserve spatial continuity inside the workshop;
- scientific text remains legible and accessible over decorative effects.

Avoid:

- generic glassmorphism;
- random nebula backgrounds;
- excessive particle effects;
- long unskippable cutscenes;
- AI-generated layouts that ignore the token system;
- static concept-board PNGs used as interactive screens;
- decorative controls with no effect.

## Asset pipeline

Approved boards and character sheets are references, not final interactive sprites.

Production asset tasks:

- export transparent Nadir poses from the approved character identity;
- export RIVO face/tilt states;
- separate workshop into foreground, midground and background layers;
- optimize key art and backgrounds to WebP/AVIF;
- retain PNG originals as source artifacts;
- create captions and provenance records for audio;
- use SVG sources for logos and resource icons.

Do not overwrite approved sources. Add production derivatives with documented prompts, creator and license.

## Performance budgets

- Initial JavaScript target: under 350 KB gzip, excluding unavoidable framework runtime only if documented.
- Initial media target: under 3 MB.
- Lazy-load later story art and audio.
- Target smooth 60 fps motion on an ordinary hackathon laptop.
- Avoid continuous animations when the tab is hidden or reduced motion is enabled.
- Target first meaningful interaction within 3 seconds on a typical event connection.

## Accessibility

- Keyboard access for every decision and source panel.
- Visible focus state using canonical focus tokens.
- Minimum 44 px controls.
- Captions for dialogue and meaningful effects.
- Independent audio controls.
- Reduced-motion mode.
- Text/icon alternative for color status.
- Final values remain visible after animation.

## Privacy and security

- No exact date of birth.
- No user account for MVP.
- No prompt should contain personal information.
- No paid key in the client.
- Rate-limit the narration endpoint.
- Limit request size and allowed enum values.
- Escape or render AI text as plain text, never trusted HTML.
- Log no sensitive user content.

## Verification

### Rule tests

- deterministic replay;
- every allowed choice combination;
- resource bounds;
- units and rounding;
- win, partial and lose conditions;
- causal-chain completeness;
- difficulty consistency.

### Content tests

- schema validation;
- every source ID exists;
- every displayed scientific value has a unit;
- every simplification has a limitation;
- no unapproved event or module.

### AI tests

- unavailable provider;
- timeout;
- invalid JSON;
- unknown source ID;
- invented number;
- disallowed field;
- prompt injection in free text is impossible because free text is not accepted;
- fallback always succeeds.

### Browser tests

- complete solo loop;
- restart with a different design;
- keyboard-only path;
- reduced motion;
- muted audio plus captions;
- clean browser/offline snapshot;
- 1366×768 and 1920×1080;
- narrow tablet layout.

## Implementation gates

No code implementation begins until:

1. official challenge resources are available and reviewed;
2. one dataset/resource and rule table are approved;
3. an issue with acceptance criteria exists;
4. pre-event implementation permission is confirmed by the official terms or organizers (DEC-006); `game/` stays as it is and new work goes under `app/` (DEC-003);
5. the recommended stack is accepted;
6. a branch is created.
