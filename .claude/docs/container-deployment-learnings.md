# Container Deployment Learnings - MyPersn Pattern

## 🎯 Problem Summary

**Original Issue**: Production validation error `"items.1.unitPrice must not be less than 0"` for DISCOUNT items
**Root Cause**: Container startup failures due to shared library resolution issues in manual node_modules setup
**Status**: ✅ RESOLVED using MyPersn pattern

## 🔍 Key Discovery: Anti-Pattern vs Working Pattern

### ❌ **Our Previous Anti-Pattern (Broken)**
```dockerfile
# Pre-build artifacts outside container
COPY backend-deploy/server/ ./
COPY backend-deploy/prisma/ ./prisma/
COPY shared-dto-temp/ ./shared-dto-temp/

# Manual shared library setup
RUN mkdir -p ./node_modules/@gt-automotive/shared-dto/dist/
RUN cp -r ./shared-dto-temp/* ./node_modules/@gt-automotive/shared-dto/dist/
```

**Issues**:
- Complex manual node_modules manipulation
- Shared libraries not properly resolved at runtime
- Container logs showed "None" - indicating startup failures
- Fragile dependency setup prone to path issues

### ✅ **MyPersn Working Pattern**
```dockerfile
FROM node:20
WORKDIR /app
COPY . .                                    # Copy source, not artifacts
RUN yarn install --frozen-lockfile
RUN yarn nx build shared-dto               # Build deps first
RUN npx nx run server:build:production     # Nx handles lib resolution
CMD ["node", "dist/server/main.js"]       # Standard output path
```

**Benefits**:
- Let Nx handle shared library resolution naturally
- Source-based build ensures all dependencies available
- Standard Node.js module resolution works correctly
- Simpler, more maintainable Dockerfile

## 🧠 Critical Learnings

### 1. **Container Architecture Principle**
> **"Copy source and build inside container, don't manually recreate build artifacts"**

**Why**: Modern containerized applications should leverage the build system's native dependency resolution rather than trying to manually recreate the dependency graph.

### 2. **Nx Monorepo Container Pattern**
```bash
# Correct sequence for Nx monorepo containers
RUN yarn install                    # Install all workspace dependencies
RUN yarn nx build shared-dto       # Build shared libraries first
RUN npx nx run server:build:production  # Build main app (knows about deps)
```

**Key**: Nx maintains workspace dependency information that gets lost when manually copying pre-built artifacts.

### 3. **Validation vs Infrastructure Issues**
- **Original symptom**: Validation error in production
- **Actual problem**: Container wasn't starting properly due to shared lib issues
- **Learning**: Always check container health/logs before assuming code-level issues

### 4. **Azure Container Instances (ACI) Characteristics**
- **No in-place updates**: Must delete/recreate containers
- **Container accumulation**: Without proper cleanup, old containers pile up
- **DNS consistency**: Use standardized naming (`gt-automotives-backend-prod`)

## 🔧 Technical Command Corrections

### Build Commands
```bash
# ❌ Wrong (doesn't exist)
yarn nx build server --prod

# ✅ Correct (Nx production build)
npx nx run server:build:production
```

### Output Paths
```bash
# ❌ Wrong (generic Nx default)
dist/apps/server/main.js

# ✅ Correct (our Nx config)
dist/server/main.js
```

### Migration Schema Paths
```bash
# ❌ Wrong (artifact extraction)
unzip backend-artifact.zip && prisma migrate deploy --schema=prisma/schema.prisma

# ✅ Correct (source-based)
prisma migrate deploy --schema=libs/database/src/lib/prisma/schema.prisma
```

## 🚀 Deployment Workflow Evolution

### Before: Complex Artifact Approach
1. Build outside container
2. Create complex backend-deploy structure
3. Manual shared library copying
4. Complex Dockerfile with manual node_modules setup
5. Fragile dependency resolution

