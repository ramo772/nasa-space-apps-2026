# AI workflows — canonical references

Shared AI rules live in `AGENTS.md`. The runnable procedures are project skills in `.agents/skills/`, `.claude/skills/`, and `.github/skills/` and should be kept identical in all three locations.

## Team operations
- `meeting-notes`: transcript/notes → verified draft, with decision/proposal/action separation.
- `process-meeting`: orchestrate approvals, documentation PR and ticket/board sync.
- `create-issues`: approved actions → deduplicated issues with AC, docs and meeting source.
- `create-wiki`: arbitrary contributor knowledge → one classified, attributed `docs/` page after duplicate checks; defers to `sync-docs` when a canonical page already exists.
- `sync-docs`: approved decisions → minimal, reviewed Markdown/ADR diffs.
- `sync-board`: approved issues → verified project item/field changes.

See `docs/process/meeting-workflow.md` for approval boundaries and source of truth.

## Engineering
- `start-ticket`: read issue/comments, linked docs, relevant ADR, then propose plan.
- `grill-with-doc`: identify only material ambiguity before code edits.
- `review-implementation`: compare code, scientific facts and design against approved AC.

No autonomous decisions; no invisible GitHub writes; only claim external operations after verification. During pre-event foundation work, do not develop the final solution prematurely.
