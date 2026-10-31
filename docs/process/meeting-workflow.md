# Meeting → documentation → issues → board

## Workflow contract
**Input:** transcript or rough notes, meeting timestamp and team lead approval.  
**Outputs:** reviewed meeting note, updated accepted docs/ADRs (via PR), linked GitHub issues and accurate Project board item fields.

### Lifecycle
1. **Draft**: run `meeting-notes`. Humans verify attendance, summary, decisions, owners, due dates; proposed ideas remain proposals.
2. **Approval A**: lead signs off what was decided, what is only proposed, and which actions should produce tickets.
3. **Diff preview**: run `sync-docs` and `create-issues` to propose exact file/issue edits; check duplicates.
4. **Approval B**: TL explicitly approves remote changes, then skills can write using permitted GitHub tools.
5. **Sync**: save notes, prepare a docs PR, create/link issues, run `sync-board` where auto-add did not cover it.
6. **Verify**: re-fetch issue and board links, update note's action map, report missing permissions or errors.

### Single source of truth
- Discussion and proposals: dated meeting note (archive, nonbinding).
- Agreed architecture/product behavior: current approved `docs/` plus accepted ADRs.
- Tasks, priorities and owners: GitHub Issues.
- Workflow status and views: GitHub Projects.
- Visual identity: `docs/design/identity.md`, `design/tokens.json`; ArtCraft exports are assets, not implementation authority.

### Required linking
Meeting `ACT-01` → unique GitHub issue URL → Feature/ADR/doc path (as appropriate) → Project item. Never invent IDs or assume a GitHub operation succeeded if it was not verified.
