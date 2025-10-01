# Troubleshooting Guide

## Critical Schema Migration Learnings (September 28, 2025)

### Database Schema Drift Detection ✅ RESOLVED
**Problem:** Production 500 errors on `/api/companies` and `/api/tires` endpoints
```
GET https://gt-automotives.com/api/companies 500 (Internal Server Error)
Error: relation "Company" does not exist
```

**Root Cause:** Schema drift - code expected Company, TireBrand, TireSize tables that didn't exist in production database. The invoice-modification branch was merged without proper migrations.

**Critical Learning:** **NEVER commit schema changes without creating migrations first**

**Production-Safe Migration Solution:**
1. **Detect Schema Drift:** Use `prisma migrate status` to compare local vs production
2. **Custom Migration Approach:** For breaking changes with existing data:
   - Create nullable columns first
   - Migrate existing data
   - Add constraints and make required
   - Drop old columns last
3. **Data Preservation:** Always preserve existing production data during schema changes

**Migration Strategy Used:**
```sql
-- Example production-safe migration pattern
ALTER TABLE "Invoice" ADD COLUMN "companyId" TEXT; -- nullable first
UPDATE "Invoice" SET "companyId" = 'default-company-id'; -- populate data
ALTER TABLE "Invoice" ALTER COLUMN "companyId" SET NOT NULL; -- make required
```

**Prevention Commands:**
```bash
# Always check migration status before deploying
DATABASE_URL="production_url" yarn prisma migrate status

# Create migrations for ALL schema changes
DATABASE_URL="local_url" npx prisma migrate dev --name "descriptive_name"

# Deploy only after local testing
DATABASE_URL="production_url" yarn prisma migrate deploy
```

## Recent Resolutions (September 23, 2025)

### Local Development Server Startup Failures ✅ RESOLVED
**Problem:** Local development server fails with path errors:
```
Error: Could not find /Users/vishaltoora/projects/gt-automotives-app/dist/server/main.js. Make sure your build succeeded.
TypeError: Cannot read properties of undefined (reading 'data')
```
**Root Cause:** Webpack configuration incompatibility with Nx execution context

**Solution:** Use official `NxAppWebpackPlugin` pattern from Nx documentation:

```javascript
// server/webpack.config.js (LATEST WORKING VERSION)
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

**Verification:**
```bash
yarn dev  # Should start both frontend (4200) and backend (3000)
curl http://localhost:3000/health  # Should return health status
```

## Historical Issues (September 18, 2025)

### Shared-DTO Module Resolution Failure ✅ SUPERSEDED
**Problem:** Backend server crashes with module resolution errors:
```
Error: Cannot find module '/path/to/dist/libs/shared-dto'
TypeError: Reflect.getMetadata is not a function
```
**Root Cause:** Previous webpack configuration approach had issues

**Previous Solution (Now Superseded):** MyPersn pattern using `composePlugins(withNx())`:

```javascript
// server/webpack.config.js
const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

