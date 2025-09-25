# Webpack Bundling Fix for Container Deployment

## Issue Summary
The Azure production container was failing due to improper webpack bundling of the backend server. The core issues were:
1. Using `NxAppWebpackPlugin` which doesn't handle monorepo shared libraries well
2. Complex manual node_modules manipulation in Docker
3. Missing critical dependencies in generated package.json

## Solution Implemented

### 1. Webpack Configuration Update
Changed from `NxAppWebpackPlugin` to `composePlugins(withNx())` pattern (MyPersn-inspired):

**File**: `server/webpack.config.js`
```javascript
const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

module.exports = composePlugins(withNx(), (config) => {
  // Set output path
  config.output = {
    ...config.output,
    path: path.join(__dirname, '../dist/server'),
    filename: 'main.js',
  };

  // Externalize critical dependencies
  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  };

  config.target = 'node';
  config.optimization = {
    ...config.optimization,
    minimize: false,
  };

  return config;
});
```

### 2. Docker Build Strategy

#### Option A: Multi-Stage Build (Optimized)
**File**: `Dockerfile`
- Two-stage build: builder and production
- Builds from source in container
- Minimal production image with only required dependencies

#### Option B: Simple Build (Fallback)
**File**: `Dockerfile.simple`
- Single-stage build based on MyPersn pattern
- Complete source build in container
- Simpler but larger image

### 3. Key Benefits
- ✅ Better shared library compatibility
- ✅ Simpler configuration
- ✅ Proven pattern from MyPersn production
- ✅ No manual node_modules manipulation
- ✅ Consistent build behavior

## Build Commands

### Local Testing
```bash
# Build server
yarn nx run server:build:production --skip-nx-cache

# Build Docker container
docker build -t gt-backend:webpack-fix -f Dockerfile.simple . --no-cache

# Test container locally
docker run -d --name test-backend \
  -p 3001:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  -e CLERK_SECRET_KEY="..." \
  gt-backend:webpack-fix

# Check health
curl http://localhost:3001/health
```

### Production Deployment
The GitHub Actions workflow (`gt-build.yml`) will automatically:
1. Use the updated webpack configuration
2. Build Docker image from source
3. Push to Azure Container Registry
4. Deploy via `gt-deploy.yml` workflow

## Key Learnings

### Why composePlugins Pattern Works Better
1. **Native Nx Integration**: Works seamlessly with Nx's dependency resolution
2. **External Module Handling**: Properly handles shared libraries and Prisma
3. **Simpler Configuration**: Less configuration needed compared to NxAppWebpackPlugin
4. **Production-Proven**: Used successfully in MyPersn production environment

### Container Best Practices Applied
1. **Build from Source**: Let container handle the build process
2. **Multi-Stage Builds**: Separate build and runtime environments
3. **Proper Externals**: Don't bundle node modules that should be external
4. **Health Checks**: Include proper health monitoring

## Next Steps
1. Monitor the next GitHub Actions build
2. Verify container deployment to Azure
3. Check production health endpoint
4. Document any remaining issues

## References
- [Container Deployment Learnings](./.claude/docs/container-deployment-learnings.md)
- [MyPersn Monorepo Learnings](./.claude/docs/mypersn-monorepo-learnings.md)
- [Backend Container Deployment Config](./.claude/docs/backend-container-deployment-config.md)

---
**Last Updated**: September 25, 2025
**Status**: ✅ Fix Implemented and Tested Locally