# The Odyssey of a Meat-a-roid — identity v1

**Status:** Canonical identity v1

**Effective date:** 2026-11-07

**Design owner:** Team/TL until a named design owner is recorded

**Canonical tokens:** `design/tokens.json`

**Canonical visual board:** `assets/identity/identity-board-v1.png`

This document is the implementation contract for the game's identity. Concept PNGs communicate direction; SVG assets, tokens, accessibility rules, and approved copy control production UI.

## Brand foundation

- **Name:** The Odyssey of a Meat-a-roid
- **Descriptor:** A comic mission-design game about choices, constraints, and consequences.
- **Core line:** **Every choice changes the mission.**
- **Player role:** A rookie mission designer helping an inventor return home.
- **Game promise:** Build a mission, see how every choice affects the system, and understand why the result works or fails.
- **Emotional progression:** Curiosity → comic surprise → systems insight → confident retry.

The name is carried by the wordmark. The identity does not use literal food, meatball imagery, or characters from commercial films.

## Story kernel

Dr. Nadir is testing an automated orbital-transfer system inside his Orbital Workshop. Exhausted, he falls asleep in the test capsule and wakes in an unexpected high elliptical Earth orbit. RIVO calmly reports the consequences. The player must help redesign a feasible return mission.

This premise is fictional framing. Scientific values and cause-and-effect rules must be sourced, simplified transparently, and labelled separately from fiction.

## Character pair

### Dr. Nadir

An original Egyptian mission-systems inventor: brilliant, kind, overconfident, sleep-deprived, and physically expressive. He is the emotional comic lead and embodies the danger of optimizing one component without checking the whole system.

His fixed visual anchors are:

- compact energetic build;
- warm brown skin;
- short salt-and-pepper curls;
- expressive dark eyebrows;
- narrow moustache and small separated chin patch;
- navy orbital utility jumpsuit with cream panels;
- asymmetrical orange shoulder reinforcement;
- cyan piping, magnetic boots, calculation visor, and diagonal modular tool harness.

Do not give him a lab coat, necktie, giant round glasses, or an appearance derived from an existing actor or animated scientist.

### RIVO

The **Resource Integration and Validation Orb**. RIVO is a small hovering spherical assistant with a cream shell, navy seams, orange bumpers, cyan light channels, a black curved display face, two retractable utility arms, and a cyan hover ring.

RIVO is calm where Nadir is impulsive. RIVO explains one relationship at a time, distinguishes evidence from game rules, and never mocks the player.

Detailed character and acting rules live in `docs/design/characters.md`.

## Comedy identity

The comedy comes from the relationship between confidence and consequence—not from copying another film's jokes.

Approved mechanisms:

- confident prediction followed by a small harmless contradiction;
- three-beat escalation;
- RIVO's precise interpretation of casual instructions;
- visual callbacks using the floating wrench, coffee bulb, magnetic boot, and warning node;
- a silent reaction before dialogue;
- Nadir trying to hide a mistake that RIVO has already logged;
- scientific terminology translated into an ordinary physical comparison.

Avoid humiliation, cruelty, slapstick injury, copied dialogue, recognizable catchphrases, or imitation of a specific actor's performance.

Audio, timing, captions, and original vocal-reaction rules live in `docs/design/audio-and-comedy.md`.

## Logo system

The logo combines:

1. one open orbital path;
2. a small capsule;
3. three connected decision nodes;
4. a forward gap that represents an unfinished mission.

Production sources:

- `assets/identity/odyssey-orbital-mark.svg` — small mark and icon.
- `assets/identity/odyssey-horizontal-lockup.svg` — horizontal name lockup.

Rules:

- Maintain clear space equal to the diameter of one decision node.
- Use the standalone mark below 240 px wide.
- Do not place the mark inside a circular agency-style seal.
- Do not combine it with NASA insignia or imply NASA endorsement.
- Do not reconstruct the logo from text rendered inside an AI concept image.

## Color system

| Role | Value | Use |
|---|---:|---|
| Void navy | `#071A33` | Main background |
| Deep surface | `#0E2A4B` | Primary cards and panels |
| Raised surface | `#15375A` | Selected and elevated panels |
| Starlight cream | `#FFF3D6` | Primary text, diagrams and light surfaces |
| Muted ice | `#B9D3E4` | Secondary text |
| Orbit cyan | `#18D2F2` | Data, connections, focus and navigation |
| Solar orange | `#FF8A1F` | Decisions, primary actions and selected states |
| Signal coral | `#FF625E` | Warnings and broken constraints |
| Mission green | `#69D59D` | Validated constraints and feasible results |
| Focus yellow | `#FFE15C` | Keyboard-focus outline when cyan is ambiguous |

