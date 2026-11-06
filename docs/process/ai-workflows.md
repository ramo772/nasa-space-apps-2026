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
- `find-docs`: fetch current library/API documentation through the Context7 CLI; see setup below.

## Context7 documentation lookup

The official Upstash `find-docs` skill is included beside our existing skills in
`.agents/skills/`, `.claude/skills/`, and `.github/skills/`. Each copy includes the
upstream MIT license and a `SOURCE.md` recording its source revision. Keep all
three copies identical when updating. The skill is available after cloning or
pulling this change and starting a new agent session in the repository.

Each teammate needs **Node.js 22.13 or newer**, npm/npx, and network access to npm
and Context7. No global package installation or MCP configuration is required.
Ask your agent, for example: `Use find-docs to look up React useEffect cleanup.`
To verify it manually from the repository:

```bash
npx --yes ctx7@latest library React "How to clean up useEffect"
# Use the Library ID returned above in the next command:
npx --yes ctx7@latest docs <libraryId> "How to clean up useEffect"
```

Documentation lookup supports unauthenticated use. If rate limits require it,
each teammate can authenticate on their own machine with
`npx --yes ctx7@latest login`, or supply their own `CONTEXT7_API_KEY` environment
variable. Keep credentials out of tracked files. Send documentation questions,
not private transcripts, proprietary code, or secrets, to the service.

Context7 results support library/API research; NASA claims and datasets still
require authoritative sources in `docs/research/source-register.md`. If lookup
fails, report the failure and verify against the library's official docs rather
than presenting recalled API details as verified.

Sources: [official Context7 repository](https://github.com/upstash/context7),
[upstream find-docs skill](https://github.com/upstash/context7/tree/1ccf58e6e7f68357ef95c8b84181255d5ffa5c05/skills/find-docs).

No autonomous decisions; no invisible GitHub writes; only claim external operations after verification. During pre-event foundation work, do not develop the final solution prematurely.
