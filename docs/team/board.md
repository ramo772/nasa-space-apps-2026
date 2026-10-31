# GitHub Projects board

**Project configuration and actual IDs:** `docs/team/project-config.md`.

## Status (single-select)
- `Idea / Triage` — new suggestion; not committed.
- `Ready` — approved issue with acceptance criteria and owner.
- `In Progress` — active execution, one P0 at a time per contributor where possible.
- `In Review` — ready for PR/demo validation.
- `Done` — accepted, merged, integrated and demonstrable.

Blocked work keeps its original status and gets the `blocked` label. Don't duplicate issue bodies on the board.

## Custom fields
- Priority: `P0`, `P1`, `P2`.
- Workstream: `Research`, `Design`, `Frontend`, `Backend`, `AI-Data`, `Pitch`.
- Assignee and Status come from GitHub Issues/Project.

## Views
`Command Center` (Status board), `By Owner` (table), `Critical Path` (P0 and blocked filter). Keep the set small.

## Automation
- Enable Auto-add for issues from the linked repository if plan permits.
- Use `sync-board` for verified field changes that automation doesn't cover, with approval gates.
