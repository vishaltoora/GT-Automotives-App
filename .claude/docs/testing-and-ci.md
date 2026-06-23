# Testing & CI Pipeline

This document describes the test + lint + CI setup added to gate every branch
before it merges to `main`. Everything runs **locally** (before you push) and in
**CI** (on every PR).

## TL;DR — commands

```bash
# Run the same checks CI runs, scoped to what you changed:
yarn verify                 # nx affected: lint + typecheck + unit tests

# Or run everything across all projects:
yarn verify:all             # nx run-many: lint + typecheck + unit tests (all)

# Individual stages:
yarn lint                   # eslint across all projects
yarn typecheck              # tsc across all projects
yarn test                   # unit tests across all projects (alias: test:unit)
yarn test:integration:local # backend integration tests vs local Postgres test DB
yarn lint:fix               # eslint --fix across all projects
```

## What runs where

| Stage             | Tooling                                    | Local                         | CI on **PR** | CI on **merge to main** |
| ----------------- | ------------------------------------------ | ----------------------------- | ------------ | ----------------------- |
| Lint              | ESLint (`@nx/eslint`)                      | pre-push, `yarn lint`         | ✅ affected  | ✅ affected             |
| Typecheck         | `tsc --build`                              | pre-push, `yarn typecheck`    | ✅ affected  | ✅ affected             |
| Unit tests        | Jest (`ts-jest`, `@testing-library/react`) | pre-push, `yarn test`         | ✅ affected  | ✅ affected             |
| Integration tests | Jest + real Prisma + Postgres              | `yarn test:integration:local` | —            | ✅ service container    |
| Formatting        | Prettier (via lint-staged)                 | pre-commit (staged files)     | —            | —                       |

The split keeps PRs fast (no database spin-up) and runs the heavier
integration suite once, at merge time.

## Unit tests

- **Runner:** Jest (configured through the `@nx/jest` plugin — any project with a
  `jest.config.ts` gets an inferred `test` target).
- **Backend (`server`):** `@nestjs/testing` / plain instantiation with mocked
  collaborators. No database. Files: `server/src/**/*.spec.ts`.
  Example: [invoices.service.spec.ts](../../server/src/invoices/invoices.service.spec.ts).
- **Frontend (`webApp`):** `@testing-library/react` on jsdom.
  Files: `apps/webApp/src/**/*.spec.ts(x)`.
  Example: [phone.spec.ts](../../apps/webApp/src/app/utils/phone.spec.ts).
- **DTO lib (`data`):** `class-validator` validation tests.
  Example: [customer.dto.spec.ts](../../libs/data/src/lib/customer.dto.spec.ts).

Run a single project: `yarn nx test server` (or `data`, `webApp`).

## Integration tests (backend, real Postgres)

- **Files:** `server/src/**/*.integration-spec.ts`
- **Config:** `server/jest.integration.config.ts` (separate target so unit runs stay fast)
- **Target:** `yarn nx test-integration server`
- **Schema:** applied automatically before tests by
  `server/test/integration-global-setup.ts` (runs `prisma migrate deploy`).
- **Safety guard:** the global setup refuses any `DATABASE_URL` whose database
  name does not contain `test`, so it can never touch the dev/prod DB.

### Getting a test database locally

You already have Postgres running locally, so the simplest path is a dedicated
test database:

```bash
# one-time
createdb gt_automotive_test   # or: psql -c 'CREATE DATABASE gt_automotive_test'

# run
yarn test:integration:local
```

`test:integration:local` points `DATABASE_URL` at
`postgresql://postgres@localhost:5432/gt_automotive_test`.

Alternatively, for a fully throwaway DB (no local Postgres needed) use Docker:

```bash
docker compose -f docker-compose.test.yml up -d
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gt_automotive_test?schema=public" \
  yarn nx test-integration server
docker compose -f docker-compose.test.yml down -v
```

## Local enforcement (Husky)

- **pre-commit** → `lint-staged`: `eslint --fix` + `prettier --write` on staged
  files only (fast).
- **pre-push** → hard gate: `nx affected -t lint typecheck test` against
  `origin/main`. A failing branch cannot be pushed.
  - Integration tests are **not** in pre-push (they need a DB) — CI covers them.
  - Emergency bypass: `git push --no-verify`.

Hooks are installed automatically via the `prepare` script (`husky`) on
`yarn install`.

## CI: `gt-ci.yml`

Two jobs, selected by event:

- **`pr-checks`** — runs on every `pull_request` targeting `main` (and on manual
  `workflow_dispatch`). Fast gate, no database:
  1. Install + `prisma generate`
  2. `nx affected` → lint → typecheck → unit tests
- **`main-checks`** — runs on `push` to `main` (i.e. after a merge). Full gate:
  1. Install + `prisma generate`
  2. `nx affected` → lint → typecheck → unit tests
  3. Backend integration tests against a Postgres **service container**

It does **not** deploy. `gt-build.yml` / `gt-deploy.yml` still handle build
artifacts and deployment after merge.

### Make it required (branch protection)

The PR gate only blocks merges once it's a required status check. In GitHub:

> Settings → Branches → Branch protection rules → add/edit rule for `main` →
> ✅ "Require status checks to pass before merging" →
> select **`PR — Lint / Typecheck / Unit`** (the `pr-checks` job) →
> (recommended) ✅ "Require branches to be up to date before merging".

## ESLint baseline (important)

This codebase had **never been linted** before this setup. Enabling lint
surfaced ~146 pre-existing errors and ~2,000 warnings. Rather than block all work
on a large cleanup, the rules that existing code violates are **downgraded to
`warn`** in the root `.eslintrc.json` (and a couple of webApp-only rules in
`apps/webApp/.eslintrc.json`). Warnings are reported in CI logs but do **not**
fail the build.

What this means:

- **Errors = 0** today, so the gate is green and blocks _new_ error categories.
- High-value rules stay **errors**: `@nx/enforce-module-boundaries`, the
  `process.env.VITE_*` ban, React rules-of-hooks (warn for now), and every rule
  not currently violated.
- **Ratchet plan:** over time, fix violations of a baselined rule and promote it
  back from `warn` to `error`. The baselined rules are grouped in a single
  override block in `.eslintrc.json` for visibility.

Generated/build files are excluded from lint via project `ignorePatterns` and
`.eslintignore` (`dist`, `node_modules`, `**/*.d.ts`, `temp_js.js`, etc.).

## Node / package manager

- Node **20** (`.nvmrc`, `engines`). Run `nvm use` to match.
- Yarn 1.x with `--frozen-lockfile` in CI.
