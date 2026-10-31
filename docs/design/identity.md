# Single visual identity — design contract

**Status:** Draft until challenge selection and TL/design owner approval.  
**Design owner:** TBD  
**Preferred workflow:** ArtCraft explorations + code-first UI; Figma is not required.

- A single approved color and typography system is captured in `design/tokens.json` and this document.
- Shared spacing, radius, icon, input, card, button and chart styles; do not add one-off styles without review.
- ArtCraft is for exploration/asset creation, **not** the canonical source for CSS and components. Store approved exports and provenance under `assets/artcraft/` (documented in `docs/design/art-direction.md`).
- For each UI ticket, link the approved art direction, tokens, screenshot/concept and acceptance criteria; don't guess styling from an image.
- Any identity change: tokens and this doc changed in the same PR, approved by the designated design owner.

**Initial illustrative direction only:** dark space-science theme. The token values are temporary samples until team chooses a challenge. Do not claim NASA affiliation or assume logo usage rights.

## Reusable component checklist
Button, Input, Card, Dialog, Navigation, Chart styling, Data provenance label, Loading, Empty, Error.

## UX rules
Show data source and units for science metrics; maintain readable contrast, keyboard usability and responsive layout where relevant.
