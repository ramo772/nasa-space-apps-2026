# Implementation plan — The Odyssey of a Meat-a-roid

**Status:** Detailed handoff plan; not authorization to implement without an approved feature issue

**Date:** 2026-11-07

**Intended consumer:** Team developers and Claude Opus

## 1. Objective

Build a polished 8–12 minute browser game in which a beginner helps Dr. Nadir and RIVO design a feasible return mission from an unexpected Earth orbit.

The player should finish the game able to explain at least one mission-system trade-off in plain language.

The result must feel like a designed game:

- one coherent world;
- original characters;
- meaningful choices;
- immediate feedback;
- story and simulation connected;
- sound and motion with purpose;
- visible scientific evidence;
- reliable restart and fallback.

It must not feel like a dashboard generated from a prompt.

## 2. Fixed product decisions

These decisions are approved:

- Challenge: Space Mission Design Game.
- Identity: The Odyssey of a Meat-a-roid, Orbital Workshop direction.
- Characters: Dr. Nadir and RIVO.
- Story: near-future ISAM-inspired workshop; wrong saved transfer; return-home mission.
- Audience: beginner first.
- Play time: 8–12 minutes.
- Solo is mandatory.
- Same-device cooperative roles are optional after the solo loop is stable.
- Online multiplayer is out of scope.
- Difficulty changes assistance and variable count, not scientific truth.
- Simulation is deterministic.
- AI may narrate approved facts and results but cannot create science, values or outcomes.
- Game works without NASA network access and without AI.
- Primary award posture: Best Mission Concept and Art & Technology.
- Audio implementation starts after the first validated vertical slice (DEC-005).

## 3. Blocked decisions

Do not resolve these by guessing:

- whether pre-event implementation is permitted (DEC-006);
- exact NASA gameplay dataset/resource;
- exact variables, units and numeric values;
- equations, thresholds and event effects;
- source licensing/attribution requirements;
- final deployment provider;
- final AI provider;
- final English/Arabic scope.

Resolve the scientific items only after the official challenge resources are available and registered.

## 4. Implementation preconditions

Before editing application code:

1. Fetch and read the approved GitHub feature issue and comments.
2. Verify current event and challenge rules.
3. Read docs/product/challenge-and-mvp.md.
4. Read docs/product/award-strategy.md.
5. Read docs/technical/architecture.md.
6. Read docs/design/identity.md.
7. Read docs/design/characters.md.
8. Read docs/design/audio-and-comedy.md.
9. Read design/tokens.json.
10. Read docs/research/source-register.md and the chosen original NASA resources.
11. Keep game/ unchanged and build under app/ (DEC-003).
12. Create a branch; do not implement directly on main.

If the issue, science model or pre-event permission is missing, stop before application code and report the specific blocker.

## 5. Acceptance criteria

### Core game

- A new user can start and complete the solo game without external explanation.
- One complete loop takes 8–12 minutes.
- The loop contains a setup, disruption, three meaningful decisions, simulation, result and retry.
- At least three variables interact; Guided mode may expose two at once.
- Every decision has a benefit and a cost.
- Same state and choices always produce the same result.
- Player can retry with a visibly different outcome.

### Science and trust

- Every scientific value has a unit and source ID.
- Every simplified relationship has an explanation and limitation.
- NASA fact, simplified game rule, fictional story and player result are visibly distinct.
- No AI output changes a number, source, rule or success result.
- The source drawer opens from every scientific consequence.
- A bundled reviewed snapshot supports the full demo offline.

### Identity and game feel

- UI uses design/tokens.json rather than improvised colors.
- Nadir and RIVO match approved character sheets.
- Workshop remains the spatial frame across gameplay.
- Each decision triggers visual, numeric and audio feedback.
- Character reaction never obscures the scientific explanation.
- No generic glass cards over a random space background.
- No copyrighted movie character, dialogue, sound or music.

### Reliability

- Clean install and build succeed.
- Core rule tests pass.
- Critical Playwright flow passes.
- AI-off mode passes.
- Offline snapshot mode passes.
- Restart clears prior result state.
- No secret appears in the client bundle or repository.

