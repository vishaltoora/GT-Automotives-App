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

## 🎯 Critical Discovery: GitHub Workflow vs Local Build Differences (Sept 23, 2025)

### Issue: Working Local Container vs Failing GitHub Workflow Container

After successfully fixing the application crash on database connection errors and implementing proper resilience, we discovered that containers built through GitHub Actions would crash with ExitCode 1 while identically configured containers built locally would work perfectly.

### Root Cause: Dockerfile Path Mismatch in Repository

**Problem**: The committed Dockerfile in the repository had an incorrect CMD path that differed from the working local container build method.

**Repository Dockerfile (Incorrect)**:
```dockerfile
# File: Dockerfile
CMD ["node", "server/dist/main.js"]  # ❌ This path was wrong
```

**Working Local Build Method**:
Used a different build script pattern that created the correct structure:
```dockerfile
# Local deployment script pattern
CMD ["node", "dist/server/main.js"]  # ✅ This path was correct
```

### Path Analysis Through Docker History

**Working Local Image**:
```bash
docker history gt-backend:symlink-fix
# Shows: CMD ["node" "dist/server/main.js"]
```

**Failed GitHub Workflow Image**:
```bash
# Built from repository Dockerfile
# Used: CMD ["node", "server/dist/main.js"]
```

### Container Structure Verification

**Working Local Container Structure**:
```
/app/
├── dist/
│   ├── libs/           # Shared libraries
│   └── server/
│       └── main.js     # ✅ Correct target
├── libs/               # Source libraries
├── node_modules/       # Dependencies
└── package.json
```

**GitHub Workflow Expected Structure**:
```
/app/
├── server/
│   └── dist/
│       └── main.js     # ❌ Path doesn't exist
```

### Build System Path Differences

The issue occurred because:

1. **Nx Build Output**: `npx nx run server:build:production` outputs to `dist/server/main.js`
2. **Repository Dockerfile**: Expected `server/dist/main.js` (wrong)
3. **Local Build Script**: Used correct `dist/server/main.js` path

### Environment Variable Issues Discovered

Beyond the path issue, the GitHub workflow was also setting incorrect Clerk environment variables:

**GitHub Workflow Environment (Incorrect)**:
```yaml
CLERK_PUBLISHABLE_KEY: pk_test_...                                          # Test key
CLERK_SECRET_KEY: sk_live_...                                               # Live key
```

**Production Environment (Correct)**:
```yaml
CLERK_PUBLISHABLE_KEY: pk_live_...                                          # Live key
CLERK_SECRET_KEY: sk_live_...                                               # Live key
```

The test/live key mismatch was causing authentication failures during container startup.

### Resolution Process

1. **Path Investigation**: Compared working local vs failing GitHub images
2. **Structure Analysis**: Verified actual build output locations
3. **Environment Audit**: Checked for mismatched Clerk credentials
4. **Local Verification**: Built working image locally with production environment variables
5. **Registry Push**: Tagged and pushed working local build to replace failing workflow build
6. **Container Recreation**: Deleted failing container and created new one with working image

### Container Deployment Results

**Failed GitHub Workflow Container**:
- Image: `gtautomotivesregistry.azurecr.io/gt-backend:container-deploy-build-20250923-191419-f93d4be`
- Status: CrashLoopBackOff (6 restart attempts)
- Exit Code: 1
- Logs: "None" (no startup logs)

**Working Local Build Container**:
- Image: `gtautomotivesregistry.azurecr.io/gt-backend:build-20250923-135217-f93d4be`
- Status: Running (0 restart count)
- Health: ✅ Responding successfully
- Memory: 23MB used / 25MB total

### Critical Lessons for CI/CD Consistency

**Do's**:
- ✅ **Test locally first**: Always build and test container images locally before pushing
- ✅ **Path verification**: Verify build output paths match Dockerfile CMD paths
- ✅ **Environment parity**: Ensure GitHub secrets match actual production requirements
- ✅ **Incremental testing**: Test with production environment variables locally
- ✅ **Image comparison**: Compare successful local vs failing CI builds

**Don'ts**:
- ❌ **Assume CI=Local**: Don't assume GitHub workflow builds identical to local builds
- ❌ **Skip local testing**: Don't deploy directly from CI without local verification
- ❌ **Ignore path differences**: Don't copy Dockerfile patterns without path verification
- ❌ **Mix environment keys**: Don't mix test/live credentials in production

### Future Workflow Improvements Needed

1. **Dockerfile Correction**: Fix repository Dockerfile CMD path to match actual build output
2. **Environment Variables**: Update GitHub secrets to use correct production Clerk keys
3. **Pre-deployment Testing**: Add local container test step before GitHub workflow deployment
4. **Path Validation**: Add build step to verify main.js exists at expected CMD path
5. **Environment Validation**: Verify all environment variables are correct for production use

### Long-term CI/CD Pattern

For future container deployments:

1. **Local Build & Test**: Always build and test containers locally first
2. **Path Verification**: Confirm Dockerfile CMD matches actual build output
3. **Environment Audit**: Verify all environment variables are production-ready
4. **Incremental Deployment**: Push working local builds as fallback for CI issues
5. **Monitoring Setup**: Implement proper health checks and restart count monitoring

