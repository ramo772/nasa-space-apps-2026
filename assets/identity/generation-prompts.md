# Concept-board generation prompts

**Tool:** OpenAI built-in image generation

**Date:** 2026-11-06

**Purpose:** Identity exploration only; the resulting PNGs are not production logos.

## Direction A — Orbital Workshop

```text
Use case: logo-brand
Asset type: 16:9 game identity concept board, direction A
Primary request: Create a polished original visual identity board for a beginner-friendly space mission design game and six-person hackathon team named "THE ODYSSEY OF A MEAT-A-ROID". The identity should communicate playful systems thinking: players assemble a complete mission and see connected trade-offs.
Scene/backdrop: deep ink-navy design board with generous spacing and subtle orbital grid lines.
Subject: one clean wordmark lockup, a distinctive abstract emblem combining an orbital path, a small rounded mission capsule, and three connected decision nodes; a friendly original non-humanoid spherical mission assistant; four simple UI/resource symbols for Mass, Power, Data, and Budget; several palette swatches; one compact game card mockup.
Style/medium: professional vector-friendly brand presentation with crisp flat shapes, slight tactile screen-print texture, accessible educational game tone, original and production-ready rather than movie concept art.
Composition/framing: orderly landscape brand board with the main logo dominant, supporting elements grouped clearly.
Color palette: midnight navy, electric cyan, solar orange, warm cream, small coral warning accent.
Text (verbatim): "THE ODYSSEY OF A MEAT-A-ROID"
Constraints: render the title exactly once; strong silhouettes; readable high contrast; no NASA wordmark or insignia; no existing franchise characters; no resemblance to Cloudy with a Chance of Meatballs; no food or meatball imagery; no rockets with national flags; no tiny explanatory text; no watermark.
```

## Direction B — Mission Blueprint

```text
Use case: logo-brand
Asset type: 16:9 game identity concept board, direction B
Primary request: Create a polished original visual identity board for the beginner-friendly space mission design game and team named "THE ODYSSEY OF A MEAT-A-ROID". This direction is called Mission Blueprint: clear, intelligent, modular, and focused on how mission systems connect.
Scene/backdrop: pale warm-gray technical drafting surface with a restrained cobalt grid and large areas of whitespace.
Subject: one precise geometric wordmark; a compact emblem made from a circular orbit split into modular spacecraft panels; a simple original faceless navigation beacon mascot; connected flow-line motifs; four UI/resource symbols for Mass, Power, Data, and Budget; palette swatches; a compact decision-card interface.
Style/medium: clean vector design system, Swiss editorial clarity mixed with friendly science-museum graphics, flat shapes, practical game UI, no cinematic concept art.
Composition/framing: orderly landscape brand board, strong information hierarchy, main logo dominant and supporting components clearly separated.
Color palette: cobalt blue, signal lime, graphite, white, and restrained warm yellow.
Text (verbatim): "THE ODYSSEY OF A MEAT-A-ROID"
Constraints: render the title exactly once; accessible contrast; scalable simple shapes; no NASA branding; no existing franchise characters; no resemblance to Cloudy with a Chance of Meatballs; no food imagery; no national flags; no tiny explanatory paragraphs; no watermark.
```

## Direction C — Cosmic Logbook

```text
Use case: logo-brand
Asset type: 16:9 game identity concept board, direction C
Primary request: Create a polished original visual identity board for the beginner-friendly space mission design game and team named "THE ODYSSEY OF A MEAT-A-ROID". This direction is called Cosmic Logbook: adventurous and story-rich while still communicating scientific decisions and mission trade-offs.
Scene/backdrop: dark aubergine space background layered with warm cream logbook paper panels, subtle hand-drawn orbital annotations, and plenty of clean negative space.
Subject: one expressive but readable wordmark; an original emblem of a small capsule following a looping odyssey path through three decision stars; a friendly original mechanical compass guide with no human face; four illustrated UI/resource symbols for Mass, Power, Data, and Budget; palette swatches; one mission-log decision card.
Style/medium: modern editorial illustration with screen-printed texture and hand-drawn scientific notebook accents; warm, clever, crafted, suitable for a polished educational game; not childish and not cinematic.
Composition/framing: landscape identity board with a dominant logo and a clear family of supporting visual elements.
Color palette: deep aubergine, starlight cream, copper orange, turquoise, and dusty rose.
Text (verbatim): "THE ODYSSEY OF A MEAT-A-ROID"
Constraints: render the title exactly once; readable high contrast; no NASA branding; no existing franchise characters; no resemblance to Cloudy with a Chance of Meatballs; no food imagery; no national flags; no tiny explanatory text; no watermark.
```

## Direction A — start screen

The initial generation was followed by one targeted edit that removed an unrequested small “Orbital Workshop” header while preserving the rest of the screen.