### Accessibility

- Complete loop is keyboard accessible.
- Focus is visible.
- Meaning is not conveyed by color alone.
- Dialogue and meaningful effects have captions.
- Reduced-motion mode works.
- Music, voice and effects have independent controls.

## 6. Experience design

### 6.1 Opening — 20 to 30 seconds, skippable

Purpose: establish character, location and tone without explaining the whole game.

Sequence:

1. Workshop wakes through lights and relay sounds.
2. Nadir finishes an orbital-transfer test setup.
3. RIVO asks whether the full system has been validated.
4. Nadir confidently points to one green module.
5. A second module quietly changes to orange.
6. Nadir enters the test capsule and asks RIVO to wake him if anything becomes scientifically interesting.
7. Cut to onboarding.

Quality requirements:

- no exposition paragraph;
- no cutscene longer than 30 seconds;
- captions on by default;
- skip button visible immediately;
- one original comic beat only.

### 6.2 Onboarding

Ask:

1. Reading support: younger/plain, standard, detailed.
2. Challenge mode: Guided, Standard, Systems.
3. Play mode: Solo; local cooperative appears only if implemented and tested.
4. Audio and reduced-motion preferences.

Do not request name, exact age, email or account.

Visual:

- RIVO presents the choices on the mission table.
- Nadir reacts subtly to difficulty selection.
- Show a one-line explanation of what changes.

### 6.3 Workshop assembly prologue

Purpose: teach that a good component choice can create another constraint.

Interaction:

- Show three certified compatible module choices at one time.
- Player selects a small workshop configuration or inspects an existing one.
- Hover/focus previews benefit, cost and affected variables.
- Selection physically docks the module into the workshop illustration.
- Resource connectors draw from the module to shared meters.
- A source/simplification chip is always available.

Do not implement drag-and-drop as the only interaction. Provide click and keyboard selection plus a dock button.

The selected modules seed the starting state after the accident.

### 6.4 Wrong-orbit incident

Use the approved key-art composition as direction, not as an interactive screenshot.

Sequence:

1. Brief time transition.
2. Capsule opens.
3. Nadir sees Earth at the wrong apparent scale.
4. RIVO projects the actual orbital path.
5. The orange wrong-turn node appears.
6. One silent Nadir reaction.
7. RIVO states the mission goal in plain language.
8. Player takes control within 20 seconds.

Required distinction:

- “Unexpected high elliptical Earth orbit” is fictional story state.
- Any displayed orbital value must come from the approved scenario pack.

### 6.5 Mission diagnosis

Purpose: show the player what they have, what they need and why every choice matters.

Layout:

- center: workshop and orbital path;
- left: mission goal and current phase;
- right: shared resource constellation;
- bottom: RIVO consequence panel;
- top: four-phase journey indicator.

The player may inspect:

- current resources;
- selected workshop modules;
- mission objective;
- known constraints;
- source and simplification drawer.

No decision is made on this screen.

### 6.6 Decision phases

Use three mandatory phases. Systems mode may add a fourth.

Each phase follows the same interaction rhythm:

1. RIVO states the decision in one sentence.
2. Show two or three real alternatives.
3. Preview affected variables without revealing all later events.
4. Player confirms.
5. Workshop changes physically.
6. Meters display exact deltas.
7. Causal connectors animate.
8. Nadir reacts.
9. RIVO explains the main trade-off.
10. Source/simplification link remains available.

Do not use a “correct answer” button. Every choice must trade one advantage for another.

Candidate phase types, pending science review:

- communications or data-handling configuration;
- power allocation;
- propulsion/transfer strategy;
- optional contingency or science-return decision.

### 6.7 Simulation

The simulation is a short deterministic sequence, not real-time piloting.

Use three checkpoints:

1. transfer preparation;
2. constrained orbital operation or communications window;
3. final return condition.

At each checkpoint:

- show what the engine calculated;
- show which earlier choice caused it;
- use one workshop/environment response;
- allow pause and inspect;
- do not ask for twitch controls.

### 6.8 Mission review

This is the scientific and emotional payoff.

Show:

