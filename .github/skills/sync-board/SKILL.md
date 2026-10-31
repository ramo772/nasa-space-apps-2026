---
name: sync-board
description: Attach already-approved GitHub issues to the team's GitHub Project and update agreed Status, Priority and Workstream fields while avoiding duplicated items. Use after approved ticket changes or milestone reviews.
---
# Sync Board

## Inputs
- Issue URLs/IDs and an approved desired state; `docs/team/project-config.md` (owner, project number, URL).

## Steps
1. Read `docs/team/board.md`, `docs/team/project-config.md` and linked issue records. Require real project owner and number; never invent project IDs, field option names or statuses.
2. Check availability/auth (`gh auth status`, `gh project view NUMBER --owner OWNER`, `gh project field-list NUMBER --owner OWNER`, `gh project item-list NUMBER --owner OWNER`). Project access may require `gh auth refresh -s project` run by a human.
3. **Compare current to desired values** and report a change table. Skip if item already exists/field is already correct. Check that auto-add is not already doing the job.
4. Require TL or authorized board owner approval before remote edits.
5. Add missing issue if necessary (`gh project item-add NUMBER --owner OWNER --url ISSUE_URL`), then update fields only with actual discovered names/options using `gh project item-edit NUMBER --owner OWNER --url ISSUE_URL --field FIELD --value VALUE`.
6. Re-read project item values to confirm success; report failures without claiming sync worked.

## Rules
Never close an issue just because it was assigned to Done. `Done` requires agreed Definition of Done. Workstream and priority must come from approved ticket facts. A project board is a view, not a duplicate issue store.
