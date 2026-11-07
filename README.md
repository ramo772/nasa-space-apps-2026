# NASA Space Apps 2026 — Team Foundation (temporary title)

The engineering and coordination foundation for six teammates working on the challenge **Space Mission Design Game** as The Odyssey of a Meat-a-roid. The competition solution is **not** implemented yet; observe organizer rules before implementing challenge work. Repository and Project names can be changed later.

## Start here

1. Read [`docs/team/github-setup.md`](docs/team/github-setup.md) and [`docs/00-start-here.md`](docs/00-start-here.md).
2. Create a **private** GitHub repo named `nasa-space-apps-2026`, upload these files using `gh repo create` or GitHub UI.
3. Create and link a GitHub Project, then fill in [`docs/team/project-config.md`](docs/team/project-config.md).
4. Assign the six team members, invite them, enable review protection if available, and decide meeting platform.
5. Run a rehearsal meeting through the `/process-meeting` skill (non-competition dummy task).

## Single sources of truth
| Subject | Source |
|---|---|
| Approved product/technical decisions | `docs/` with dated ADRs and review history |
| Meeting archive and unapproved proposals | `docs/team/meeting-notes/` |
| Feature, task, bug or idea | GitHub Issue |
| Work status, priority, workstream | GitHub Project |
| Visual identity / design tokens | `docs/design/identity.md`, `design/tokens.json` |
| Art concepts / illustrations | ArtCraft exports, documented in `docs/design/art-direction.md` |

## Shared AI entry points
- `AGENTS.md` is the canonical instruction set.
- `CLAUDE.md` and `.github/copilot-instructions.md` forward to canonical rules.
- Skills shipped for **Claude Code** (`.claude/skills/`), **Codex** (`.agents/skills/`), and **GitHub Copilot** (`.github/skills/`).
- Post-meeting chain: `process-meeting` → `meeting-notes` → `sync-docs` → `create-issues` → `sync-board`.
- Knowledge capture: `create-wiki` turns any teammate's notes, research or findings into one attributed `docs/` page (approval-gated, PR only).
- Implementation chain: `start-ticket` → `grill-with-doc` → plan → code → `review-implementation`.
- Library/API documentation: the shared `find-docs` skill uses Context7; see [requirements and usage](docs/process/ai-workflows.md#context7-documentation-lookup).

**Safety:** skills use approval gates; they cannot access GitHub without a connected CLI/MCP and adequate permissions. An instruction is not a guarantee that an agent read every file; verify the documents actually read in its response and PR.

## Playable prototype

`game/` is a first voyage for the Space Mission Design challenge, under the team name The Odyssey of a Meat-a-roid. It is preserved as it is, and the new implementation is planned for `app/` (DEC-003). Run it with `python server.py` from that folder. The product brief in `docs/product/challenge-and-mvp.md` is still the place for an approved MVP. See `game/README.md`.

## After choosing the challenge
The challenge is chosen, and `docs/product/challenge-and-mvp.md`, approved design tokens and `project-config.md` have been updated. Repository and Project titles can still change. Do not rename existing issue identifiers or erase decision history.