- feasible, partial or infeasible result;
- complete causal graph from choices to outcome;
- resource history;
- one strongest decision;
- one trade-off to reconsider;
- NASA sources;
- simplified rules and limitations;
- fictional elements;
- retry button;
- optional shareable summary without unsupported claims.

Never reduce the result to a single score.

### 6.9 Retry

Return to the first decision or module selection without replaying the opening.

Highlight:

- previous choices;
- one changed choice;
- how the downstream path differs.

The second run should be faster than the first.

## 7. Creative quality bar

### 7.1 Visual composition

- Treat the workshop as a stage with foreground, interaction plane and background.
- Preserve consistent object positions between screens.
- Use depth through layered parallax, lighting and occlusion—not uncontrolled 3D camera movement.
- Keep interactive elements inside a stable visual grammar.
- Reserve cream surfaces for readable information.
- Reserve cyan for navigation/data connections.
- Reserve orange for player choice. Keyboard focus follows docs/design/identity.md and design/tokens.json.
- Reserve coral for actual warnings.
- Reserve green for verified satisfied conditions.

### 7.2 Character acting

Create production derivatives from approved sheets:

Dr. Nadir:

- confident;
- listening;
- suppressed panic;
- calculation;
- delighted discovery;
- exhausted disbelief;
- quiet apology;
- relief.

RIVO:

- neutral;
- curious;
- deadpan;
- warning;
- connection found;
- source available;
- quiet pride.

Do not generate a new character look per scene.

### 7.3 Motion language

- 120 ms for control response.
- 220 ms for ordinary state transition.
- 360 ms for deliberate mission consequence.
- Character reactions may take longer only when skippable.
- Orbit lines draw in direction of travel.
- Connectors pulse once, then settle.
- Meter deltas count once and remain readable.
- Avoid constant floating UI and decorative motion.

### 7.4 Audio language

- one tactile sound per decision;
- one quiet resource delta cue;
- one RIVO status tone;
- one character vocal reaction only at selected beats;
- ambient workshop bed;
- no continuous alarm;
- no copied film sounds;
- all important cues captioned.

### 7.5 Anti-generic checklist

Reject a screen if:

- it could belong to any SaaS dashboard;
- characters are decorative stickers;
- the background is a random space image;
- every panel uses the same glass effect;
- a choice changes only a number;
- a science label has no source;
- visual hierarchy depends on neon glow;
- animation hides values;
- AI text is longer than the player's decision;
- the screen introduces a new color or component style.

## 8. Science model process

### 8.1 Paper model first

Before UI implementation, write a one-page rule table:

- mission goal;
- three or four variables;
- initial values and units;
- two or three options per decision;
- exact deltas;
- conditional rules;
- success, partial and failure states;
- source ID for every value;
- simplification and limitation.

Play the model on paper with at least two people.

Reject:

- a dominant option that is always best;
- a choice that never affects the result;
- a result that depends on hidden randomness;
- five or more active variables;
- an unsourced number;
- a real field used for an unrelated fictional relationship.

### 8.2 Scenario pack

Create one versioned scenario pack only.

Suggested path:

    app/src/content/scenarios/return-home-v1.json

Keep sources separate:

    app/src/content/sources.json

Create schema:

    app/src/content/scenario.schema.ts

Do not put rule values inside React components.

### 8.3 Rule engine

Suggested pure modules:

    app/src/domain/types.ts
    app/src/domain/rules.ts
    app/src/domain/simulate.ts
    app/src/domain/explain.ts
    app/src/domain/validate.ts

Rules accept state + choice and return:

- next immutable state;
- exact deltas;
- causal events;
- validation messages;
- source IDs.

UI never calculates mission science.

## 9. Technical project structure