```text
Use case: ui-mockup
Asset type: high-fidelity 16:9 desktop game start screen, Orbital Workshop identity
Primary request: Design the start screen for "THE ODYSSEY OF A MEAT-A-ROID", a beginner-friendly space mission design game where every choice changes the whole mission.
Scene/backdrop: deep navy space-workshop interface with sparse orbital grid lines, a stylized modular spacecraft under assembly, and a subtle planet edge; no cinematic scene.
Subject: original orbital logo, friendly spherical helper RIVO, a short mission-path preview made of three connected nodes, one prominent start button, and a small clear note that the experience uses NASA sources and simplified game rules.
Style/medium: realistic shippable game UI, crisp vector shapes with light screen-print texture, accessible educational product, polished web-game interface rather than concept art.
Composition/framing: desktop landscape; strong centered hierarchy; generous negative space; practical navigation and readable controls.
Color palette: void navy #071A33, deep surface #0E2A4B, starlight cream #FFF3D6, orbit cyan #18D2F2, solar orange #FF8A1F, small coral accent.
Text (verbatim): "THE ODYSSEY OF A MEAT-A-ROID", "EVERY CHOICE CHANGES THE MISSION.", "START A MISSION", "NASA sources • Simplified game rules"
Constraints: render only the specified text; clear typography; original characters only; no NASA logo or insignia; no existing franchise resemblance; no food imagery; no national flags; no watermark.
```

Targeted edit:

```text
Use case: precise-object-edit
Asset type: high-fidelity desktop game start screen
Input images: Image 1: edit target, the immediately preceding start-screen mockup
Primary request: Remove only the small "ORBITAL WORKSHOP" header and its tiny planet logo from the top center. Restore that area as the same navy orbital-grid background.
Constraints: change only the small top-center header area; keep the main title, tagline, RIVO, spacecraft workshop, three mission nodes, start button, source note, colors, typography, framing, and all other elements unchanged; do not add any text; no watermark.
```

## Direction A — mission builder

```text
Use case: ui-mockup
Asset type: high-fidelity 16:9 desktop mission-builder game screen, Orbital Workshop identity
Primary request: Design the central gameplay screen for a beginner-friendly space mission design game. The player is choosing an instrument and must immediately understand connected trade-offs.
Scene/backdrop: practical dark mission-workshop interface, not an outer-space illustration.
Subject: top progress path with four steps; left mission brief card; center modular spacecraft workbench showing three clearly selectable instrument cards; right resource panel with Mass, Power, Data, and Budget meters; bottom consequence panel explaining what the highlighted choice changes; small friendly spherical helper RIVO near the explanation.
Style/medium: realistic shippable game UI, crisp vector components, accessible educational web game, restrained tactile texture, clear data hierarchy.
Composition/framing: desktop landscape with three-column layout and stable header/footer; large readable labels; center choice area dominant.
Color palette: void navy #071A33, surface #0E2A4B, cream #FFF3D6, cyan #18D2F2, orange #FF8A1F, coral #FF625E, green #69D59D.
Text (verbatim): "STEP 2 OF 4", "CHOOSE YOUR INSTRUMENT", "MASS", "POWER", "DATA", "BUDGET", "WHAT CHANGES?", "More science detail also means more mass, power, and data.", "NASA FACT", "GAME RULE", "CONFIRM CHOICE"
Constraints: render only the specified text; show units beside meters using simple numbers; color is never the only status cue; original characters only; no NASA logo; no existing franchise resemblance; no food imagery; no national flags; no watermark.
```

## Direction A — mission review

```text
Use case: ui-mockup
Asset type: high-fidelity 16:9 desktop mission-review game screen, Orbital Workshop identity
Primary request: Design the final review screen for a beginner-friendly space mission design game. It should celebrate a feasible mission while teaching exactly which trade-offs made it work.
Scene/backdrop: practical dark mission-workshop interface with a completed modular spacecraft and an orbital route diagram, not a cinematic space scene.
Subject: clear mission status header; central connected trade-off map linking Instrument to Mass, Power, Data, Communications, and Budget; one constraint warning with an explanation; compact evidence panel separating a NASA source from simplified game rules; friendly spherical helper RIVO; two actions to revise or try another design.
Style/medium: realistic shippable game UI, crisp vector components, accessible educational web game, restrained tactile texture, clear scientific hierarchy.
Composition/framing: desktop landscape; result headline first, trade-off explanation second, actions last; generous spacing and readable labels.
Color palette: void navy #071A33, surface #0E2A4B, cream #FFF3D6, cyan #18D2F2, orange #FF8A1F, coral #FF625E, green #69D59D.
Text (verbatim): "MISSION REVIEW", "FEASIBLE DESIGN", "WHY IT WORKS", "Instrument", "Mass", "Power", "Data", "Communications", "Budget", "ONE TRADE-OFF TO WATCH", "Your instrument fits the mass limit, but its data needs a stronger communications system.", "NASA SOURCE", "SIMPLIFIED GAME RULE", "REVISE DESIGN", "TRY ANOTHER DESIGN"
Constraints: render only the specified text; color is never the only status cue; original characters only; no NASA logo; no existing franchise resemblance; no food imagery; no national flags; no watermark.
```