module.exports = composePlugins(withNx(), (config) => {
  config.output = {
    ...config.output,
    path: path.join(__dirname, '../dist/server'),
    filename: 'main.js',
  };

  config.externals = {
    '@prisma/client': 'commonjs @prisma/client',
    '.prisma/client': 'commonjs .prisma/client',
    '@gt-automotive/shared-dto': 'commonjs @gt-automotive/shared-dto',
  };

  return config;
});
```

**Steps to fix:**
1. Replace `NxAppWebpackPlugin` with `composePlugins(withNx())`
2. Configure proper output path to `../dist/server`
3. Set externals for shared libraries
4. Clear Nx cache: `yarn nx reset`
5. Restart servers: `yarn dev`

**Result:** Stable development servers with working shared-dto integration

## Previous Resolutions (September 17, 2025)

### Container Crash Loop in GitHub Workflow ✅ RESOLVED
**Problem:** Containers deployed via GitHub Actions would crash immediately, but direct deployment worked
**Root Causes:**
- File structure mismatch (main.js at `server/main.js` vs root)
- Missing @gt-automotive/shared-dto in node_modules
- Incorrect Dockerfile entry point
- Missing Clerk environment variables

**Solution:**
1. Reorganized file structure in workflow to match Dockerfile.simple
2. Added proper shared library setup
3. Fixed entry point to use `CMD ["node", "main.js"]`
4. Added all required environment variables to container creation

**Files Updated:**
- `.github/workflows/deploy.yml`
- See [GitHub Workflow Deployment](./github-workflow-deployment.md) for details

## Common Issues & Solutions

### Blank Pages / Nothing Displayed
**Problem:** Pages show blank content, no errors in terminal
**Solution:** Fixed by replacing CommonJS `require()` with ES6 imports in:
- `apps/webApp/src/app/hooks/useAuth.ts`
- `apps/webApp/src/app/pages/auth/Login.tsx`
- `apps/webApp/src/app/pages/auth/Register.tsx`

### Login Redirects to Home
**Problem:** After login, user redirected to home instead of dashboard
**Solution:** Remove hardcoded `afterSignInUrl` from Clerk SignIn component

### TypeScript Compilation Errors
**Problem:** Build fails with "Cannot find module" errors
**Solution:** 
```bash
yarn nx reset        # Clear Nx cache
yarn install --ignore-engines
```

### Node Version Incompatibility
**Problem:** Vite requires newer Node version
**Solution:** Use `yarn install --ignore-engines` or update Node.js

### Grid2 Import Error
**Problem:** `Failed to resolve import "@mui/material/Grid2"` or `SyntaxError: The requested module does not provide an export named 'Grid2'`
**Solution:** Use the standard Grid import instead:
```typescript
// ❌ Wrong - Grid2 is not available in MUI 7.3.1
import Grid from '@mui/material/Grid2';
import { Grid2 as Grid } from '@mui/material';

// ✅ Correct - Use standard Grid with modern syntax
import { Grid } from '@mui/material';

// Then use: <Grid size={{ xs: 12, md: 6 }}>
```

### Customer Dialog Header Overlap
**Problem:** Dialog header overlaps with form fields
**Solution:** Ensure proper spacing in DialogContent:
```typescript
<DialogContent sx={{ p: 3, pt: 3, overflow: 'visible' }}>
  <Grid container spacing={3} sx={{ mt: 1 }}>
```

### Cannot Access Customer Dashboard
**Problem:** Customer dashboard shows "page can't be reached"
**Solution:** Ensure both servers are running:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api

### ESM/CommonJS Compatibility Issues
**Problem:** `SyntaxError: Unexpected token 'export'` in shared libraries
**Solution:** Update shared library tsconfig to use CommonJS:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

### Mixed Content Security Errors (September 2025)
**Problem:** Mixed Content errors blocking API calls in production
```
Mixed Content: The page at 'https://gt-automotives.com/' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 
'http://gt-backend.eastus.azurecontainer.io:3000/api/auth/me'. 
This request has been blocked; the content must be served over HTTPS.
```

**Root Cause:** HTTPS frontend trying to call HTTP backend - browsers block this for security

**Solution:** Implemented Web App reverse proxy
1. **Frontend Configuration**: Updated `VITE_API_URL` to use `https://gt-automotives.com/api`
2. **Reverse Proxy**: Web App serves both static files and proxies `/api` requests to backend
3. **GitHub Actions Update**: Modified deployment to create Express server with `http-proxy-middleware`
4. **Result**: All API calls now use HTTPS, eliminating Mixed Content errors

**Implementation Files:**
- `.github/workflows/deploy-frontend.yml` - Creates reverse proxy server during deployment
- `apps/webApp/.env.production` - Uses HTTPS API URL
- Reverse proxy handles CORS, error handling, and logging

**Verification:**
```bash
# Test health endpoint
curl https://gt-automotives.com/health

# Should return:
{
  "status": "healthy",
  "service": "gt-automotive-web-app",
  "backend": "http://gt-backend.eastus.azurecontainer.io:3000",
  "timestamp": "2025-09-12T16:37:38.024Z"
}
```

### Authentication Page Reloads During Login
**Problem:** Login page reloads quickly after entering credentials
**Root Cause:** Clerk routing strategy conflict - `path` cannot be used with `routing="hash"`
**Solution:** Changed from hash routing to virtual routing in `Login.tsx`:
```typescript
// Before
<SignIn routing="hash" path="/sign-in" />

// After  
<SignIn routing="virtual" signUpUrl={undefined} />
```

