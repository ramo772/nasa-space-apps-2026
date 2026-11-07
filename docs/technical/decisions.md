# Decision log
Use one short entry for any architectural or product decision that affects multiple teammates.

## DEC-001 — One operational source of truth
**Date:** 2026-10-31  **Status:** Proposed; approve at first team meeting
**Decision:** GitHub Issues + Projects for all build work; `docs/` for approved requirements; code-first UI tokens and optional ArtCraft assets for design; chat only for discussion. Notion (if used) is a portal with links, not a duplicate board.
**Why:** One ticket owner, less syncing, easy traceability to PRs.
**Tradeoff:** Non-engineers may prefer Notion, so add a simple ReadMe / pinned links.
**Owner:** Team lead

## DEC-002 — Selected challenge
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** none
**Decision:** The challenge is Space Mission Design Game and the team name is The Odyssey of a Meat-a-roid, as recorded in `docs/team/meeting-notes/2026-11-01-challenge-decision-and-team-setup.md` (meeting DEC-01, DEC-02). `AGENTS.md`, `CLAUDE.md` and `README.md` now say so.
**Owner:** Omar Khaled

## DEC-003 — Preserve the prototype; build under app/
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** none
**Decision:** `game/` stays exactly as it is: not deleted, moved or overwritten. The new implementation will live under `app/`, using the stack in `docs/technical/architecture.md`. Archiving or removal is not being decided now.
**Consequence:** This replaces the "archive or remove" gate. Keeping `game/` out of a commit needs care: `__pycache__/` is not ignored, and changing `.gitignore` is a separate approval.
**Owner:** Omar Khaled

## DEC-004 — Identity precedence
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** none
**Decision:** The approved character sheets, identity documentation and `design/tokens.json` are canonical. Do not redesign the characters or visual identity. Screen concepts show hierarchy only. Plan wording that conflicts with them gives way, including focus color and orbit wording ("high elliptical Earth orbit").
**Owner:** Omar Khaled

## DEC-005 — Audio after the first slice
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** none
**Decision:** Audio implementation is deferred until after the first validated vertical slice. The first slice is judged on visual and numeric feedback. The audio requirements for the full game are unchanged.
**Owner:** Omar Khaled

## DEC-006 — Preparation only
**Date:** 2026-11-07  **Status:** Partly replaced by DEC-007  **Issue:** none
**Decision:** Only safe preparation is authorized. No application code and no sample scenario without further approval. Pre-event implementation permission is treated as unverified until the official terms or the organizers confirm it. The GitHub feature issue is deferred, not waived. No commit or push without approval.
**Science:** No invented NASA data, equations or simulation rules. `docs/research/mission-model-proposal.md` is a proposal for review, not an approved model.
**Owner:** Omar Khaled

## DEC-007 — Plan approved; implementation starts before the event
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** deferred until the mentor's written reply
**Decision:** `docs/product/implementation-plan.md` is approved. Implementation starts now, replacing DEC-006's hold on application code.
**Basis:** a mentor told Omar Khaled by phone that the team can start before 2026-11-12 and that this covers existing work. The answer is verbal and the mentor's role is unconfirmed.
**Known conflict:** NASA's Team Formation Guide says participants "should NOT begin working on their project until the hackathon begins on November 14, 2026 (9:00 a.m. local time)", and the Participant FAQ says the same. Written confirmation has been requested from the mentor. Disclose the pre-event work if organizers ask.
**Unchanged:** no value from `docs/research/rule-table-draft.md` enters `app/` until a named reviewer approves it. No commit or push without approval.
**Owner:** Omar Khaled

## DEC-008 — 3D visual direction, subject to a spike
**Date:** 2026-11-07  **Status:** Accepted for evaluation  **Issue:** none
**Decision:** The long-term direction is a controlled 3D/2D hybrid: a fixed cinematic camera, with accessible HTML controls and scientific explanations outside the WebGL canvas. A disposable spike, time-boxed to 90 minutes, decides whether 3D stays. CC0 assets may be used only for secondary props; Nadir, RIVO, the mission table and the workshop's defining shapes stay original.
**Consequence:** Keeping 3D needs a further entry here, because `docs/technical/architecture.md` rules out a full 3D engine for the MVP.
**Owner:** Omar Khaled