Recommended new application structure:

    app/
      package.json
      vite.config.ts
      tsconfig.json
      src/
        app/
          App.tsx
          routes.ts
          gameReducer.ts
          gameState.ts
        domain/
          types.ts
          rules.ts
          simulate.ts
          explain.ts
          validate.ts
        content/
          scenario.schema.ts
          scenarios/
          sources.json
          narration/
        components/
          Button/
          Card/
          ResourceMeter/
          DecisionCard/
          ConsequencePanel/
          SourceDrawer/
          CaptionBar/
          AudioControls/
        scenes/
          OpeningScene/
          OnboardingScene/
          WorkshopScene/
          IncidentScene/
          DiagnosisScene/
          DecisionScene/
          SimulationScene/
          ReviewScene/
        characters/
          Nadir/
          Rivo/
        visual/
          OrbitMap/
          CausalGraph/
          WorkshopLayers/
        audio/
          audioManager.ts
          captions.ts
        ai/
          types.ts
          client.ts
          fallback.ts
        styles/
          tokens.css
          global.css
          motion.css
      tests/
        domain/
        content/
        e2e/
      public/
        identity/
        characters/
        workshop/
        audio/

If the old game/ directory remains, do not delete or overwrite it. Use app/ until the owner explicitly approves archive/removal.

## 10. UI component contracts

### ResourceMeter

Inputs:

- label
- icon
- exact value
- unit
- min/max
- safe/warning/critical state
- delta
- source IDs

Requirements:

- textual value always visible;
- icon and text accompany color;
- delta animation runs once;
- final value announced to assistive technology.

### DecisionCard

Inputs:

- choice ID
- title
- plain description
- benefit summary
- cost summary
- preview deltas allowed by difficulty
- compatibility state

Requirements:

- focusable;
- selectable by keyboard;
- no drag-only action;
- explicit confirm step;
- cannot show unsupported “recommended” badges.

### ConsequencePanel

Displays:

- what changed;
- why;
- exact deltas;
- source/game-rule/result classification;
- RIVO face state;
- optional Nadir reaction.

### SourceDrawer

Displays:

- source title and provider;
- canonical link;
- field or table used;
- original unit;
- transformation;
- simplification;
- limitation;
- access date.

### CausalGraph

Displays:

- choices as orange nodes;
- validated relationships as cyan connectors;
- warnings as coral nodes;
- satisfied rules as green nodes;
- keyboard-readable ordered list alternative.

## 11. AI narration implementation

AI is an optional enhancement and should be implemented only after the full non-AI loop passes.

### Request

Send:

- scenario ID and version;
- phase;
- reading-mode enum;
- speaker ID;
- approved tone enum;
- approved facts;
- engine result summary;
- allowed source IDs;
- allowed face states.

Never send:

- exact age;
- personal profile;
- secret;
- free-form user prompt;
- scientific task asking the model to calculate.

### Response schema

Accept only:

- speaker;
- one or two short lines;
- caption;
- approved face-state ID;
- existing source IDs;
- no numeric authority fields.

### Validation

- reject unknown keys;
- reject unknown source IDs;
- reject unsupported numbers;
- reject more than two lines;
- reject HTML;
- escape text;
- timeout quickly;
- retry once only for transient errors;
- use fallback template on any failure.

### Transparency

Label AI text as AI-written narration in the evidence/about area. Do not place an “AI” badge beside every line if it distracts from play.

## 12. Local cooperative mode

Implement only if all must-have acceptance criteria pass by the scope checkpoint.

Reuse solo state. Add:

- role assignment screen;
- role badge for the current decision;
- 30-second discussion prompt;
- propose/confirm sequence;
- shared resources;
- role rotation.

Do not add:

- networking;
- private hands;
- simultaneous mutation;
- chat;
- accounts;
- matchmaking.

## 13. Test plan

### Unit tests

- scenario schema accepts approved pack;
- schema rejects missing unit/source;
- each decision option produces expected deltas;
- simulation is deterministic;
- every causal event references a real choice or rule;
- every result classification is reachable;
- values remain inside defined bounds;
- difficulty does not alter scientific relationships;
- restart returns to correct baseline.

### Property/invariant tests

- no NaN or Infinity;
- no resource silently changes;
- identical input produces identical output;
- all displayed units match source transformations;
- AI response cannot mutate MissionState;
- no unknown source ID reaches UI.

### Component tests

- keyboard selection;
- visible focus;
- value and unit;
- color plus icon/text status;
- drawer opens and restores focus;
- caption bar works when audio muted.