## Current Issues Resolved ✅
- ✅ **Mixed Content Security Errors:** Fixed HTTPS/HTTP blocking with reverse proxy implementation (September 12, 2025)
- ✅ **Reverse Proxy Implementation:** Web App now proxies API calls to backend via HTTPS
- ✅ **Authentication Page Reloads:** Fixed Clerk routing from hash to virtual routing
- ✅ **Production API Configuration:** Updated GitHub Actions to use HTTPS API URLs
- ✅ **SSL Termination:** Proper SSL termination at Web App level with internal HTTP communication
- ✅ **Invoice Creation Error:** Fixed missing `/api` prefix in controller routes
- ✅ **Authentication 401/403 Errors:** Proper Clerk JWT token handling
- ✅ **MUI Grid Import Errors:** Fixed Grid2 import issues, now using standard Grid with modern syntax
- ✅ **Customer Dialog Layout:** Resolved header overlap with proper spacing and padding
- ✅ **ESM/CommonJS Compatibility:** Fixed shared library build issues
- ✅ **Login Redirect Loop:** Fixed role-based routing logic
- ✅ **Public Page Flash:** Eliminated brief content visibility during authentication
- ✅ **Loading Screen Visual:** Replaced blur effect with solid professional background
- ✅ **Quotation Creation Error:** Fixed variable name mismatch in QuotationsService (quotationData → quoteData)

## Authentication Files (August 20, 2025)
- **Created:** `server/src/auth/strategies/clerk-jwt.strategy.ts` - Clerk JWT verification
- **Modified:** `server/src/auth/guards/jwt-auth.guard.ts` - Dual strategy support
- **Modified:** `server/src/auth/auth.module.ts` - Added ClerkJwtStrategy provider
- **Modified:** `apps/webApp/src/app/hooks/useAuth.ts` - Admin user handling
- **Modified:** `apps/webApp/src/app/guards/RoleGuard.tsx` - Case-insensitive roles
- **Modified:** `libs/database/src/lib/prisma/seed.ts` - Added Vishal as admin
- **Created:** `scripts/update-vishal-clerk-id.ts` - Clerk ID update script

### Quotation System Errors (September 2025)
**Problem:** "Failed to create quote" error when creating quotations
**Root Cause:** Variable name mismatch in `server/src/quotations/quotations.service.ts` line 51
**Solution:** Fixed variable reference from `quotationData.validUntil` to `quoteData.validUntil`
```typescript
// Before (line 51)
const validUntil = quoteData.validUntil 
  ? new Date(quotationData.validUntil)  // ❌ quotationData is undefined
  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

// After
const validUntil = quoteData.validUntil 
  ? new Date(quoteData.validUntil)  // ✅ correct variable name
  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
```

## Build Issues (August 2025)

### TypeScript Compilation Errors
**Problem:** Server-side TypeScript compilation failing with various errors
**Solution:** 
- Add definite assignment assertions (`!`) to DTO properties
- Fix repository inheritance with proper `override` modifiers  
- Update auth strategy parameter ordering
- Use type casting for dynamic model access in base repositories

### TireType/TireCondition Import Errors
**Problem:** Vite build failing with "TireType is not exported" errors
**Solution:** Import enums directly from `@prisma/client` instead of shared interfaces:
```typescript
// Before
import { TireType, TireCondition } from '@gt-automotive/shared-interfaces';

// After  
import { TireType, TireCondition } from '@prisma/client';
```

### CommonJS/ESM Module Issues
**Problem:** Server startup failing with "Unexpected token 'export'" errors
**Solution:** Keep shared libraries as CommonJS for Node.js compatibility:
```json
{
  "compilerOptions": {
    "module": "commonjs"
  }
}
```

### Shared DTO Build Errors (September 2025)
**Problem:** Backend server failing to start with shared-dto compilation errors
```
Cannot find module 'date-fns' or its corresponding type declarations
Module '"../decorators"' has no exported member 'IsDate'
```

**Root Cause:**
- Unused date-utils.ts file importing non-existent date-fns dependency
- Missing IsDate decorator export in decorators.ts

**Solution:**
1. **Remove unused date-utils.ts file:**
   ```bash
   rm libs/shared-dto/src/utils/date-utils.ts
   ```

