# Docker Build Troubleshooting - Lessons Learned

## Issues Encountered During Optimization

### Issue 1: Missing .yarnrc.yml File
**Error:**
```
ERROR: failed to calculate checksum: "/.yarnrc.yml": not found
```

**Cause:**
Dockerfile tried to copy `.yarnrc.yml` but file doesn't exist in repository.

**Solution:**
Use wildcard pattern to make file optional:
```dockerfile
COPY .yarnrc.yml* .npmrc* ./
```

**Lesson:** Always use wildcards for optional configuration files.

---

### Issue 2: Prisma Command Not Found (yarn prisma)
**Error:**
```
error Command "prisma" not found.
```

**Cause:**
Using `yarn prisma` requires Prisma to be in package.json scripts section. In a monorepo with selective copying, the script may not be available.

**Failed Attempt:**
```dockerfile
RUN yarn prisma generate --schema=libs/database/src/lib/prisma/schema.prisma
```

**Lesson:** `yarn <command>` only works if defined in package.json scripts.

---

### Issue 3: npx prisma Fails with Workspace Error
**Error:**
```
error Running this command will add the dependency to the workspace root rather than workspace itself
Error: Command failed with exit code 1: yarn add prisma@6.19.0 -D --silent
```

**Cause:**
`npx prisma` tries to auto-install Prisma if not found, but Yarn workspaces prevent root-level installations.

**Failed Attempt:**
```dockerfile
RUN npx prisma generate --schema=libs/database/src/lib/prisma/schema.prisma
```

**Lesson:** `npx` auto-installation conflicts with Yarn workspaces in Docker builds.

---

### Issue 4: CORRECT Solution - Direct Binary Path
**Success:**
```dockerfile
RUN ./node_modules/.bin/prisma generate --schema=libs/database/src/lib/prisma/schema.prisma
```

**Why this works:**
- Direct path to Prisma binary in node_modules
- No script resolution needed
- No auto-installation attempted
- Works with Yarn workspaces

**Lesson:** In Docker builds with monorepos, use direct binary paths from `./node_modules/.bin/` instead of `yarn`, `npm`, or `npx`.

---

## Best Practices Learned

### 1. **Selective Copying for Monorepos**
Only copy what's needed for the specific app:
```dockerfile
COPY server ./server
COPY libs/database ./libs/database
COPY libs/data ./libs/data
# DON'T copy apps/webApp or other unused libs
```

**Benefit:** Reduces context size and build time.

---

### 2. **Optional Files with Wildcards**
```dockerfile
COPY .yarnrc.yml* .npmrc* ./
```
Asterisk makes the file optional - no error if missing.

---

###  3. **Direct Binary Execution**
For monorepo builds, prefer:
```dockerfile
RUN ./node_modules/.bin/<command>
```

Over:
```dockerfile
RUN yarn <command>      # May not work
RUN npx <command>       # May conflict with workspaces
```

---

### 4. **Nx generatePackageJson**
Critical for monorepo size reduction:
```json
{
  "generatePackageJson": true
}
```
Creates pruned package.json with only required dependencies.

---

### 5. **Multi-Stage Build Pattern**
```dockerfile
# Stage 1: Builder (full Node.js)
FROM node:20-alpine AS builder
# ... install, build ...

# Stage 2: Production (minimal)
FROM node:20-alpine AS production
# ... copy only runtime needs ...
```

**Benefit:** Final image only contains runtime artifacts, not build tools.

---

## Docker Build Command Reference

### Correct Commands for GT Automotives:

```bash
# Local build
docker build -t gt-backend-optimized:test .

# Check size
docker images gt-backend-optimized:test

# Test run
docker run --rm \
  -e PORT=8080 \
  -e DATABASE_URL="..." \
  gt-backend-optimized:test

# Clean up failed builds
docker system prune -af
```

---

### Issue 5: Lockfile Mismatch in Production Stage
**Error:**
```
error Your lockfile needs to be updated, but yarn was run with `--frozen-lockfile`.
```

**Cause:**
Nx `generatePackageJson` creates a pruned package.json with potentially different dependency versions than the original yarn.lock. When production stage tries to install with `--frozen-lockfile`, it fails due to version mismatches.

**Solution:**
Remove `--frozen-lockfile` flag from production stage install:
```dockerfile
# Production stage
RUN yarn install --production=true && \
    yarn cache clean && \
    rm -rf /tmp/*
```

**Lesson:** Generated package.json files from Nx may have different resolved versions. Production stage should allow yarn to resolve dependencies naturally.

---

## Common Errors and Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| `.yarnrc.yml not found` | Use `COPY .yarnrc.yml* ./` |
| `Command "prisma" not found` | Use `./node_modules/.bin/prisma` |
| `npx fails with workspace error` | Don't use npx, use direct path |
| `yarn <script> not found` | Use `./node_modules/.bin/<bin>` or `yarn run <script>` |
| `Large image size` | Enable `generatePackageJson: true` |
| `Slow builds` | Use `.dockerignore` and layer caching |
| `Lockfile needs update in production` | Remove `--frozen-lockfile` from production stage |

---

## Verification Checklist

Before deploying Dockerfile changes:

- [ ] `.dockerignore` excludes unnecessary files
- [ ] Only required source directories copied
- [ ] Optional files use wildcard patterns
- [ ] Prisma uses `./node_modules/.bin/prisma`
- [ ] Nx build has `generatePackageJson: true`
- [ ] Multi-stage build separates builder and production
- [ ] Production stage runs as non-root user
- [ ] Health check configured
- [ ] Alpine base image used for size

---

**Last Updated:** November 6, 2025
**Status:** Optimization in progress
