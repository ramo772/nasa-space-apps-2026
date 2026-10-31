---
name: process-meeting
description: Coordinate post-meeting processing: draft minutes, obtain approval, sync approved docs and GitHub issues, then reconcile the project board. Use when the TL says process this meeting.
---
# Process Meeting — orchestrator

## Runbook
1. Run `meeting-notes` first. Extract source, classification, stable action IDs, attendees and unknowns.
2. **Approval checkpoint A:** present a one-screen summary of confirmed decisions vs proposed ideas, actions/owners/deadlines and unresolved questions. Ask the meeting organizer/TL to approve; do not write remotely before approval.
3. After approval, store the meeting record in a branch and propose documentation PR.
4. Use `sync-docs` for approved decisions only. Identify canonical docs and show targeted diffs. When meeting knowledge needs a **new** page rather than an edit to an existing one, hand it to `create-wiki`; proposals and unapproved material stay in the meeting note.
5. Use `create-issues` for approved actions/new planned features after duplicate checks. Connect each issue URL to the meeting action ID.
6. Use `sync-board` only for approved issues and project field changes not handled by auto-add.
7. **Approval checkpoint B:** show exact GitHub write plan (files, issues, board fields) before executing remote mutations; the same TL approval can cover changes shown together.
8. Verify results and return one compact report: Notes path/PR; decision changes; created vs existing issue links; board changes; failures/unknowns.

## Idempotency and recovery
If rerun for same meeting, reuse existing note and action IDs. Search for existing issues linked to source meeting/ACT-ID; never duplicate. Do not claim downstream success when GitHub is inaccessible. Keep proposed/nonapproved items in the notes only.
