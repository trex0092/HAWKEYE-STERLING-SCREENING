# Security Policy

## Scope & disclaimer

This repository is a **demo / reference build**. All `/api/*` routes are
deterministic offline mocks — there is no real sanctions data, no external
service integration, and no secrets in the codebase. Do not deploy it as a
production compliance system.

## Supported versions

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| older tags | ❌ |

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, report privately using GitHub's
[**Private vulnerability reporting**](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/security/advisories/new)
(Security → Advisories → "Report a vulnerability").

Please include:

- A description of the issue and its impact
- Steps to reproduce (proof of concept if possible)
- Affected files / routes and any suggested remediation

### What to expect

- **Acknowledgement** within 5 business days.
- An assessment and, where applicable, a fix on a coordinated timeline.
- Credit in the release notes if you wish.

## Good-practice notes for contributors

- Never commit secrets or `.env*.local` files (they are git-ignored).
- Keep `/api/*` handlers free of live network calls and credentials.
- Treat any user-supplied input in routes as untrusted; parse bodies defensively.