### After: Simple Source Approach
1. Checkout source code in workflow
2. Simple Dockerfile copying source
3. Build inside container using Nx
4. Standard Node.js module resolution
5. Reliable dependency handling

## 📊 Problem Resolution Timeline

1. **Initial Issue**: Validation error in production
2. **Investigation**: Container logs showing "None"
3. **Root Cause**: Shared library resolution failure
4. **Solution Research**: Analyzed working MyPersn pattern
5. **Implementation**: Replaced complex setup with source-based build
6. **Command Fixes**: Corrected Nx build syntax and paths
7. **Migration Fix**: Updated database migrations to use source schema directly
8. **Resolution**: Complete source-based deployment pipeline working

## 🎯 Future Container Deployment Guidelines

### Do's
- ✅ Copy source code and build inside container
- ✅ Use native package manager (yarn/npm) dependency resolution
- ✅ Let build tools (Nx) handle shared library resolution
- ✅ Follow working patterns from similar projects (MyPersn)
- ✅ Test container builds locally when possible

### Don'ts
- ❌ Manually recreate node_modules structure
- ❌ Copy pre-built artifacts without source context
- ❌ Assume complex setup is more production-ready
- ❌ Skip container health verification after deployment
- ❌ Ignore working patterns from similar architectures

## 🔗 Related Documentation
- [MyPersn Monorepo Learnings](./mypersn-monorepo-learnings.md)
- [Backend Container Deployment Config](./backend-container-deployment-config.md)
- [Shared DTO Deployment Guide](./shared-dto-deployment-guide.md)

---

## 🎉 Final Resolution Summary

The complete solution involved three critical fixes:

1. **Container Architecture**: Switched from artifact-based to source-based Docker builds (mypersn pattern)
2. **Build Commands**: Fixed Nx command syntax (`npx nx run server:build:production`)
3. **Database Migrations**: Updated to use source schema path instead of artifact extraction

**Result**: Production validation errors resolved, container deployment stability achieved, and automatic container cleanup implemented.

---

**Key Takeaway**: Sometimes the "simple" approach (copy source, build in container) is more reliable than complex pre-built artifact management, especially in monorepo environments with shared libraries.

## 🔧 Additional Critical Fix: Container Host Binding

### Issue Discovery (Sept 22, 2025)
After implementing the MyPersn pattern, containers still showed "Running" status but were not accessible (connection refused). Container logs showed "None" despite successful startup.

### Root Cause: Localhost vs 0.0.0.0 Binding

**Problem**: Our application was binding to localhost/127.0.0.1, which is not accessible from outside the container.

**Our Configuration (Broken)**:
```typescript
const port = process.env.PORT || 3000;
await app.listen(port); // Binds to localhost by default
```

**MyPersn Configuration (Working)**:
```typescript
const port = process.env.PORT || 3333;
const host = process.env.HOST || '0.0.0.0';
await app.listen(port, host); // Explicitly binds to all interfaces
```

### The Fix
```typescript
// server/src/main.ts
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';  // ← Critical addition
await app.listen(port, host);
Logger.log(`🚀 Application is running on: http://${host}:${port}`);
```

### Container Networking Principle
> **"In containerized environments, services must bind to 0.0.0.0 to accept external connections"**

- `localhost/127.0.0.1`: Only accessible from within the container
- `0.0.0.0`: Accessible from outside the container (required for Azure Container Instances)

This explains why locally built applications worked (accessed via localhost) but containers failed despite successful startup.

### Additional Critical Fixes Discovered (Sept 22, 2025)

#### 1. Redundant reflect-metadata Flag
**Problem**: Container CMD used `-r reflect-metadata/register` flag alongside importing reflect-metadata in main.ts
```dockerfile
# Problematic approach
CMD ["node", "-r", "reflect-metadata/register", "dist/server/main.js"]
```

**Solution**: Remove redundant flag since reflect-metadata is already imported in source
```dockerfile
# Fixed approach (MyPersn pattern)
CMD ["node", "dist/server/main.js"]
```

#### 2. Missing HOST Environment Variable
**Problem**: Container environment missing `HOST=0.0.0.0` variable, causing application to bind to localhost by default

**Solution**: Add HOST environment variable to deployment workflow
```yaml
--environment-variables \
  HOST="0.0.0.0" \
  PORT="3000" \
  # ... other variables
