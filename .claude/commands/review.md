# Code Review Commands

## Overview

Commands to invoke the pre-PR gate for GT Automotives. Two agents, run together:

| Agent                                               | Covers                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [Code Reviewer](../agents/code-reviewer.md)         | Mechanical gates, correctness, project invariants, clean code, test coverage                                             |
| [Security Reviewer](../agents/security-reviewer.md) | Authorization, IDOR and ownership, injection, what leaves the system, mass assignment, secrets and logging, availability |

Both are **read-only** (no Write/Edit tools). They report; you decide what to
change.

Why two rather than one longer checklist: a security pass done at the end of a
correctness review gets the tired half of the attention, and the two ask
different questions of the same diff. Run in parallel they also finish in about
the time one used to take.

---

## Available Commands

### `/review`

**Purpose**: Full pre-PR review of the current branch
**Usage**: `/review`

**What it does**: launches **both agents in parallel** on the same branch diff.

`code-reviewer`:

1. Establishes scope from `git diff origin/main...HEAD` and confirms the branch
   was cut from `main`
2. Runs the mechanical gates — clean working tree, **committed tree typechecks**
   (in a throwaway worktree, so your working tree is untouched), lint, tests,
   build, migration integrity, no stray artifacts or secrets
3. Reviews the diff for correctness, project invariants, clean code and tests
4. Verifies each candidate finding before reporting it, and drops the ones it
   cannot make fail

`security-reviewer`:

1. Works the attack surface this application has — the Clerk → `JwtAuthGuard` →
   `RoleGuard` → ownership chain, per-record IDOR, raw SQL, generated PDFs and
   emails, SAS URLs, mass assignment, secrets and logging, availability
2. Reports only findings it can write the attack for

Both return a verdict and findings ranked by severity.

**Run it before every `gh pr create`.** A Blocker from either agent means the
PR does not open yet.

**Example output**:

```
## Pre-PR review — feature/ga-60-appointment-reminders

**Gates**
- Branch base: cut from origin/main ✅
- Working tree clean: ✅
- Committed tree typechecks: ✅
- Lint: ✅ 0 errors
- Tests: ✅ 362 passed
- Build: ✅
- Migration: ✅ present and non-destructive
- No stray artifacts or secrets: ✅

**Verdict:** Blocked — 1 blocker

### Findings

#### 1. [Blocker] GET /api/reminders/:id has no ownership check
`server/src/reminders/reminders.controller.ts:38`
**Fails when:** any STAFF user substitutes another employee's reminder id and
reads it. @Roles('STAFF') gates the route but not the row.
**Why:** the service loads by id alone and never compares to the caller.
```

---

### `/review security`

**Purpose**: Security-only pass — faster, for a branch whose logic is already reviewed
**Usage**: `/review security`

**What it does**: runs [security-reviewer](../agents/security-reviewer.md) alone.

Use when you have already had a full review and then changed only an endpoint,
a guard, a query, or anything that leaves the system — a template, an email, an
SMS, a notification, a blob URL.

---

### `/review gates`

**Purpose**: Mechanical gates only — no diff reading
**Usage**: `/review gates`

**What it does**: Runs §2 only — clean tree, committed-tree typecheck, lint,
tests, build, migration integrity, stray artifacts and secrets. Returns
pass/fail per gate.

Use as a quick "will CI pass?" check mid-branch. It is **not** a substitute for
`/review` before opening a PR.

---

## Why the committed-tree typecheck matters

`yarn typecheck` checks your **working tree**. If your editor has an
in-progress edit, or `git add -A` swept one up, the commit you are about to push
can be broken while your local checks are green. This has already happened on
this repo.

The agent typechecks `HEAD` in a temporary `git worktree`, so what it verifies is
exactly what will land on the PR — and your working tree is never touched.

---

## Relationship to the CI pipeline

| Check                    | Husky pre-push             | CI on PR    | `/review`             |
| ------------------------ | -------------------------- | ----------- | --------------------- |
| Lint                     | ✅ affected                | ✅ affected | ✅ all                |
| Typecheck                | ✅ affected (working tree) | ✅ affected | ✅ **committed tree** |
| Unit tests               | ✅ affected                | ✅ affected | ✅ all                |
| Build                    | —                          | —           | ✅                    |
| Migration integrity      | —                          | —           | ✅                    |
| Destructive SQL          | —                          | —           | ✅                    |
| Authorization / IDOR     | —                          | —           | ✅                    |
| Injection, XSS in PDFs   | —                          | —           | ✅                    |
| Secrets, stray artifacts | —                          | —           | ✅                    |
| Clean code, duplication  | —                          | —           | ✅                    |
| Commit message accuracy  | —                          | —           | ✅                    |
| Ownership / IDOR per row | —                          | —           | ✅ security-reviewer  |
| What leaves the system   | —                          | —           | ✅ security-reviewer  |
| Availability under load  | —                          | —           | ✅ security-reviewer  |

CI tells you the branch compiles. `/review` tells you it is safe and clean.

See also: [Testing & CI Pipeline](../docs/testing-and-ci.md).
