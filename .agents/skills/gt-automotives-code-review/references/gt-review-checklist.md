# GT Automotives Review Checklist

## High-Severity Review Targets

- Data isolation: customer endpoints and queries must not expose other customers' records.
- Authorization: staff/supervisor/accountant/admin permissions must match the business rules.
- Money: payments, invoices, commissions, payroll, taxes, discounts, tips, and cash reports need careful totals and transaction safety.
- Database: schema changes need migrations, production-safe SQL, and no `db push`.
- Timezone: appointment and payment reporting must preserve Vancouver business dates.
- Deployment: frontend env vars must be Vite-compatible; backend secrets must stay server-only.

## Fast Static Scans

Use these scans when relevant:

```bash
rg "process\\.env\\.VITE_" apps/webApp/src
rg "window\\.(alert|confirm|prompt)" apps/webApp/src
rg "@Controller\\('api/" server/src
rg "toISOString\\(\\)\\.split" server/src apps/webApp/src
rg "db push|prisma db push" .
```

## Diff Reading Prompts

Ask of every diff:

- Does this change update all callers and contracts?
- Could this route return or mutate another customer's data?
- Is there a backend check for every frontend permission assumption?
- Does a multi-record write need a transaction?
- Did a schema change include a migration and safe defaults?
- Are errors presented through the app's dialog/error context patterns?
- Is there a test or validation command covering the risky behavior?

## Finding Severity Guide

- High: security/data leak, money corruption, migration/deployment break, auth bypass, production crash.
- Medium: user-visible regression, missing transaction in risky workflow, broken validation, stale API contract.
- Low: maintainability issue with real future bug risk.

Avoid reporting pure style nits.
