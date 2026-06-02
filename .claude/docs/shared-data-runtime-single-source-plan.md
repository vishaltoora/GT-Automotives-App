# Shared Data Runtime Single Source Plan

Date: 2026-06-02

## Context

GT Automotives currently keeps some backend DTOs local to avoid production container crashes from missing workspace packages at runtime.

The immediate incident was caused by backend code re-exporting DTOs from `@gt-automotive/data`. The production server bundle kept a runtime `require("@gt-automotive/data")`, but the optimized Docker runtime image only copied:

- `dist/apps/server/main.js`
- `dist/apps/server/assets`
- generated `dist/apps/server/package.json`
- production npm dependencies
- Prisma client files

It did not include `/app/node_modules/@gt-automotive/data`, so the container exited before Nest startup with:

```text
Error: Cannot find module '@gt-automotive/data'
Require stack:
- /app/main.js
```

## MyPersn Comparison

MyPersn does use shared DTO/runtime libraries as a single source of truth. Its Docker pattern is different:

- Copy the full repo into the image.
- Run `yarn install` inside the full workspace.
- Build the server inside that same workspace.
- Run `node ./dist/apps/server/main.js`.

Because the full workspace install exists in the runtime image, workspace packages can resolve through `node_modules` links if the server bundle retains `require("@mypersn/shared-data-access")`.

GT's optimized multi-stage image intentionally does not keep the full workspace in the production stage. That is why the same runtime-package pattern fails here.

## Goal

Make `libs/data` the single source of truth for shared DTOs/enums without reintroducing production runtime crashes.

## Recommended Path

### 1. Preferred: Bundle `@gt-automotive/data` Into Backend Output

Keep backend imports pointed at `@gt-automotive/data`, but configure the server build so the shared data library is bundled into `dist/apps/server/main.js`.

Target state:

- Backend imports DTOs/enums from `@gt-automotive/data`.
- `dist/apps/server/main.js` contains no runtime `@gt-automotive/data` require.
- Production Docker image does not need `/app/node_modules/@gt-automotive/data`.
- Current optimized small image strategy remains viable.

Validation:

```bash
env NX_DAEMON=false NX_ISOLATE_PLUGINS=false yarn nx build server --configuration=production
grep -o "@gt-automotive/[A-Za-z0-9_-]*" dist/apps/server/main.js | sort -u
```

The grep should not print `@gt-automotive/data`.

### 2. Alternative: Include `@gt-automotive/data` As A Runtime Package

Build `libs/data`, copy its compiled output and package metadata into the production image, and make it resolvable from `/app/node_modules/@gt-automotive/data`.

Target state:

- `dist/apps/server/main.js` may contain `require("@gt-automotive/data")`.
- The production image contains `/app/node_modules/@gt-automotive/data`.
- `node -e "require.resolve('@gt-automotive/data')"` succeeds inside the image.

This keeps shared DTOs as runtime packages, but adds Docker/package-management complexity.

### 3. Not Preferred: MyPersn-Style Full Workspace Runtime

Copy the full repo into the runtime image, run a full workspace `yarn install`, build in-image, and run from that workspace.

This is simple and robust for shared-library resolution, but likely gives back GT's Docker size and deployment-time optimizations.

## Deployment Gate

Before deploying any backend image, run one of these checks:

Bundled mode:

```bash
grep -o "@gt-automotive/[A-Za-z0-9_-]*" dist/apps/server/main.js | sort -u
```

If `@gt-automotive/data` appears, the runtime image must include it.

Runtime-package mode:

```bash
docker run --rm --entrypoint sh IMAGE_TAG -c "node -e \"console.log(require.resolve('@gt-automotive/data'))\""
```

## Current Temporary State

The backend time-clock DTOs were copied locally to remove the immediate runtime dependency on `@gt-automotive/data`. This is safe for production recovery but should be revisited if shared DTOs need to become a true single source of truth again.
