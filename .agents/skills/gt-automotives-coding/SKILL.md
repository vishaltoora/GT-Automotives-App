---
name: gt-automotives-coding
description: Implement code changes in the GT Automotives Nx monorepo. Use for frontend React/Vite/Material UI work, NestJS backend work, Prisma/schema changes, DTO/API contract changes, auth/role workflows, invoices, appointments, SMS, inventory, payroll, reports, and any task where Codex should follow this repository's coding, validation, migration, and deployment rules.
---

# GT Automotives Coding

## Workflow

1. Read `AGENTS.md` first for current repo rules and active docs.
2. Inspect the touched feature area before editing. Prefer `rg`, `rg --files`, and Nx MCP tools when available.
3. Preserve existing patterns. Use nearby components, services, repositories, DTOs, and request helpers as the implementation model.
4. Make the smallest complete change that handles the user request end to end.
5. Run focused validation for the touched area. Prefer Nx commands.
6. In the final response, mention changed files and any validation that could not be run.

## Core Rules

- Frontend Vite env vars: use `import.meta.env.VITE_*`, never `process.env.VITE_*`.
- Backend env vars: use `process.env.*`.
- Prisma schema changes: never edit `libs/database/src/lib/prisma/schema.prisma` without creating a migration.
- Never use `prisma db push`; use `prisma migrate dev` locally and `prisma migrate deploy` for production.
- NestJS API prefix: `server/src/main.ts` owns `app.setGlobalPrefix('api')`; controller decorators must not start with `api/`.
- Customer data isolation is mandatory. Customers see only their own data.
- Staff cannot modify prices. Financial reports are admin-only.
- Use Clerk auth or `MockClerkProvider` in dev paths already established by the repo.
- Use custom dialog/ErrorContext flows instead of `window.alert` or `window.confirm`.
- Use theme colors and existing design tokens; avoid hardcoded UI colors unless the local pattern already does it.
- Use MUI Grid modern syntax: `<Grid size={{ xs: 12, md: 6 }}>`.
- Prefer DTOs with `class-validator` for API contracts. Import duplicated enums from `@prisma/client`.
- For optional DTO fields, prefer `undefined`; convert to `null` only at repository/database boundaries where needed.

## Frontend Pattern

When editing `apps/webApp/src`:

- Route API calls through existing `requests/*.requests.ts` helpers or nearby service patterns.
- Keep auth token handling consistent with `useAuth`, Clerk provider, and existing request helpers.
- Use React Query patterns where the feature already uses React Query.
- For search-as-you-type, separate immediate input state from debounced API params and use a 300ms debounce.
- Reset pagination when search/filter criteria change.
- Add loading, empty, and error states when changing user-facing data flows.
- Keep public pages visually consistent with existing GT components and MUI theme.

## Backend Pattern

When editing `server/src`:

- Keep controllers thin. Put business logic in services and database access in repositories.
- Apply role guards and decorators at the controller level.
- Use transactions for multi-record writes, financial operations, inventory changes, appointment payment changes, and any workflow that must stay consistent.
- Validate inbound data with DTOs and `class-validator`.
- Log admin/security-sensitive actions when the surrounding module already has audit patterns.
- Check date/time handling carefully. Prefer existing timezone utilities for business dates and appointment/payment reporting.

## Database Changes

Before touching Prisma schema:

1. Check migration status:
   ```bash
   yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
   ```
2. Edit `libs/database/src/lib/prisma/schema.prisma`.
3. Create a migration immediately:
   ```bash
   DATABASE_URL="$DATABASE_URL" npx prisma migrate dev --name "descriptive_name" --schema=libs/database/src/lib/prisma/schema.prisma
   ```
4. Review generated SQL for production safety.

Use nullable-first migrations for required columns on existing tables.

## Validation

Choose validation based on risk and touched files:

- Frontend component/request changes: `yarn nx build webApp`, targeted tests if present.
- Backend service/controller changes: `yarn nx test server` or a targeted Jest pattern.
- Shared DTO changes: build both server and web app when practical.
- Prisma changes: migration status plus server build/test.
- Broad refactors: `yarn lint`, `yarn test`, or Nx affected commands when available.

Nx can fail in Codex/Claude-style sandboxes with `Failed to start plugin worker` because Nx uses Unix sockets for daemon communication, plugin isolation, and forked task execution. If a normal Nx command fails before running tasks, retry with:

```bash
env NX_DAEMON=false NX_ISOLATE_PLUGINS=false yarn typecheck
```

If that still fails at Nx infrastructure level, use direct project checks as a fallback and report the Nx limitation:

```bash
yarn typecheck:web
yarn typecheck:server
```

If validation fails, fix the issue if it is caused by the current task. If validation cannot run because of environment or dependency problems, report that clearly.

## Reference

Read `references/gt-automotives-checklist.md` when the task touches auth, roles, money, database migrations, appointments, SMS, invoices, or production deployment behavior.