### End-to-end tests

1. Guided solo success.
2. Standard solo alternative result.
3. Retry changing one decision.
4. AI unavailable fallback.
5. Offline snapshot.
6. Keyboard-only completion.
7. Reduced-motion completion.
8. Narrow layout.

### Manual quality review

- no clipping at 1366×768;
- no unreadable text over art;
- no long AI narration;
- sound levels balanced;
- one complete demo from a clean browser;
- source links and limitations readable;
- visual identity matches approved board;
- no copyrighted resemblance.

## 14. User testing

Test with at least three people who are not on the implementation team.

Before play, ask:

> If you choose a more capable instrument or system, what else in a mission might change?

After play, ask:

> Name one choice you made and explain two things it affected.

Record:

- completion time;
- points of confusion;
- whether the player found the source drawer;
- whether they understood NASA fact vs game rule;
- whether they wanted to retry;
- their explanation of one trade-off.

Do not collect unnecessary personal information.

## 15. Work breakdown

### Epic A — science and content

Deliverables:

- source review;
- source-register entries;
- paper rule table;
- scenario schema;
- one reviewed scenario pack;
- limitations;
- rule test fixtures.

Done when:

- every value is traceable;
- no dominant choice;
- two-person paper test completed;
- technical reviewer approves.

### Epic B — domain engine

Deliverables:

- types;
- reducer/state machine;
- deterministic rules;
- simulation;
- causal events;
- result classification;
- unit tests.

Done when:

- all combinations tested;
- deterministic replay passes;
- no UI dependency.

### Epic C — visual shell

Deliverables:

- token-to-CSS bridge;
- responsive workshop stage;
- shared components;
- source drawer;
- orbit map;
- causal graph;
- accessibility foundation.

Done when:

- one decision phase is polished end-to-end;
- keyboard and reduced motion work;
- visual review passes.

### Epic D — story, character and audio

Deliverables:

- concise script;
- approved character derivatives;
- workshop layers;
- opening and incident scenes;
- reaction states;
- captions;
- audio manager and original/licensed sounds.

Done when:

- scenes are skippable;
- character identity is consistent;
- no critical information is audio-only.

### Epic E — full loop integration

Deliverables:

- onboarding;
- prologue;
- incident;
- diagnosis;
- decisions;
- simulation;
- review;
- retry.

Done when:

- complete clean-browser loop works;
- second run differs;
- offline fallback works.

### Epic F — optional AI narration

Deliverables:

- provider-neutral endpoint;
- prompt version;
- strict schema;
- validators;
- fallback;
- error/rate-limit handling;
- transparency copy.

Done when:

- AI-off remains identical scientifically;
- invalid model outputs never reach UI;
- no secret in client.

### Epic G — optional local co-op

Deliverables:

- roles;
- propose/confirm flow;
- role rotation;
- shared-state copy.

Done when:

- solo is unaffected;
- one-device playtest succeeds.

### Epic H — QA and submission

Deliverables:

- automated checks;
- performance pass;
- accessibility pass;
- three beginner tests;
- demo script;
- fallback video/screenshots;
- source and asset credits;
- limitations statement.

## 16. Six-person team split

1. **Product/science lead:** source approval, rules, learning outcome, pitch truth.
2. **Domain engineer:** state machine, rule engine, tests.
3. **Frontend/gameplay engineer:** scenes, interaction, responsive behavior.
4. **Visual/motion designer:** production assets, workshop layers, motion QA.
5. **Story/audio owner:** script, captions, original dialogue, sound provenance.
6. **Integration/QA owner:** E2E, accessibility, performance, deployment, submission backup.

Every owner must integrate continuously; no workstream may wait until the final hours to merge.

## 17. Forty-eight-hour execution plan

### Hours 0–3

- verify rules and official resources;
- choose one NASA source;
- register it;
- finalize one mission objective;
- approve three or four variables;
- create issue/branch;
- paper-test rules.

Exit gate: no code until the one-page rule table is approved.

### Hours 3–8

- scaffold app;
- create tokens bridge;
- implement domain types and scenario schema;
- implement rules with tests;
- create static workshop stage.