Cream, cyan, orange, coral, green, and muted ice all exceed a 4.5:1 contrast ratio on void navy. Color must still be paired with an icon and text state.

## Typography

- **Display:** Space Grotesk, Inter, system-ui, sans-serif.
- **UI/body:** Inter, system-ui, sans-serif.
- **Data:** Inter with tabular numerals when supported.
- Explanations use sentence case.
- Uppercase is limited to short navigation, resource, and state labels.
- Units and provenance labels never use novelty science-fiction fonts.

Any bundled font files must include their license and source record.

## Shape and illustration language

- Cards are rounded rectangles with one clipped or orange-accented corner.
- Sweeping cyan curves represent travel and navigation.
- Thin straight connectors represent system dependencies.
- Three linked nodes represent consequential decisions.
- Four-point stars are sparse navigation accents, not background noise.
- Materials combine warm cream ceramic-composite, navy fabric or panels, orange bumpers, cyan light channels, and lightly worn tools.
- Story art may be tactile and dimensional; scientific charts stay flat, crisp, and readable.

## Resource language

The first shared resource family is Mass, Power, Data, and Budget. Communications, time, and science value may be added only when required by the approved mission model.

- Show icon + label + value + unit where applicable.
- A meter is never the only representation of a value.
- Orange means a player decision, coral means a verified warning, and green means a satisfied rule.
- Do not show decorative precision beyond the source or model.

Production source: `assets/identity/resource-symbols.svg`.

## Interface voice

- Curious, direct, specific, and encouraging.
- Assume no prior space knowledge.
- Explain one consequence at a time.
- Prefer “Your instrument produces more data, so communications needs more capacity” over “System constraint violated.”
- Never blame the player for an infeasible design; invite a retry.
- Never make RIVO invent facts for a joke.

Every scientific statement must be classified visibly as one of:

- **NASA source** — traceable external evidence;
- **Simplified game rule** — a documented model or educational simplification;
- **Your result** — a consequence calculated from the player's choices.

## Motion

- Orbit lines draw in the direction of travel.
- Decision nodes activate in sequence, never all at once.
- Resource changes use a short count or bar transition and settle on a visible final value.
- Nadir uses broad anticipation and readable poses; RIVO uses small tilts, hover changes, and face states.
- Respect reduced-motion preferences and provide static equivalents.

## Accessibility

- Target WCAG AA for text and essential controls.
- Minimum control height: 44 px.
- Never communicate state by color alone.
- Preserve units and data provenance.
- Caption all dialogue, vocal reactions, music cues relevant to meaning, and important sound effects.
- Do not hide final values behind animation.
- Keep body text free of star fields, orbital lines, and texture.

## Originality and rights boundary

The game may use broad comic-scientist, workshop, physical-comedy, and accidental-journey ideas. It must not reproduce commercial-film characters, costumes, dialogue, scene composition, jokes, catchphrases, vocal performances, music, recorded sound effects, or production design.

All voices, music, sound effects, artwork, and fonts must be original, appropriately licensed, or sourced under compatible terms with provenance recorded. Do not use NASA insignia or imply endorsement.

## Approved visual references

- `assets/identity/identity-board-v1.png`
- `assets/identity/characters/dr-nadir-character-sheet.png`
- `assets/identity/characters/rivo-character-sheet.png`
- `assets/identity/environments/orbital-workshop.png`
- `assets/identity/key-art/wrong-orbit-key-art.png`
- `assets/identity/screens/01-start-screen.png`
- `assets/identity/screens/02-mission-builder.png`
- `assets/identity/screens/03-mission-review.png`

The PNGs define composition and identity intent, not exact CSS values or scientifically approved content. `design/tokens.json`, the SVG sources, and future approved component specifications control implementation.

## Reusable component checklist

Button, Input, Card, Dialog, Navigation, Resource Meter, Decision Node, Consequence Panel, Data Provenance Label, Loading, Empty, Error, Captions, Reduced-motion state.
