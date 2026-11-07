# Identity exploration — The Odyssey of a Meat-a-roid

**Status:** Exploration archived; Direction A promoted to canonical identity v1 on 2026-11-07

**Date:** 2026-11-06

**Scope:** Identity and game-facing visual language only. The current eMVP is not a design dependency and is not changed by this package.

## Confirmed anchors

- Challenge: **Space Mission Design Game**.
- Team/submission name: **The Odyssey of a Meat-a-roid**.
- Product value: help a beginner understand how mission choices create connected trade-offs.
- Scientific rule: NASA evidence controls the simulation; fiction may frame the experience but must not be presented as physics.
- Originality rule: do not reproduce characters, artwork, or the visual identity of *Cloudy with a Chance of Meatballs* or any other commercial property.

## Brand architecture

- **Primary name:** The Odyssey of a Meat-a-roid
- **In-game workspace label:** Orbital Workshop (a location/mode label, not a second product name)
- **Descriptor:** A mission-design game about choices, constraints, and consequences.
- **Core line:** **Every choice changes the mission.**
- **Player identity:** Rookie mission designer, not passive passenger.
- **Emotional outcome:** “I can understand this, test it, and improve my design.”

The unusual team name should live mainly in the wordmark. The game should not use food imagery or a film-derived scientist to explain it.

## Direction A — Orbital Workshop (recommended)

Direction A combines a dark mission-control foundation with friendly, tactile educational graphics.

### Visual character

- Deep navy working space, warm cream text, electric cyan paths, solar-orange decisions, and coral warnings.
- Rounded modular cards and visible connection lines make the system feel assembled rather than mysterious.
- An orbit/capsule/three-node emblem represents the mission path and connected decisions.
- Slight screen-print texture adds personality, but charts and scientific labels remain crisp.

### Why it fits

- Memorable without becoming childish.
- Supports both story scenes and data-rich game screens.
- Gives consequences a clear color language.
- Can be implemented with ordinary CSS and SVG instead of depending on large illustration assets.
- Keeps the “odyssey” idea while making mission systems the center of the identity.

### Mascot language

The optional guide is **RIVO**, a small spherical Resource Integration and Validation Orb. RIVO is a helper, not the hero. It explains cause and effect in plain language and never invents scientific claims.

## Direction B — Mission Blueprint

A bright, clean technical system using cobalt, signal lime, graphite, and white. It communicates precision and is highly usable, but feels closer to a generic STEM platform and carries less story personality.

Best if the team wants the most classroom-like and least cinematic direction.

## Direction C — Cosmic Logbook

Aubergine, cream, copper, turquoise, and dusty rose with notebook textures and hand-drawn orbital annotations. It gives the strongest sense of journey and authorship, but requires more illustration work and can make dense game screens harder to scan.

Best if storytelling is prioritized above rapid UI implementation.

## Recommended identity system

### Logo

Use an original orbital mark made from:

1. a capsule moving along one open orbit;
2. three connected decision nodes;
3. a forward gap that suggests the mission is still being designed.

The mark must work without the long name at small sizes. Do not combine it with NASA insignia or make it resemble a national space-agency badge.

### Color roles

| Role | Token | Purpose |
|---|---|---|
| Void navy | `#071A33` | Main background |
| Deep surface | `#0E2A4B` | Cards and panels |
| Starlight cream | `#FFF3D6` | Primary text and diagrams |
| Orbit cyan | `#18D2F2` | Connections, data, focus and navigation |
| Solar orange | `#FF8A1F` | Decisions, calls to action and selected states |
| Signal coral | `#FF625E` | Warnings and broken constraints |
| Mission green | `#69D59D` | Validated constraints and success |

The Direction A token proposal was promoted to the canonical `design/tokens.json` on 2026-11-07. The proposal file remains as exploration history.

### Typography

- **Display:** Space Grotesk, with Inter/system fallbacks.
- **UI and body:** Inter, with system-ui fallbacks.
- Use sentence case for explanations and uppercase only for short labels.
- Never use novelty “sci-fi” fonts for scientific values, units, or source labels.

Any bundled fonts must include their license and provenance before release.

### Shape language

- Cards: rounded rectangles with one clipped or orange-accented corner.
- Routes: sweeping cyan curves for navigation; thin straight connectors for system relationships.
- Decisions: three connected circular nodes.
- Warnings: coral only when a constraint is actually at risk.
- Stars: sparse four-point navigation markers, never decorative star-field noise behind body text.

### Resource language

The first reusable resource family is:

- Mass — weight symbol.
- Power — bolt symbol.
- Data — rising bars or stored packets.
- Budget — stacked tokens.

Icons always appear with a visible label and unit where applicable. Color alone must never communicate state.

### Voice

- Curious, direct, and encouraging.
- Explain one consequence at a time.
- Prefer “Your larger instrument needs more power” over “System constraint violated.”
- Separate three message types: **NASA fact**, **game rule**, and **result of your choice**.
- Never imply the player is expected to know space terminology already.

## Example interface language

**Prompt:** Choose the instrument that best supports your mission goal.

**Consequence:** The high-resolution camera adds science value, but it also adds mass and produces more data.

**Next question:** Can your power, storage, and communications choices support it?

**Source treatment:** Show the source name beside the metric and provide the full link in a source panel.

## Accessibility and scientific clarity

- Target WCAG AA contrast for text and essential controls.
- Pair every status color with an icon and text label.
- Preserve units and source provenance on scientific metrics.
- Respect reduced-motion preferences.
- Do not animate resource meters in a way that hides the final value.
- Clearly label any illustrative trajectory or simplified game rule.

## Identity acceptance checklist

- [x] Team/TL selects one direction.
- [x] Final logo and small-size mark are reviewed as identity v1 sources.
- [x] Canonical `docs/design/identity.md` and `design/tokens.json` are updated together.
- [ ] Font files, if bundled, include license records.
- [ ] Every external or generated asset has provenance.
- [ ] No commercial-film character, NASA insignia, or unsupported scientific claim appears.
- [ ] One representative game screen passes a contrast and readability review before implementation expands.

## Sources actually used

- `docs/00-start-here.md`
- `docs/team/meeting-notes/2026-11-01-challenge-decision-and-team-setup.md`
- `docs/design/identity.md`
- `docs/design/art-direction.md`
- `design/tokens.json`
- User confirmation on 2026-11-06 that the draft decision is approved and the eMVP will be removed from the current direction.

