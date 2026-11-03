# Meeting: Repo workflow, challenge decision and team name

**Date/time (Cairo):** 2026-11-01 21:00–23:00 (about two hours, across two Google Meet sessions)  
**Platform:** Google Meet. The first session closed when its time limit ran out; the team opened a new Meet and continued. Only the first session (about the first hour) was recorded.  
**Attendees:** Omar Khaled, Abduallah Waleed, Shahnda Elmasry, Engy Refaai, Rana Emad, Rokia Abdelsattar  
**Facilitator/Note-taker:** Omar Khaled / Shahnda Elmasry (GitHub: shahndaa)  
**Status:** Draft — awaiting TL review  
**Source:** First session (about one hour): the tl;dv recording with its automatic transcript and two machine summaries. The recording is kept in the team's private chat and is not linked here. Second session (about one hour): not recorded; every item from it is the note-taker's account from memory and is marked "reported by the note-taker, not recorded". No raw transcript, recording link or input file is committed to this repository.

## Purpose / Agenda
- Finalise the project idea, then agree the identity (characters, story and visuals), then the overall flow of the video (01:47).
- Story, characters and colours first; build quickly with AI tools because of the timeline of about 13 days (13:17).

## Summary
The team met for about two hours over two Google Meet sessions and closed out the two finalists left by the [2026-10-31 meeting](2026-10-31-challenge-shortlisting.md): it chose "Space Mission Design Game" as its challenge (DEC-01) and adopted the team name "The Odyssey of a Meat-a-roid" (DEC-02). The first, recorded hour covered repository setup and the pull request workflow — one shared repository instead of a multi-repo structure (DEC-03), one responsible reviewer per pull request (DEC-05) and building quickly with AI tools (DEC-04) — plus a concept debate between the two finalists. The second, unrecorded hour settled the challenge and the name and explored creative direction drawn from "Cloudy with a Chance of Meatballs" and "The Odyssey", without deciding how to combine them. Everything creative in "New ideas" is the team's own proposal and not product scope. The note-taker resolved the three points where the two machine summaries disagreed (review count, monorepo, AI tools); they are recorded as resolved below.

## Confirmed decisions

| ID | Decision | Approved by | Related doc / issue |
|---|---|---|---|
| DEC-01 | Challenge: "Space Mission Design Game", chosen from the two finalists left on 2026-10-31 (the other was "Interplanetary Survival Guide: Martian Map"). | Approved by: the team in the meeting (reported by Shahnda Elmasry) | [2026-10-31 note](2026-10-31-challenge-shortlisting.md) DEC-01; `docs/product/challenge-and-mvp.md` is still TBD and was not edited by this note |
| DEC-02 | Team name: "The Odyssey of a Meat-a-roid". It replaced the earlier suggestion "Flight to the Meat-a-roid". | Approved by: the team in the meeting (reported by Shahnda Elmasry) | This note |
| DEC-03 | One shared repository (monorepo) rather than a multi-repo organization structure. Reached by discussion and consensus, with no formal vote; the note-taker confirms it is a decision. | Approved by: the team in the meeting (reported by Shahnda Elmasry) | `docs/team/working-agreement.md` (branch and PR flow) |
| DEC-04 | Use AI tools to build quickly, given the short timeline. Everyone agreed. | Approved by: the team in the meeting (reported by Shahnda Elmasry) | `docs/process/ai-workflows.md` |
| DEC-05 | One reviewer's approval is enough to merge a pull request, and that reviewer is responsible for the review. The facilitator first mentioned two approvals, then said one responsible reviewer is enough (36:37 and 38:58). | Approved by: the team in the meeting (reported by Shahnda Elmasry) | `docs/team/working-agreement.md`; see "Working agreement check" below |

Approval wording as reported by the note-taker; no separate review step was held.

Second-session items (DEC-01 and DEC-02) are reported by the note-taker, not recorded.

### Working agreement check — not an edit
`docs/team/working-agreement.md` on main (checked 2026-11-03) says: "One independent approval for normal PRs, or TL-designated rapid review during the 48h sprint."

**The two agree on the core rule: one approval is enough to merge a normal PR.** Two details differ, without contradicting DEC-05:
- The agreement adds that the approver must be **independent** (not the author). That matches the meeting's "review each other's work except their own PR" (37:07).
- The agreement allows a **TL-designated rapid review during the 48h sprint**, an exception the meeting did not discuss.

The agreement was not edited.

### Source reconciliation
The two machine summaries of the recorded session differed on three points. The note-taker resolved them as recorded here, and none is an open question:
1. Review count — one summary said two approvals, the other said one is enough. Resolved: one responsible reviewer is enough (DEC-05).
2. Monorepo — one summary called it a decision, the other a working direction without a vote. Resolved: a decision reached by consensus without a formal vote (DEC-03).
3. AI tools — listed as a decision in one summary. Resolved: everyone agreed (DEC-04).

## Proposed decisions — not binding
- **Creative direction for the chosen challenge.** How to combine a mission (from the "Cloudy with a Chance of Meatballs" characters) with escaping an island through stages of challenges (from "The Odyssey") is not decided, especially because one source has human characters and the other is a cartoon. The individual proposals are listed under "New ideas". Expected decider: the team at the 2026-11-02 identity meeting.
- **Resources folder layout.** The facilitator said design assets such as Figma links, PDFs and presentations go in a resources folder in the repository (39:17), but where the folder lives (repository root or under `docs/`) and what goes in it were not agreed.

## Action items