```

These fixes together should resolve the "logs showing None" issue and enable proper container startup with external accessibility.

## 🚨 Critical Discovery: Project Structure vs Build Output Paths (Sept 23, 2025)

### Issue: "Cannot find module '/app/dist/server/main.js'"

After successfully implementing the MyPersn pattern and fixing host binding, we encountered a new error showing that the build was completing successfully but the container CMD path was incorrect.

### Root Cause: Project Structure Differences

**MyPersn Project Structure**:
```
mypersn/
├── apps/server/      # Server in apps/ directory
├── apps/webapp/      # Frontend in apps/ directory
└── dist/apps/server/ # Build output reflects apps/ structure
```

**GT Automotives Structure**:
```
gt-automotives-app/
├── server/           # Server as root-level project
├── apps/webApp/      # Frontend in apps/ directory
└── server/dist/      # Build output in project root
```

### The Critical Difference

**MyPersn Dockerfile CMD (Correct for their structure)**:
```dockerfile
CMD ["node", "./dist/apps/server/main.js"]
```

**Our Previous CMD (Incorrect - copied MyPersn path)**:
```dockerfile
CMD ["node", "dist/server/main.js"]  # Wrong - this path doesn't exist
```

**Our Correct CMD (Based on actual build output)**:
```dockerfile
CMD ["node", "server/dist/main.js"]  # Correct - actual build location
```

### Build System Investigation

The build command `npx nx run server:build:production` outputs to:
- **Expected** (copied from MyPersn): `dist/server/main.js`
- **Actual** (our project): `server/dist/main.js`

This is because Nx builds to `{projectRoot}/dist/` not `dist/{projectName}/`.

### Debug Commands That Revealed the Truth

```dockerfile
# Debug commands in container build
RUN echo "Build completed, checking output..." && \
    echo "Global dist structure:" && ls -la dist/ && \
    echo "Server dist structure:" && ls -la server/dist/ && \
    echo "Server main.js exists:" && ls -la server/dist/main.js
```

**Build Logs Showed**:
- ✅ Build successful: "webpack compiled successfully"
- ✅ Global dist/ exists with shared-dto files
- ❌ No dist/server/ directory
- ✅ server/dist/main.js exists and is correct target

### Project Structure Impact on Docker Patterns

**Key Learning**: You cannot blindly copy Docker patterns between projects with different structures. Always verify:

1. **Build Output Location**: Where does `nx run [project]:build` actually place files?
2. **Project Root**: Is your target project in `apps/` or at workspace root?
3. **Path Verification**: Test the exact path that will exist in the container

### Verification Command
```bash
# Local verification of build output location
rm -rf dist/ server/dist/ && yarn nx run server:build:production --skip-nx-cache
find . -name "main.js" -path "*/dist/*" -ls | grep -v node_modules
```

This will show the exact path where your build outputs the main.js file.

### Project Structure Documentation Pattern

When documenting container deployment patterns, always include:

1. **Source Project Structure**: Where files are organized in source
2. **Build Output Structure**: Where build system places compiled files
3. **Container CMD Path**: Exact path for Docker CMD based on build output
4. **Verification Steps**: How to confirm the correct path

**Example Template**:
```markdown
## Project: [Name]
- **Structure**: server/ at root level
- **Build Command**: npx nx run server:build:production
- **Output Path**: server/dist/main.js
- **Docker CMD**: ["node", "server/dist/main.js"]
- **Verified**: ✅ 2025-09-23
```

This prevents future path confusion when adapting patterns between different project structures.