This approach ensures that CI/CD pipelines produce the same results as local development environments.

## 🔧 Local Development Server Management & Webpack Fix Resolution (Sept 23, 2025)

### Issue: Local Development Server Startup Failures After Container Deployment Success

After successfully resolving container deployment issues and implementing the MyPersn pattern, we encountered local development server startup failures. This highlighted a critical distinction between container deployment (which works) and local development webpack configuration (which needed fixing).

### Root Cause: Webpack Configuration Incompatibility with Nx

**Problem**: Local development server failed with `Error: Could not find /Users/vishaltoora/projects/gt-automotives-app/dist/server/main.js`

**Original Problematic Webpack Config**:
```javascript
// server/webpack.config.js (broken)
const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  config.output.path = path.join(__dirname, '../dist/server');
  config.output.filename = 'main.js';
  return config;
});
```

**Issues with Original Approach**:
- Overriding Nx's internal webpack configuration caused execution context failures
- `composePlugins(withNx())` pattern didn't work properly for server applications
- Manual output path configuration conflicted with Nx's build system

### Resolution: Official NxAppWebpackPlugin Pattern

**Fixed Webpack Configuration** (following Nx documentation):
```javascript
// server/webpack.config.js (working)
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../dist/server'),
  },
  devtool: 'source-map',
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
```

### Key Discoveries and Learning Process

**1. MyPersn Reference Analysis**
- User suggested examining MyPersn project webpack configuration for monorepo patterns
- MyPersn used simpler configuration without output path overrides
- Initial attempts to copy MyPersn pattern didn't resolve the core issue

**2. Critical User Guidance: "Check Nx Documentation"**
- User's suggestion to "check nx documentaion for webpack configuration" was the breakthrough
- Official Nx documentation revealed `NxAppWebpackPlugin` as the correct approach for server applications
- This pattern respects Nx's execution context and build system

**3. Webpack Build vs Execution Context**
- Webpack successfully compiled but didn't generate output files
- Error: `TypeError: Cannot read properties of undefined (reading 'data')` indicated missing Nx context
- Direct webpack execution lacked the execution context that Nx provides

### Development Server Management Best Practices

**Server Restart Process**:
```bash
# Clean restart of both frontend and backend
yarn dev  # Runs both webApp and server in parallel via Nx
```

**Expected Output for Successful Startup**:
```
✅ Frontend (Vite): http://localhost:4200 (ready in ~296ms)
✅ Backend (NestJS): http://localhost:3000 (all modules initialized)
```

**Health Check Verification**:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"...","uptime":...}
```

### Container vs Local Development Architecture

**Container Deployment (Production)**:
- Uses source-based Docker builds (MyPersn pattern)
- Builds inside container with proper Nx context
- CMD: `["node", "dist/server/main.js"]`
- Status: ✅ Working perfectly

**Local Development**:
- Uses webpack-dev-server with hot reload
- Requires proper Nx webpack plugin configuration
- Output: `dist/server/main.js` for Nx node executor
- Status: ✅ Fixed with NxAppWebpackPlugin

### Critical Learning: Technology-Specific Documentation Priority

**Pattern Recognition**:
1. **User Guidance**: Look at similar working projects (MyPersn) for patterns
2. **Official Documentation**: When patterns don't work, consult framework-specific docs (Nx)
3. **Root Cause Analysis**: Distinguish between build success and execution context failures

**Key Takeaway**: When adapting patterns between projects, always verify compatibility with the specific framework's official configuration approach. Community patterns may not always align with the latest official recommendations.

### Verification Commands for Future Reference

**Check Build Output Location**:
```bash
# Verify where Nx actually builds the server application
rm -rf dist/ server/dist/ && yarn nx run server:build:production --skip-nx-cache
find . -name "main.js" -path "*/dist/*" -ls | grep -v node_modules
```

**Test Local Development Servers**:
```bash
# Start both servers
yarn dev

# Verify frontend
curl -s http://localhost:4200 | head -n 5

# Verify backend health
curl -s http://localhost:3000/health | jq
```

**Webpack Configuration Validation**:
```bash
# Test webpack config directly (should NOT be needed in normal development)
cd server && npx webpack-cli build --node-env=development
ls -la ../dist/server/  # Should show main.js if config is correct
```

### Future Development Server Troubleshooting

**If Local Servers Fail to Start**:
1. Check webpack configuration follows NxAppWebpackPlugin pattern
2. Clear Nx cache: `yarn nx reset`
3. Verify TypeScript compilation: `yarn nx run server:build`
4. Check for port conflicts: `lsof -i :3000 -i :4200`
5. Restart with fresh yarn dev

**If Container Deployment Fails**:
1. Verify production build works locally first
2. Check Dockerfile CMD path matches actual build output
3. Ensure environment variables are production-ready
4. Test with local Docker build before CI/CD deployment

This resolution demonstrates the importance of following framework-specific official documentation when community patterns or cross-project adaptations don't work as expected.