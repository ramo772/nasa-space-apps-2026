# Challenge and MVP brief

**Status:** Approved product direction; implementation requires an approved GitHub issue and acceptance criteria

**Challenge:** Space Mission Design Game

**Official challenge URL:** <https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/>

**Team/submission identity:** The Odyssey of a Meat-a-roid

## The problem in one sentence

Beginners rarely get to experience how spacecraft, power, mass, communications, propulsion, time and mission objectives affect one another across a complete mission.

## Who benefits and why it matters

The primary audience is a learner with little or no space background. The game turns abstract systems-engineering trade-offs into visible, replayable decisions and gives the learner language to explain why a mission works or fails.

The intended learning outcome is narrow and testable:

> After one playthrough, the learner can explain at least one causal mission trade-off in plain language.

## Product promise

Build a mission, see how every choice affects the system, and understand why the result works or fails.

## Story premise

Dr. Nadir operates a near-future Orbital Workshop assembled from a purpose-built servicing core and certified compatible modules using fictional ISAM-enabled operations. During an automated transfer test he falls asleep, the workshop executes the wrong saved transfer profile, and he wakes in an unexpected high elliptical Earth orbit.

The player is a rookie mission designer helping Nadir and RIVO configure a feasible return mission.

The workshop is fictional. The enabling concepts are inspired by NASA's In-Space Servicing, Assembly, and Manufacturing work. No claim should imply that NASA currently operates this workshop or that arbitrary orbital debris can be safely reused.

## Core experience

1. Choose reading support and challenge mode.
2. Assemble or inspect a small set of compatible workshop modules.
3. Witness the wrong-orbit incident.
4. Make three or four connected return-mission decisions.
5. Receive immediate visible, numeric and audio feedback.
6. Simulate the return plan.
7. Review the complete causal chain, sources, simplifications and result.
8. Retry with a different design.

Target play time: 8–12 minutes.

## Difficulty model

Difficulty changes complexity and assistance, never scientific truth.

| Mode | Variables | Support |
|---|---:|---|
| Guided | 2 | Plain-language previews, full hints and unlimited retries |
| Standard | 3 | Partial previews and consequence explanations |
| Systems | 4 | Tighter constraints, fewer hints and visible calculations |

Ask for an optional age/reading band rather than an exact birth date. Do not store or send the age band to an AI provider. Send only a non-identifying reading-mode enum if narration must adapt.

## Play modes

### Must-have

Solo play with one complete deterministic loop.

### Nice-to-have after the solo loop is stable

Same-device cooperative play with shared resources and rotating roles:

- Mission Director
- Systems Engineer
- Science Lead
- Communications Officer

### Out of scope for the hackathon MVP

- Real-time online multiplayer
- Accounts, lobbies or matchmaking
- Open world exploration
- Realistic n-body physics
- Custom 3D asset pipeline
- AI-generated scientific rules or numbers

## AI boundary

AI is an optional narrator, not the scientist or simulation engine.

AI may:

- adapt wording to a reading mode;
- vary original dialogue and humor;
- phrase hints from supplied verified facts;
- narrate an approved event selected from a fixed allowlist.

AI may not:

- create or modify scientific numbers;
- create physical relationships;
- decide mission success;
- change units;
- cite unregistered sources;
- receive unnecessary personal information.

The game remains fully playable through curated templates when AI is unavailable.

## Relevant NASA evidence

Use only authoritative sources registered in docs/research/source-register.md.

Current story-enabling sources, registered as unverified leads DATA-021 to DATA-023:

- NASA In-Space Servicing, Assembly, and Manufacturing: <https://www.nasa.gov/isam/>
- NASA 2026 ISAM State of Play overview: <https://www.nasa.gov/humans-in-space/commercial-space/nasas-isam-state-of-play-the-industry-standard-for-space-servicing-assembly-and-manufacturing/>
- NASA SSPICY inspection demonstration: <https://www.nasa.gov/centers-and-facilities/ames/nasas-sspicy-mission-to-demonstrate-in-space-inspection-technologies/>

The exact gameplay dataset, variables, units, thresholds and equations remain blocked on the official challenge resources (expected on 2026-11-13; date unverified, see OPEN-05 in docs/technical/decisions.md) and a source review. A proposal for review, not an approved model, is in docs/research/mission-model-proposal.md. No implementation may invent them.

## Must-have — maximum three

1. One complete, replayable mission-design loop with three or four sourced variables and deterministic consequences.
2. A highly polished Orbital Workshop interface using the approved identity, character and accessibility contracts.
3. A transparent evidence layer distinguishing NASA sources, simplified game rules, fictional framing and player results.

## Nice-to-have

- AI narration with schema validation and template fallback.
- Same-device cooperative roles.
- English/Arabic localization after English is complete.
- Shareable result card that contains no unsupported scientific claims.

## Success conditions

- Directly addresses the Space Mission Design Game challenge.
- Works from a clean browser without AI or live NASA availability.
- Uses at least one authoritative NASA resource at the center of the rules, not as decoration.
- Same inputs always produce the same result.
- Every scientific value has a unit, source ID and documented transformation.
- A beginner can complete one loop without external explanation.
- At least three users can explain one mission trade-off after playing.
- No secrets, copyrighted film material or unsupported NASA affiliation appears.
- Core controls work by keyboard and all meaningful audio is captioned.
- Demo, source drawer, fallback and restart all work offline or from bundled snapshots.

## Award posture

Primary targets:

1. Best Mission Concept
2. Art & Technology

Supporting strengths:

3. Best Storytelling
4. Best Use of Science
5. Most Inspirational

Best Use of Data is conditional on the official challenge resources and final dataset integration. Global Connection and Local Impact require evidence beyond product claims. See docs/product/award-strategy.md.

## Implementation gate

This brief authorizes planning, not application code. Before implementation:

1. verify the official 2026 challenge resources and rules;
2. register the selected NASA sources;
3. approve one feature issue with acceptance criteria;
4. approve the implementation plan;
5. work on a branch and submit a reviewed PR.
