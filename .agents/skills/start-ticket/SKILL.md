---
name: start-ticket
description: Start implementation planning for one approved GitHub issue by loading issue comments, relevant docs and existing decisions, then running grill-with-doc and proposing a small plan. Use when a developer asks to start an issue.
---
# Start Ticket

1. Read `AGENTS.md`, `docs/00-start-here.md` and `docs/team/project-config.md`.
2. Fetch the issue and comments using connected GitHub integration or `gh issue view NUMBER --repo OWNER/REPO --comments`; stop if not accessible.
3. Load relevant approved docs from issue links and the index; check latest relevant ADR and design tokens. Don't indiscriminately load every old note.
4. Use `grill-with-doc` to resolve only blockers; state docs actually read, dependencies, ownership and expected acceptance criteria.
5. Produce a 5–10 line plan and test/demo checklist. **Wait for user approval before code edits.**
6. After approved edits, prepare PR with link `Closes #NUMBER`, issue AC, screenshots/demo, test results and docs changed.
