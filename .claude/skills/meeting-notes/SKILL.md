---
name: meeting-notes
description: Turn rough team meeting notes or a transcript into an accurate draft meeting record with decisions, proposals, questions and action items. Use immediately after a team meeting.
---
# Meeting Notes

## Inputs
- A human-provided transcript/notes or an accessible meeting notes file, plus meeting title/date, attendees if known.
- `docs/team/meeting-notes/TEMPLATE.md` and `docs/team/meetings.md`.

## Steps
1. Read `AGENTS.md`, `docs/00-start-here.md`, meeting template and input.
2. **Do not invent** who attended, approvals, owners, due dates, quotes or deadlines. Mark unclear fields `TBD`.
3. Classify each notable point separately: **confirmed decision**, **proposed decision**, **action**, **new idea**, **blocker**, or **open question**. Do not promote a suggestion to a decision.
4. Assign a stable local action ID `ACT-01`, `ACT-02` within this meeting. Capture owner/due if explicitly stated; otherwise `TBD`.
5. Propose filename `docs/team/meeting-notes/YYYY-MM-DD-topic.md`; include a source reference if recording exists. Avoid including private personal discussion or full raw transcript unless approved.
6. Show draft and ask organizer/TL to approve or correct it before committing; make no live GitHub edits in draft mode.

## Output
Markdown meeting note using TEMPLATE: Summary, Confirmed Decisions (who approved), Proposals, Action Items (ID/owner/due/links), Ideas, Questions, Source, Review status. Set `Status: Draft` until verified. If authorized, save to branch and propose PR.
