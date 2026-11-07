# Team resources — links index

**Status:** Draft  
**Type:** reference  
**Created:** 2026-11-03   **Last reviewed:** TBD  
**Contributor:** shahndaa  
**Source:** links collected from the NASA Space Apps Cairo 2026 bootcamp workshops the contributor attended, plus the instructors' public pages. Links marked "checked" were opened from this machine on the stated date.  
**Related:** `docs/00-start-here.md`, `docs/research/source-register.md`, `docs/workshops/`; fuller winner research is pending PR #15 (`docs/research/Previous_Global_Winners/`, not on main yet)

> **Proposed layout, pending TL approval.** The folder layout is a proposal for the TL to confirm or change. The move did not change any link.

## Purpose

One place where teammates find links to workshop and reference material instead of digging through chat history. This folder is mainly an index: each workshop keeps its own takeaways in `docs/workshops/`, verified NASA datasets stay in `docs/research/source-register.md`, and these pages only point to them.

## Rules

- Workshop slide files are stored in slides/ with the speakers' permission (see workshop-materials.md).
- Each link keeps its "checked on" note. Only what was actually opened is marked verified.
- No keys, tokens, passwords, or personal contact details of instructors or teammates.
- Add new links in a small PR.

## Pages

| Page | What it is for |
|---|---|
| [Official Space Apps links](official.md) | Competition links, and what is still TBD about rules, dates and challenges |
| [Workshop materials](workshop-materials.md) | Workshop pages, speakers, materials links and past winners |
| [NASA data and APIs](nasa-data-and-apis.md) | NASA API documentation, datasets and quick pointers |
| [Spacecraft mission-design reference](../research/nasa-spacecraft-mission-design-reference.md) | Original contributor-supplied research reference; scenario examples are research guidance, not approved implementation scope. |
| [Spacecraft resource catalog (JSON)](nasa-spacecraft-resources.json) | Resources extracted from the supplied mission-design reference, with source locations and caveats; structure defined by its [JSON Schema](nasa-spacecraft-resources.schema.json). Extraction only; links and scientific claims have not been independently verified. |
| [Tools and AI tools](tools.md) | Tools named in the workshops; none chosen |
| [Winner research sources](sources.md) | Official award announcements, team and project pages, and verification notes for `docs/research/Previous_Global_Winners/` |
| [Slides](slides/) | Workshop slide PDFs shared with the speakers' permission |

## Open questions / uncertainty

- **Rules, dates and challenges:** the official 2026 challenge list is linked, but the rules page, event dates and challenge details are not recorded here yet.
- **Five `spaceappschallenge.org` pages** (2026 challenge list, TerraTales, Innovisionaries, Twisters, TechNova) could not be opened by the assistant from this machine on 2026-11-03 (TLS chain or transport error). The contributor confirmed in her own browser on 2026-11-03 that they load, and the pages say so.
- **Award labels** remain the instructors' claims; the NASA announcements confirm the global winner lists, and the workshop pages record which slide said what.
- **Session dates** for the web development and pitch sessions are not recorded on their pages.

## Sources and attribution

- Slide files in slides/ are shared with the speakers' permission, as reported by the contributor. The speakers keep their rights and the files are for team study.
- Each workshop's detail lives on its own page under `docs/workshops/`, written by the contributing attendee; this folder does not restate or extend those takeaways.
- NASA Open APIs, NASA POWER, JPL Sentry, the API and earth-science endpoints and the NASA winner announcements were opened on 2026-11-03 and are listed with that date.
- The five `spaceappschallenge.org` links are marked "confirmed by the contributor in a browser, not opened by the assistant"; the assistant read none of their content.
- The 2026-11-01 team meeting note records the facilitator's suggestion about a "resources" folder and a "Storytelling Project" folder as a stated direction, not a confirmed decision. The facilitator's suggestion about a resources folder was implemented on 2026-11-04 as the proposed layout in this folder, pending TL approval; the "Storytelling Project" part is unchanged.
- Related open work: PR #15 adds `docs/research/Previous_Global_Winners/`; until it merges, past winners are listed in `workshop-materials.md`.
