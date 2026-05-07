---
name: gt-automotives-code-review
description: Review GT Automotives code changes for bugs, regressions, security issues, data isolation problems, migration mistakes, missing tests, frontend UX regressions, backend/API contract issues, and deployment risks. Use when the user asks for a review, audit, PR review, sanity check, or wants Codex to inspect recent changes before commit or deployment.
---

# GT Automotives Code Review

## Review Stance

Act as a bug finder. Lead with concrete findings ordered by severity. Do not summarize first unless there are no findings.

For every finding, include:

- File and line reference.
- Why it is a real risk in this repo.
- The user-visible, data, security, deployment, or maintenance impact.
- A concise fix direction.

If no issues are found, say that clearly and list any residual validation or test gaps.

## Review Workflow

1. Inspect changed files with `git status --short` and `git diff --stat`.
2. Read the actual diff, not just filenames.
3. For each changed area, inspect nearby existing patterns to avoid false positives.
4. Check the GT-specific risk list below.
5. Run or recommend focused validation based on touched files.
6. Return findings first, then open questions, then a short test/validation note.

## GT-Specific Risks

- Frontend Vite env vars must use `import.meta.env.VITE_*`, not `process.env.VITE_*`.
- Prisma schema changes must include a migration. `prisma db push` is never acceptable.
- Required database columns on populated tables need production-safe migration SQL.
- Controllers must not duplicate the global `/api` prefix.
- Customer-facing endpoints must isolate customer data by authenticated user.
- Staff permissions must not allow price edits or financial report access.
- Financial, inventory, payment, commission, payroll, invoice, and appointment updates need transaction safety where multiple records change.
- Browser dialogs are not allowed; use the custom confirmation/error dialog systems.
- Errors should go through `ErrorContext` or the established local error handling pattern.
- Date/time logic must preserve business dates in the Vancouver timezone and avoid `toISOString().split('T')[0]` for local business dates.
- SMS changes must respect opt-in/opt-out, STOP/START handling, and Telnyx delivery behavior.
- DTO/API contract changes must keep frontend requests, backend DTOs, shared DTOs, and Prisma enums aligned.
- MUI Grid should use `size={{ ... }}` syntax in modernized areas.

## Validation Expectations

Ask whether validation was run only when the answer affects confidence. Otherwise, run focused checks when feasible:

- Frontend: `yarn nx build webApp`, targeted component tests if present.
- Backend: `yarn nx test server` or targeted Jest tests.
- Shared DTO/API: build both relevant frontend and backend targets.
- Prisma: migration status plus inspection of generated migration SQL.
- Review-only quick scan: `rg` for env vars, controller prefixes, browser dialogs, and schema/migration mismatch.

## Output Format

Use this order:

1. Findings
2. Open questions or assumptions
3. Validation note

Keep the review concise. Do not list low-value style preferences unless they hide a bug or meaningful maintenance risk.

## Reference

Read `references/gt-review-checklist.md` when reviewing changes that touch auth, roles, database schema, production deployment, payments, invoices, appointments, SMS, or customer-visible workflows.
