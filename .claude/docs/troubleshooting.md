# Troubleshooting Guide

## SMS Not Sending in Production (October 28, 2025)

### No SMS Messages Being Sent ✅ RESOLVED
**Problem:** Production deployment running, but no SMS messages being sent
```
✅ Environment variables configured (TELNYX_API_KEY, SMS_ENABLED=true)
✅ SMS service code properly integrated
✅ Appointments being created
❌ No SMS confirmations or alerts sent
```

**Root Cause:** Database tables missing - schema drift
- SMS models (`SmsMessage`, `SmsPreference`) existed in schema.prisma
- Migration was never created during development
- Production database had no `sms_messages` or `sms_preferences` tables
- SMS service failed silently when checking preferences (table didn't exist)

**Investigation Steps:**
1. ✅ Verified environment variables in Azure Web App
2. ✅ Checked SMS service initialization code
3. ✅ Verified appointments service SMS integration
4. ❌ Checked database for SMS tables - **NOT FOUND**

**Why This Happened:**
- Schema changes were made using `prisma db push` in development
- No migration file was created with `prisma migrate dev`
- Production database was not updated with SMS schema
- Prisma said "database is up to date" but was checking migration history, not actual schema

**Solution:**
1. Deploy schema to production:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push --accept-data-loss
   ```

2. Create default SMS preferences:
   ```sql
   -- 106 customers with phone numbers (opted-in)
   INSERT INTO sms_preferences (customerId, optedIn=true, appointmentReminders=true)

   -- 7 staff/admin users (opted-in)
   INSERT INTO sms_preferences (userId, optedIn=true, appointmentAlerts=true)
   ```

3. Create migration for version control:
   ```bash
   # Create migration file manually
   libs/database/src/lib/prisma/migrations/20251028230000_add_sms_tables/migration.sql

   # Mark as applied in both databases
   prisma migrate resolve --applied 20251028230000_add_sms_tables
   ```

4. Restart backend:
   ```bash
   az webapp restart --name gt-automotives-backend-api
   ```

**Database State After Fix:**
- ✅ `sms_messages` table created with indexes
- ✅ `sms_preferences` table created with indexes
- ✅ 113 SMS preferences created (106 customers + 7 users)
- ✅ All users opted-in by default
- ✅ Foreign keys to Customer, User, and Appointment tables

**Testing:**
```bash
# Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('sms_messages', 'sms_preferences');

# Check preferences count
SELECT COUNT(*) FROM sms_preferences WHERE "optedIn" = true;

# Book a test appointment - should send SMS
```

**Key Learnings:**
- **ALWAYS create migrations** when schema changes are made
- Use `prisma migrate dev` instead of `prisma db push` for production-ready changes
- Schema drift causes silent failures - validate database state not just migration history
- Default opt-in preferences needed for immediate functionality
- `prisma migrate status` checks migration history, not actual schema

**Prevention:**
- Use the Migration Manager agent before schema changes
- Run `/migration check` before modifying schema.prisma
- Always create migration with `/migration create "name"`
- Verify migration deployed with `/migration status`

---

## API Route Structure Issues (October 27, 2025)

### DELETE/PATCH/POST Operations Return 404 ✅ RESOLVED
**Problem:** Production DELETE, PATCH, and POST operations failing with 404 errors
```
DELETE https://gt-automotives.com/api/purchase-invoices/cmh4c34wh00bio401jajvjqfu 404 (Not Found)
DELETE https://gt-automotives.com/api/expense-invoices/[id] 404 (Not Found)
```

**Root Cause:** Route duplication from mixing global API prefix with controller-level prefixes
- Global prefix in main.ts: `app.setGlobalPrefix('api')`
- Controller decorators: `@Controller('api/users')`
- Result: Routes became `/api/api/users` instead of `/api/users`

**Why This Broke:**
1. Frontend calls: `https://gt-automotives.com/api/purchase-invoices/:id`
2. Backend expects route: `/api/api/purchase-invoices/:id` (due to duplication)
3. Route mismatch causes 404 error

**Architecture Explanation:**
```
✅ CORRECT (After Fix):
Frontend: baseURL = 'https://gt-automotives.com/api'
          Calls /purchase-invoices/:id
          Full URL: https://gt-automotives.com/api/purchase-invoices/:id

Backend:  app.setGlobalPrefix('api')
          @Controller('purchase-invoices')
          Results in: /api/purchase-invoices/:id ✅ MATCH

❌ BROKEN (Before Fix):
Frontend: baseURL = 'https://gt-automotives.com/api'
          Calls /purchase-invoices/:id
          Full URL: https://gt-automotives.com/api/purchase-invoices/:id

Backend:  app.setGlobalPrefix('api')
          @Controller('api/purchase-invoices')
          Results in: /api/api/purchase-invoices/:id ❌ MISMATCH
```

**Solution:**
1. Added global prefix in main.ts:
   ```typescript
   app.setGlobalPrefix('api');
   Logger.log('✅ Global API prefix set to: /api');
   ```

2. Removed 'api/' from ALL controller decorators (21 files):
   ```typescript
   // Before: @Controller('api/purchase-invoices')
   // After:  @Controller('purchase-invoices')
   ```

3. Controllers updated:
   - reports, jobs, companies, payments, tires, vendors
   - invoices, dashboard, quotations, auth, webhooks
   - vehicles, customers, appointments, users, availability
   - purchase-invoices, expense-invoices, sms, tires-test

**Testing:**
```bash
# Verify TypeScript compilation
yarn typecheck

# Test DELETE endpoint
curl -X DELETE https://gt-automotives.com/api/purchase-invoices/[id] \
  -H "Authorization: Bearer [token]"

# Should return 200, NOT 404
```

**Key Learning:**
- **DO:** Set global prefix in main.ts ONLY
- **DO:** Use resource names in controller decorators (e.g., `@Controller('users')`)
- **DON'T:** Mix global prefix with controller-level 'api/' prefix
- **DON'T:** Duplicate prefix across main.ts and controller decorators

**Prevention:**
```bash
# Check for controller prefix duplication
grep -r "@Controller('api/" server/src --include="*.ts"
# Should return 0 results

# Verify global prefix is set
grep "setGlobalPrefix" server/src/main.ts
# Should show: app.setGlobalPrefix('api');
```

**Related Files:**
- Global prefix: [server/src/main.ts](../../server/src/main.ts) (line 83)
- All controllers: `server/src/*/*.controller.ts` (21 files)
- NestJS docs: https://docs.nestjs.com/faq/global-prefix

## VITE_API_URL Configuration Issues (October 27, 2025)

### 401 Unauthorized Errors on All API Calls ✅ RESOLVED
**Problem:** Build 162 deployed to production with all API calls failing with 401 Unauthorized errors
```
Failed to load resource: the server responded with a status of 401 ()
gt-automotives-backend-api.azurewebsites.net/api/auth/me:1  401 (Unauthorized)
gt-automotives-backend-api.azurewebsites.net/api/customers:1  401 (Unauthorized)
```

**Root Cause:** `VITE_API_URL` was set to direct backend URL instead of frontend domain with reverse proxy
- Build 146 (working): `VITE_API_URL=https://gt-automotives.com` ✅
- Build 162 (broken): `VITE_API_URL=https://gt-automotives-backend-api.azurewebsites.net` ❌

**Why This Broke:**
1. Frontend bypassed reverse proxy and called backend directly
2. Reverse proxy was not invoked, so `X-Internal-API-Key` header was never added
3. Backend's `InternalApiGuard` blocked all requests without the security header
4. Result: 401 Unauthorized on every API call

**Architecture Explanation:**
```
✅ CORRECT (Build 146, 164):
Browser → https://gt-automotives.com/api/*
        ↓ Reverse Proxy adds X-Internal-API-Key header
        ↓ Forwards to backend
Backend ✅ InternalApiGuard validates header → Allow request

❌ BROKEN (Build 162):
Browser → https://gt-automotives-backend-api.azurewebsites.net/api/*
        ❌ No reverse proxy, no X-Internal-API-Key header
Backend ❌ InternalApiGuard blocks → 401 Unauthorized
```

**Solution (Build 164):**
1. Changed Azure Web App setting:
   ```bash
   az webapp config appsettings set \
     --name gt-automotives-frontend \
     --resource-group gt-automotives-prod \
     --settings VITE_API_URL="https://gt-automotives.com"
   ```
2. Triggered new build to bake in correct `VITE_API_URL`
3. Frontend now routes through reverse proxy
4. Reverse proxy adds `X-Internal-API-Key` header
5. Backend accepts authenticated requests ✅

**Key Learning:**
- VITE environment variables are **baked into the build at build time**
- Changing Azure settings requires a **rebuild** to take effect
- `VITE_API_URL` must point to the **frontend domain** (with reverse proxy), not the backend URL
- Always verify VITE settings match working builds before deploying

**Prevention:**
```bash
# Check current Azure settings before building
az webapp config appsettings list \
  --name gt-automotives-frontend \
  --resource-group gt-automotives-prod \
  --query "[?starts_with(name, 'VITE_')].{name:name, value:value}" \
  -o table

# Verify VITE_API_URL in build logs
gh run view <run-id> --log | grep "VITE_API_URL:"

# Compare with last working build (Build 146)
# VITE_API_URL should be: https://gt-automotives.com
```

**Related Files:**
- Azure Setting: `VITE_API_URL` in gt-automotives-frontend Web App
- Backend Guard: [server/src/common/guards/internal-api.guard.ts](../../server/src/common/guards/internal-api.guard.ts)
- Reverse Proxy: [.github/workflows/gt-build.yml](../../.github/workflows/gt-build.yml) (lines 156-236)

## Mobile CORS Issues (October 20, 2025)

### PATCH Method Blocked by CORS Policy ✅ RESOLVED
**Problem:** Staff unable to mark jobs as completed on iPhone 16 Pro Max
```
Access to fetch at 'https://gt-automotives.com/api/jobs/.../complete' from origin 'https://www.gt-automotives.com'
has been blocked by CORS policy: Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

**Root Cause:** The reverse proxy server's CORS configuration only allowed `GET,PUT,POST,DELETE,OPTIONS` but excluded `PATCH`.

**Solution:**
Updated `.github/workflows/gt-build.yml` line 179:
```javascript
// Before
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

// After
res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
```

**Deployment:**
1. Push changes to trigger GT-Automotive-Build workflow
2. Manually deploy frontend using GT-Automotive-Deploy workflow
3. Verify PATCH requests work on mobile devices

**Key Learning:** Always include all HTTP methods used by the API in CORS configuration, especially PATCH which is often forgotten.

**Related Issue:** This was particularly problematic on mobile Safari/iOS which enforces CORS more strictly than desktop browsers.

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