## DEC-009 — Full implementation approved; 3D kept
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** deferred until the mentor's written reply
**Decision:** Omar Khaled approved `docs/research/rule-table-draft.md` for use in the game and asked for the full solo game now, replacing DEC-007's rule that a reviewer must approve the table first. The controlled 3D/2D hybrid in DEC-008 is kept. Three.js and React Three Fiber are accepted, and load separately from the first screen.
**Not yet true:** the mentor has been asked to review the table, and no reply has been seen. The scenario pack records `reviewStatus: owner-approved-mentor-review-pending`. Licence notes are a working read by an AI session, recorded as `licenseStatus: working-read`, until a person confirms them.
**Scope kept out:** AI narration, co-op, recorded voices and audio files, and online features.
**Owner:** Omar Khaled

## DEC-010 — Continue implementation on the mentor's answer
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** none posted
**Decision:** Omar Khaled reports that a NASA mentor said the team can start, and directed implementation to continue: character animation, English and Arabic, onboarding with learning profiles and avatars, then same-device Crew mode.
**Not evidenced:** no written permission is in the repository, and NASA's written rule still says 2026-11-14 at 9:00 local (see DEC-007). Attach the mentor's written answer here when received.
**Science:** the rule table has no named reviewer. Omar's approval in DEC-009 is a product decision, not scientific approval. No new mission values are added until a reviewer is recorded.
**Owner:** Omar Khaled

## DEC-011 — The Meat-a-roid world, Egyptian Arabic and the player in the room
**Date:** 2026-11-07  **Status:** Accepted  **Issue:** none posted
**Decision:** The Meat-a-roid is a place in the game (`docs/design/meat-a-roid-world.md`). The second language is Egyptian Arabic rather than Modern Standard Arabic. The player's chosen avatar, suit color and callsign appear in the 3D room. Dr. Nadir and RIVO keep their names, because the master instruction makes them canonical story characters; RIVO's optional callsign shows beside its name.
**Basis:** Omar Khaled reports a further phone call in which the mentor said to start. It is still not in writing, and the science reviewer is still pending.
**Owner:** Omar Khaled

## Open contradictions (pending decisions)
| ID | Item | Needs |
|---|---|---|
| OPEN-01 | Live board Status uses `Backlog`; `docs/team/board.md` says `Idea / Triage` (also asked in issue #1). | TL choice |
| OPEN-02 | `identity.md` calls `resource-symbols.svg` a production source; `assets/identity/README.md` calls it a draft awaiting small-size review. Its icons also differ from the PNG boards. | Design review |
| OPEN-03 | `odyssey-orbital-mark.svg` sits on a filled circle; `identity.md` bans a circular agency-style seal. | Design check |
| OPEN-04 | Plan §7.2 and `characters.md` list different RIVO and Nadir states, and the sheets show only five each. No production character derivatives exist. | Character-state list and asset owner |
| OPEN-05 | NASA's guide says work starts 2026-11-14 at 9:00 local. Cairo's official page starts 2026-11-13 at 07:00 and holds judging on 2026-11-14. The Terms allow a different day only with written approval. Resources arrive 2026-11-13 (confirmed on the official site). | Written answer from organizers, including the submission deadline |
| OPEN-06 | Propellant, Δv and time are missing from the first resource family, and Budget has no NASA source. | Science review (`mission-model-proposal.md`, S1, S3) |
| OPEN-07 | Challenge statement, Terms, FAQ and Team Formation Guide were read on 2026-11-07 using a verified connection. Resources and the Submission and Judging guides are not published until 2026-11-13. | Reconcile the game with them on 2026-11-13 |
| OPEN-09 | Arabic text in `app/src/i18n/ar.ts` was written by an AI session. It needs review by a person, especially the science terms. | Arabic-speaking reviewer |
| OPEN-08 | `README.md` setup says to create a private repository; the live repository is public. | Confirm intended visibility before committing assets |

### New decision format
`ID / title / date / status / issue URL / options / chosen / reason / consequences / owner`