Exit gate: command-line rule simulation passes.

### Hours 8–14

- implement onboarding;
- implement one decision phase;
- connect exact deltas and causal events;
- add source drawer;
- add keyboard and reduced motion foundation.

Exit gate: one polished decision works end to end.

### Hours 14–22

- complete remaining decisions;
- add incident and simulation;
- add mission review and retry;
- integrate production character/workshop derivatives.

Exit gate: full solo loop works without AI.

### Hours 22–30

- motion and audio polish;
- captions;
- responsive layout;
- causal graph;
- fallback snapshots;
- first external user test.

Exit gate: clean-browser demo and one successful retry.

### Hours 30–36

- fix user-test confusion;
- performance pass;
- source/limitation copy;
- optional AI narration only if all must-haves pass.

Scope checkpoint: cut AI immediately if it destabilizes the loop.

### Hours 36–40

- optional same-device co-op only if solo and AI-off are stable;
- otherwise invest time in polish and testing.

### Hours 40–44

- accessibility review;
- browser/device review;
- final external user tests;
- science and identity review.

### Hours 44–48

- freeze features;
- record backup demo;
- prepare screenshots;
- finalize README, credits, limitations and pitch;
- run all checks from a clean environment;
- submit early.

## 18. Scope-cut order

Cut in this order:

1. local co-op;
2. live AI narration;
3. Arabic localization;
4. shareable result card;
5. optional fourth decision;
6. nonessential character animations.

Never cut:

- deterministic rules;
- source transparency;
- full solo loop;
- retry;
- fallback;
- core accessibility;
- identity consistency.

## 19. Definition of done

- Approved issue acceptance criteria met.
- One complete solo loop works.
- Science model and sources reviewed.
- Rule, content and E2E checks pass.
- Visual identity review passes.
- No secrets or copyrighted film assets.
- AI-off and offline-snapshot modes work.
- At least three beginner user tests completed.
- Demo video and screenshots ready.
- Limitations stated honestly.
- PR reviewed and merged.
- Board updated only after status verification.

## 20. Claude Opus handoff

Give Claude Opus this repository and the following instruction:

    You are implementing The Odyssey of a Meat-a-roid.

    First read AGENTS.md, docs/00-start-here.md, the current approved GitHub
    feature issue and comments, docs/product/challenge-and-mvp.md,
    docs/product/award-strategy.md, docs/product/implementation-plan.md,
    docs/technical/architecture.md, docs/design/identity.md,
    docs/design/characters.md, docs/design/audio-and-comedy.md,
    design/tokens.json, docs/research/source-register.md, and every original
    NASA source selected by the approved issue.

    Do not write application code if the issue, official challenge resources,
    approved scenario rule table, source registrations, or pre-event
    permission are missing. Report the blocker instead of inventing content.

    Implement the smallest complete solo vertical slice first. Use React,
    TypeScript and Vite; pure TypeScript for the deterministic rule engine;
    semantic DOM for interaction and text; CSS/SVG for the 2.5D workshop;
    Vitest for domain/content tests; Playwright for the critical browser flow.

    Preserve the canonical identity. Do not redesign Dr. Nadir, RIVO, the
    palette, logo, resource language or comedy style. Do not use a generic
    dashboard, random space background, excessive glassmorphism or a full 3D
    engine. The workshop must visibly react to choices.

    Scientific facts, values, units, relationships, success conditions and
    source IDs come only from the approved scenario pack and deterministic
    engine. AI is optional narration only. The game must work without AI and
    without live NASA access. Never expose a paid key in the client.

    Build in this order: scenario schema and rule tests; one polished decision
    phase; complete solo loop; source drawer and causal review; story/motion/
    audio polish; accessibility and fallback; optional AI; optional local
    co-op. Stop adding features at the scope checkpoints in the plan.

    Use the available edit tool, preserve unrelated changes, run relevant tests,
    and report exact verification results. Do not commit, push, delete the old
    prototype, create issues, or update the project board without explicit
    authorization.

This handoff is not a substitute for the approved issue. The issue supplies the final science model, acceptance criteria and ownership.

