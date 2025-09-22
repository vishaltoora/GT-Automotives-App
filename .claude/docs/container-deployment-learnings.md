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
7. **Resolution**: Container startup and validation both working

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

**Key Takeaway**: Sometimes the "simple" approach (copy source, build in container) is more reliable than complex pre-built artifact management, especially in monorepo environments with shared libraries.