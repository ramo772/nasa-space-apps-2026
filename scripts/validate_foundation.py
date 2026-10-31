#!/usr/bin/env python3
"""Offline structural checks. Doesn't contact GitHub or modify anything."""
from pathlib import Path
import sys
root = Path(__file__).resolve().parent.parent
names = ["process-meeting", "meeting-notes", "create-issues", "sync-docs", "sync-board", "start-ticket", "grill-with-doc", "review-implementation"]
errors = []
for name in names:
    copies = []
    for prefix in [".agents/skills", ".claude/skills", ".github/skills"]:
        p = root / prefix / name / "SKILL.md"
        if not p.exists():
            errors.append(f"Missing {p.relative_to(root)}")
            continue
        content = p.read_text(encoding="utf-8")
        if not content.startswith("---\n") or "\nname:" not in content or "\ndescription:" not in content:
            errors.append(f"Invalid skill header: {p.relative_to(root)}")
        copies.append(content)
    if len(set(copies)) > 1:
        errors.append(f"Inconsistent skill copies: {name}")
for name in ["AGENTS.md", "CLAUDE.md", "README.md", "docs/team/project-config.md", "docs/team/meeting-notes/TEMPLATE.md"]:
    if not (root/name).exists(): errors.append(f"Missing required file: {name}")
if errors:
    print("Foundation validation FAILED:")
    for err in errors: print(" -", err)
    sys.exit(1)
print("Foundation validation passed: 8 skill families and essential docs present.")
