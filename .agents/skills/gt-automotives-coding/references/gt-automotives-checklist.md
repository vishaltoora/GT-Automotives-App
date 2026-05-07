# GT Automotives Coding Checklist

## Repo Shape

- Frontend: `apps/webApp/src`
- Backend: `server/src`
- Shared DTOs: `libs/data/src/lib`
- Prisma schema and migrations: `libs/database/src/lib/prisma`
- Public docs/rules: `AGENTS.md`, `CLAUDE.md`, `.claude/docs`, `.claude/rules`

## Before Editing

- Identify the feature owner: public web, admin, staff, accountant, customer, backend service, repository, DTO, or database.
- Read nearby files for the local pattern before introducing helpers.
- Check whether there are generated/shared DTOs that must change together.
- For schema changes, check migration status before editing.

## Implementation Checks

- Frontend requests align with backend route names and global `/api` prefix.
- Protected UI also has backend role enforcement; do not rely on frontend hiding alone.
- Customer routes filter by authenticated customer/user ownership.
- Monetary values preserve existing GST/PST, discount, tip, and payment-method behavior.
- Inventory adjustments update stock consistently and preserve audit/history patterns.
- Appointment dates use existing business date/timezone utilities.
- SMS sends only to opted-in recipients unless the flow is explicit consent handling.
- File/image/PDF work follows existing Azure/PDF viewer patterns.

## Validation Shortlist

Run the smallest useful set:

```bash
yarn nx build webApp
yarn nx test server
yarn prisma migrate status --schema=libs/database/src/lib/prisma/schema.prisma
```

Use targeted commands instead when the repo already has narrower scripts for the touched area.
