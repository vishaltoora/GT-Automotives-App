# Git Branching - Critical Rules

## 🚨 CRITICAL RULE: ALWAYS create new branches from `main` only

Every new branch (feature, fix, chore, etc.) MUST be created from an up-to-date
`main` branch — NEVER from another feature branch or the currently checked-out
branch.

### ✅ CORRECT

```bash
git checkout main
git pull origin main          # ensure main is up to date
git checkout -b feature/ga-00-short-description
```

Or in one step:

```bash
git fetch origin
git checkout -b feature/ga-00-short-description origin/main
```

### ❌ WRONG

```bash
# Currently on feature/ga-38-something ...
git checkout -b feature/ga-40-new-work   # ❌ branches off another feature branch
```

## Why This Matters

- Branching off a feature branch drags that branch's unmerged commits into the
  new branch, producing a noisy PR diff and false "changes" that are really the
  parent branch's work.
- It creates implicit dependencies between PRs and makes review, rebasing, and
  reverting harder.
- A branch cut from `main` yields a clean, self-contained PR that reflects only
  its own changes.

## Checklist Before Starting New Work

1. `git checkout main`
2. `git pull origin main` (or `git fetch origin` and branch from `origin/main`)
3. `git checkout -b <type>/<ticket>-<short-description>`
4. Verify base: `git log --oneline -1 main` should match the branch's start point.

## Exceptions

Only stack a branch on another branch when the work **genuinely depends** on
unmerged commits in that branch, and only after explicit confirmation. Default is
always branch from `main`.

---

**Status**: ✅ Active rule
