# GitHub initial setup (TL only)

**Do this on your own machine; this starter ZIP is not yet published to GitHub.** GitHub CLI (`gh`) and Git are required. Keep the remote repository private initially.

## 1. Publish the template repository
Extract ZIP; open a terminal inside `nasa-space-apps-2026-foundation`:

```bash
gh auth login
git init -b main
git add .
git commit -m "chore: add team foundation and agent skills"
gh repo create nasa-space-apps-2026 --private --source=. --remote=origin --push
```

`--source=.` uses the current directory and `--push` publishes the committed files. If your account/org permissions require a different owner, use `OWNER/nasa-space-apps-2026` instead. Never run `gh repo create` again if you already created the remote.

## 2. Create and link a Project

```bash
gh auth refresh -s project
gh project create --owner "@me" --title "NASA Space Apps 2026 | Team Board"
```

Save the **project number** from the output or `gh project list --owner "@me"`. Then:

```bash
gh project link PROJECT_NUMBER --owner "@me" --repo nasa-space-apps-2026
gh project field-create PROJECT_NUMBER --owner "@me" --name Priority --data-type SINGLE_SELECT --single-select-options "P0,P1,P2"
gh project field-create PROJECT_NUMBER --owner "@me" --name Workstream --data-type SINGLE_SELECT --single-select-options "Research,Design,Frontend,Backend,AI-Data,Pitch"
```

The built-in `Status` field usually starts with defaults; **edit its options in the GitHub Projects UI** to the five stages in `docs/team/board.md`. Enable Auto-add using Project → Workflows in GitHub UI. Use `gh project field-list PROJECT_NUMBER --owner "@me"` to check before creating fields twice.

If using a GitHub organization instead of your personal account, replace `@me` and the repo owner consistently.

## 3. Connect the skills

Update `docs/team/project-config.md` with actual URLs and the project number; commit the change in a branch/PR. In a local Claude Code/Codex/Copilot session open this repository as the workspace. Verify the agent can load a skill and read repo docs. Install/configure GitHub CLI or GitHub MCP with access to the same repository and Project.

## 4. Run a rehearsal (NOT a competition implementation)

1. Create a dummy meeting note in `docs/team/meeting-notes/` using `TEMPLATE.md`.
2. Ask AI to use `process-meeting` in draft mode.
3. Approve only a sample **setup task**; verify the task appears as a GitHub issue and board item.
4. Check doc PR diff, issue URL, project Status, and no duplicate after rerun.

## 5. Rename later

GitHub repository: Settings → General → Repository name → Rename; GitHub project: Project settings → title. Then update the local `git remote set-url origin https://github.com/OWNER/NEW-NAME.git`, `project-config.md`, hardcoded URLs, CI integrations and project branding in docs. GitHub redirects typical repo and issue URLs, but certain integrations and GitHub Actions references require extra care.