| ID | Action / expected outcome | Owner | Due / checkpoint | Issue URL | Status |
|---|---|---|---|---|---|
| ACT-01 | Accept the repository invitation (33:33) | Abduallah Waleed | TBD | Not yet created | Proposed |
| ACT-02 | Create a pull request from his branch for review (35:10) | Abduallah Waleed | TBD | Not yet created | Proposed |
| ACT-03 | Add the storyboard PDF to the repository resources (28:10), only if it is the team's own material | Abduallah Waleed | TBD | Not yet created | Proposed |
| ACT-04 | Create notes for the names used in the workshop (24:08) | Abduallah Waleed | TBD | Not yet created | Proposed |
| ACT-05 | Send Abduallah Waleed the project MD file (26:08) | Omar Khaled | TBD | Not yet created | Proposed |
| ACT-06 | Review each other's pull requests, except their own (37:07) | Everyone | TBD | Not yet created | Proposed |

Due dates were not stated in the meeting: TBD for all. No GitHub issue exists for these actions yet; `create-issues` was not run for this draft.

## New ideas (triage; not approved features)

### Creative direction — proposals from the unrecorded second session (reported by the note-taker, not recorded)
- **Abduallah's proposal:** take the characters from the film "Cloudy with a Chance of Meatballs", give the character a mission to carry out, and base the game and the team name on it. His first name suggestion was "Flight to the Meat-a-roid".
- **Engy's proposal:** take the story from "The Odyssey" — the character lands on an island, tries to do everything and passes stages of challenges to escape. The game would be inspired by both a mission and escaping the island. She proposed the name "The Odyssey of a Meat-a-roid", which the team adopted (DEC-02).
- **Rana's suggestion:** use the characters from "Cloudy with a Chance of Meatballs" but the story from "The Odyssey".
- The discussion of characters lasted about an hour and each member gave an opinion; no combination was chosen.

### Process ideas
- Close the first practice PR and reopen it later, because the team was still learning the flow (37:31). Suggested, not confirmed.
- Keep design assets such as Figma links, PDFs and presentations in a resources folder in the repository (39:17). Stated by the facilitator; location and contents not agreed.

## Blockers / open questions
- **Combining the two creative sources:** how to combine the film characters with the Odyssey story is not decided. Expected decider: the team at the 2026-11-02 identity meeting.
- **Third-party material (added by the note-taker's assistant; not raised in the meeting):** using characters, names or art from a commercial film could raise copyright questions. Check the official Space Apps rules and this repository's rule against copyrighted assets before using any film material; being inspired by a story is different from reusing its characters or art. Expected decider: TL.
- **Resources folder:** where it lives and what goes in it. Expected decider: TL.
- **Due dates:** TBD for ACT-01 to ACT-06.
- **Branch and PR convention:** `docs/team/working-agreement.md` asks PRs to link a GitHub issue and names branches `docs/789-brief-name`. The repository has no issue for a meeting note (only issue #1, unrelated), and PR #14 for the 2026-10-31 note used `docs/meeting-notes-2026-10-31-challenge-shortlisting` with "No issue" in its body. Expected decider: TL.
- **Later meeting:** the notes of the 2026-11-02 identity meeting, if it took place, are not part of this note.

## Facts and stated directions (not decisions)
- Omar Khaled created the team on the official NASA Space Apps site, and all six members registered and joined it during the meeting (reported by the note-taker).
- The repository is already set up as a monorepo. One member had made a fork; the facilitator said the team should work directly in the shared repository instead (15:13). Stated direction, approver TBD.
- Setup walkthrough: accepting the repository invitation, opening the project in the editor and creating a branch (19:00). Some invitation and access issues came up (17:34).
- Pull request flow described: open a draft PR, mark it ready for review, reviewers comment and the author resolves (35:24). Everyone reviews each other's work except their own PR (37:07). Critical comments on PRs are welcome (44:03).
- The repository contains skills that pass context to AI agents (15:13).
- The storytelling pitch document goes in the "Storytelling Project" folder and is committed on a branch (30:30). No such folder exists on main as of 2026-11-03, so it is not linked here.
- The project board tracks ready tasks, tasks in review and assigned tasks (42:50).
- In reply to a question, the facilitator said the repository will be kept after the hackathon (40:07).
- Next meeting: 2026-11-02 at 21:00 (Cairo), on the team's identity (characters, story and visuals).

## Concept debate (recorded session; opinions not attributed)
- A Space Mission concept, possibly a VR-style experience playable on a mobile phone (45:45).
- A Mars exploration concept where the player studies the planet from a distance and plans missions rather than walking on it (46:20).
- A human space exploration and survival game, with a suggestion to mix the ideas (49:21).
- A dashboard showing nearby weather and storms for Mars exploration (47:43).
- A view that the Martian Map idea is creative but risky, and that both options leave room for creativity (52:49).
- A storytelling game where the player travels to Mars to collect a resource (transcribed as water) and returns with it (53:54).
- Once the team picks one idea, everyone should commit to it fully (56:28).

## Post-meeting sync
- Status: draft note awaiting TL review.
- Not run for this note, per the note-taker's instruction: `process-meeting`, `sync-docs`, `create-issues`, `sync-board`.
- Docs/ADR changes: none. `docs/team/working-agreement.md`, `docs/product/challenge-and-mvp.md` and `docs/team/meeting-notes/2026-10-31-challenge-shortlisting.md` were not edited.
- Issues created or reused: none. Board sync: none.
- Reviewed by/date: pending TL review.

## Sources and attribution
- Recorded first session: tl;dv automatic transcript and two machine summaries; the recording is kept in the team's private chat and is not linked or committed here.
- Unrecorded second session: the note-taker's account from memory (Shahnda Elmasry).
- Note-taker: Shahnda Elmasry (GitHub: shahndaa). Her account overrides the machine summaries where they disagree, as recorded above.
- Timestamps in parentheses refer to the automatic transcript of the recorded session.
- Creative proposals and names are the team's own; they are not official challenge text or official NASA material.
