# DTO Single Source of Truth — `libs/data`

## Overview

All DTOs, enums, and mapped-type helpers live in one place: **`@gt-automotive/data`** (`libs/data`).
Both the NestJS backend and the React/Vite frontend import from this single library.

---

## Key Patterns

### 1. Enum Generation (no `@prisma/client` in the browser)

Prisma enums are **generated as plain TypeScript `const` objects** — not re-exported from `@prisma/client`.

```bash
yarn enums:generate   # regenerate libs/data/src/lib/prisma-enums.ts
yarn enums:check      # verify file is in sync with schema (runs in Docker build)
```

**Script:** `scripts/generate-prisma-enums.cjs`
**Output:** `libs/data/src/lib/prisma-enums.ts`

Why this matters: re-exporting from `@prisma/client` directly would bundle Prisma into the browser (as MyPersn does). The generated `const` objects are plain JS — zero Prisma dependency in the frontend.

**Rule:** After any Prisma enum change, always run `yarn enums:generate` before committing.

---

### 2. Local `PartialType` / `OmitType` / `PickType` (no `@nestjs/common` in the browser)

`@nestjs/mapped-types` was removed. Replacements live in:

**`libs/data/src/lib/utils/mapped-types.ts`**

```typescript
import { PartialType, OmitType, PickType, IntersectionType } from '@gt-automotive/data';

export class UpdateTireDto extends PartialType(CreateTireDto) {}
export class UpdateVehicleDto extends PartialType(OmitType(CreateVehicleDto, ['vin'] as const)) {}
```

How it works:
- Copies class-validator metadata via `getMetadataStorage()` (public API)
- Copies class-transformer `@Type()` metadata via `require('class-transformer/cjs/storage')` in a try/catch (works on server, silently skips in browser)
- No `@nestjs/common` import → no Node.js built-ins (`stream`, `util`) in the Vite bundle

**Rule:** Never add `@nestjs/mapped-types` back to `libs/data/package.json` or `server/project.json`. Use the local helpers.

---

### 3. `libs/data/package.json` dependencies

```json
{
  "dependencies": {
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "tslib": "^2.3.0"
  }
}
```

No NestJS dependencies. The library is framework-agnostic.

---

### 4. Server webpack `externalDependencies`

`@gt-automotive/data` is NOT in `externalDependencies` — it gets **bundled** into `main.js`.
This is intentional: the data lib must be included so class-validator metadata is present at runtime.

In `server/webpack.config.js`:
```javascript
externals: [
  nodeExternals({
    allowlist: [/^@gt-automotive\/data(\/.*)?$/, /^@gt-automotive\/database(\/.*)?$/],
  }),
],
```

---

### 5. Docker build verification

The Dockerfile runs `yarn enums:check` before `nx build server` to catch enum drift early:

```dockerfile
RUN yarn enums:check                              # fails if prisma-enums.ts is stale
RUN yarn nx build server --configuration=production
```

---

## What NOT to do

| ❌ Don't | ✅ Do instead |
|---|---|
| `import { PartialType } from '@nestjs/mapped-types'` | `import { PartialType } from '@gt-automotive/data'` |
| Re-export enums from `@prisma/client` in the shared lib | Use generated `prisma-enums.ts` |
| Add DTOs to `server/src/common/dto/` | Add them to `libs/data/src/lib/` |
| Add `@nestjs/mapped-types` to any package.json | Use local `mapped-types.ts` helpers |

---

## Comparison with MyPersn

| | GT Automotive | MyPersn |
|---|---|---|
| Enums | Generated plain `const` — no Prisma in browser ✅ | Re-exports from `@prisma/client` directly |
| Mapped types | Local impl, no `@nestjs/common` ✅ | `@nestjs/mapped-types` → browser warnings |
| Browser bundle | Clean, no NestJS leakage ✅ | Needs `eval('require')` hacks + lazyImports |

---

**Last Updated:** June 2026 — `codex/dto-single-source-of-truth` branch
