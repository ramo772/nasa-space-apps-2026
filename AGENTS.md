# Team AI rules (canonical)

This is a **six-person NASA Space Apps team foundation**. The actual competition challenge has **not been selected**. Focus on a small, high-quality workflow. Do not start implementing challenge-specific features prematurely; confirm official rules.

## Before any task
1. Read `docs/00-start-here.md` and `docs/team/project-config.md` when GitHub operations are involved.
2. If work references an issue, fetch its **current** body and comments from accessible GitHub integration or `gh` CLI. No access? Report the blocker; do not invent issue contents.
3. Read **relevant** approved documentation from the index. Explicitly list sources actually read; do not load the entire docs archive indiscriminately.
4. Check current accepted ADRs and `docs/design/identity.md`/`design/tokens.json` for UI changes.
5. Separate confirmed decisions, unapproved proposals, and transcript opinions. Surface contradictions for TL to decide.

## Implementation and change boundaries
- Before app code: approved issue, clear AC, concise plan; obtain plan approval and then make smallest verifiable change.
- New ideas are triage issues, not authorization to build.
- Follow project skills when requested: `process-meeting`, `meeting-notes`, `create-issues`, `sync-docs`, `sync-board`, `start-ticket`, `grill-with-doc`, `review-implementation`.
- Before *external* writes (create/update issues, board status, push docs), show exact intended changes, obtain approval, check for duplicates, and verify results. Do not overstep permissions.
- Preserve one code-first visual identity (`docs/design/identity.md`, tokens). ArtCraft assets are optional; no mandatory Figma, no invented style variations.
- Don't invent NASA data, claims or source attribution. Link authoritative datasets in `docs/research/source-register.md`.
- Don't commit secrets, credentials, raw private transcripts, or copyrighted assets without permission.
- No direct pushes to `main`; use branches/PRs when enabled. Tests/review required for code; PRs link issues using `Closes #N` only when the PR actually resolves them.

## Definition of Done
Approved AC met, linked docs/research correct, integration/demo verified, checks reported truthfully, reviewed and merged; board updated only after confirming status.
