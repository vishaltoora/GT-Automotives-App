# Code Review Commands

## Overview

Commands to invoke the [Code Reviewer agent](../agents/code-reviewer.md) — the
pre-PR gate for GT Automotives. It runs the mechanical checks, then reviews the
branch diff for correctness, security, project invariants, clean code and test
coverage.

The agent is **read-only** (no Write/Edit tools). It reports; you decide what to
change.

---

## Available Commands

### `/review`

**Purpose**: Full pre-PR review of the current branch
**Usage**: `/review`

**What it does**:

1. Establishes scope from `git diff origin/main...HEAD` and confirms the branch
   was cut from `main`
2. Runs the mechanical gates — clean working tree, **committed tree typechecks**
   (in a throwaway worktree, so your working tree is untouched), lint, tests,
   build, migration integrity, no stray artifacts or secrets
3. Reviews the diff across five dimensions: correctness, security, project
   invariants, clean code, tests
4. Verifies each candidate finding before reporting it, and drops the ones it
   cannot make fail
5. Returns a pass/fail gate summary, a verdict, and findings ranked by severity

**Run it before every `gh pr create`.**

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

**What it does**: Runs §3 (authorization, IDOR/ownership, injection, XSS in
generated documents, mass assignment, secrets and data exposure) plus the
secrets and artifact gate. Skips clean-code and test-coverage review.

Use when you have already had a full review and then changed only an endpoint,
a guard or a query.

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

CI tells you the branch compiles. `/review` tells you it is safe and clean.

See also: [Testing & CI Pipeline](../docs/testing-and-ci.md).