2. **Remove date-utils export from index.ts:**
   ```typescript
   // libs/shared-dto/src/utils/index.ts
   export * from './string-utils';
   // Remove: export * from './date-utils';
   export * from './file-utils';
   export * from './decorator-utils';
   ```

3. **Add missing IsDate decorator to decorators.ts:**
   ```typescript
   // libs/shared-dto/src/decorators.ts
   export function IsDate(options?: ValidationOptions) {
     return createValidationDecorator('IsDate')(options);
   }
   ```

**Result:** Backend server starts successfully without build errors

### Frontend-Backend Connection Refused
**Problem:** Frontend getting ERR_CONNECTION_REFUSED when trying to connect to backend at localhost:3000
**Symptoms:**
- Console errors: `POST http://localhost:3000/api/auth/sync net::ERR_CONNECTION_REFUSED`
- Backend appears to be running but frontend can't connect

**Solution:** Ensure backend is actually running and listening on port 3000
1. Check for build errors preventing backend startup
2. Fix any shared-dto compilation issues (see above)
3. Restart backend with `yarn dev:server`
4. Verify backend is running: `curl http://localhost:3000/health`


## Build Issues (August 2025)

### TypeScript Compilation Errors
**Problem:** Server-side TypeScript compilation failing with various errors
**Solution:** 
- Add definite assignment assertions (`!`) to DTO properties
- Fix repository inheritance with proper `override` modifiers  
- Update auth strategy parameter ordering
- Use type casting for dynamic model access in base repositories

### TireType/TireCondition Import Errors
**Problem:** Vite build failing with "TireType is not exported" errors
**Solution:** Import enums directly from `@prisma/client` instead of shared interfaces:
```typescript
// Before
import { TireType, TireCondition } from '@gt-automotive/shared-interfaces';

// After  
import { TireType, TireCondition } from '@prisma/client';
```

### CommonJS/ESM Module Issues
**Problem:** Server startup failing with "Unexpected token 'export'" errors
**Solution:** Keep shared libraries as CommonJS for Node.js compatibility:
```json
{
  "compilerOptions": {
    "module": "commonjs"
  }
}
```



## CI/CD Build Issues (September 29, 2025)

### Vite Build Path Resolution Failures ✅ RESOLVED
**Problem:** GitHub Actions builds fail with module resolution errors:
```
[vite:load-fallback] Could not load /Users/vishaltoora/projects/gt-automotives-app/libs/data/src/index.ts
(imported by src/app/pages/admin/payroll/PaymentsManagement.tsx):
ENOENT: no such file or directory, open '/Users/vishaltoora/projects/gt-automotives-app/libs/data/src/index.ts'
```

**Root Cause:** Vite alias configuration using absolute local paths that don't exist in CI/CD runners
- Local development: `/Users/username/projects/app/libs/data/src/index.ts` (works)
- GitHub Actions: `/home/runner/work/PROJECT/PROJECT/libs/data/src/index.ts` (different path structure)

**Solution:** Use relative paths in Vite configuration for cross-environment compatibility:
```typescript
// ❌ WRONG: Absolute paths fail in CI/CD
resolve: {
  alias: {
    '@gt-automotive/data': '/Users/vishaltoora/projects/gt-automotives-app/libs/data/src/index.ts',
  },
},

// ✅ CORRECT: Relative paths work everywhere
resolve: {
  alias: {
    '@gt-automotive/data': '../../libs/data/src/index.ts',
  },
},
```

**Critical Learning:**
- Always use relative paths for build-time configuration
- Test builds in clean environments (not just local development)
- CI/CD runners have different file system structures than local machines
- Path resolution failures cause complete build failures in production

**Verification Steps:**
1. **Local Build Test:** `yarn build:web` - should complete successfully
2. **Path Validation:** Check that alias points to correct relative location
3. **CI/CD Monitoring:** Watch GitHub Actions build logs for path resolution errors

**Files Fixed:**
- `apps/webApp/vite.config.ts` - Changed alias from absolute to relative path
- Result: Build success rate improved from failure to 100%

**Prevention:**
- Never use absolute paths in build configuration
- Always test builds with `yarn build:web` before committing
- Use environment-agnostic path resolution patterns

