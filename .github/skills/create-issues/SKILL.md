---
name: create-issues
description: Convert approved team meeting action items or planned features into deduplicated GitHub issues with acceptance criteria, documentation links and traceability. Use after TL review.
---
# Create Issues

## Inputs
- Approved meeting note and selected `ACT-XX` items, or approved feature plan; target GitHub repo from `docs/team/project-config.md`.

## Steps
1. Read `AGENTS.md`, docs index, approved notes and relevant feature/decision docs; verify repository configured.
2. Check the existing issues (`gh issue list -R OWNER/REPO --state all --limit 200`, and appropriate search) before proposing new ones. Search by objective and source meeting/action ID, not title alone.
3. If an action already has a live issue, **link it and update only with permission**; never create duplicates.
4. For each new issue draft: title `[Task] ...` / `[Idea] ...` / `[Feature] ...`; goal; scope/out-of-scope; acceptance criteria; verification; relevant repository documentation links; meeting source path and `ACT-ID`; owner/priority only when confirmed. Use `TBD` for missing info.
5. **Present the drafts and exact intended GitHub changes for TL approval BEFORE creating or changing remote issues.** If GitHub auth/connectivity missing, return copyable drafts; do not claim they were created.
6. After approval, use GitHub integration or `gh issue create --repo OWNER/REPO --title ... --body-file ...` (prefer `--body-file` for quoting). Re-fetch every created issue; write URL back to meeting action record in a documentation PR. Report each success/error.

## Stop condition
Do not transform unapproved discussion/brainstorming into approved features. Ideas stay in triage.
