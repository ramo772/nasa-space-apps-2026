# Team working agreement

## Communication
- Chat is quick coordination; GitHub stores actual work and decisions.
- Decisions made in chat/calls are summarized in the relevant issue/decision document within the same work session.
- Flag blockers quickly with `blocked` label and tag the person who can unblock.

## Git and review
- `main` must remain demoable; never push directly to it during development.
- Branch: `feat/123-brief-name`, `fix/456-brief-name`, `docs/789-brief-name`.
- PR must link a GitHub issue, say what changed and how it was verified.
- One independent approval for normal PRs, or TL-designated rapid review during the 48h sprint.
- Avoid huge PRs. No infrastructure change or paid service without TL consent.
- Prefer feature flags or simple toggles for unstable components; retain a reliable fallback demo.

## Definition of Ready
Problem, acceptance criteria, owner, sources, approved identity/tokens and art references if UI, scope, dependencies.

## Definition of Done
Acceptance criteria, tests/demo evidence, documentation, identity and data provenance, review, integrated demo.

## Risk rule
At least 2 hours before the submission deadline, scope freezes except for P0 blockers and content corrections.
