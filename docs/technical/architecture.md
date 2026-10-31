# Architecture and integration boundaries
**Status:** Not yet chosen; avoid designing a challenge-specific implementation before allowed.

## Tech stack
TBD at kickoff based on challenge, team abilities, and actual datasets.

## System context
Insert a simple diagram for browser/client → backend (if any) → NASA datasets/APIs and AI services (if required).

## API / data contracts
For every boundary, document input/output example, owner, failure/retry behavior, and mock/stub approach.

## Constraints
- One end-to-end vertical slice first.
- Favor known tools and the lowest operational risk.
- AI features only where essential; never hide uncertainty in scientific results.
- No secrets in the client; rate-limit external services as appropriate.

## Runbook
Local dev, test, environment variables, launch, fallback demo steps — complete after stack approval.
