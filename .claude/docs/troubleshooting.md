# Troubleshooting Guide

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

## Current Issues Resolved ✅
- ✅ **Invoice Creation Error:** Fixed missing `/api` prefix in controller routes
- ✅ **Authentication 401/403 Errors:** Proper Clerk JWT token handling
- ✅ **MUI Grid Import Errors:** Fixed Grid2 import issues, now using standard Grid with modern syntax
- ✅ **Customer Dialog Layout:** Resolved header overlap with proper spacing and padding
- ✅ **ESM/CommonJS Compatibility:** Fixed shared library build issues
- ✅ **Login Redirect Loop:** Fixed role-based routing logic
- ✅ **Public Page Flash:** Eliminated brief content visibility during authentication
- ✅ **Loading Screen Visual:** Replaced blur effect with solid professional background

## Authentication Files (August 20, 2025)
- **Created:** `server/src/auth/strategies/clerk-jwt.strategy.ts` - Clerk JWT verification
- **Modified:** `server/src/auth/guards/jwt-auth.guard.ts` - Dual strategy support
- **Modified:** `server/src/auth/auth.module.ts` - Added ClerkJwtStrategy provider
- **Modified:** `apps/webApp/src/app/hooks/useAuth.ts` - Admin user handling
- **Modified:** `apps/webApp/src/app/guards/RoleGuard.tsx` - Case-insensitive roles
- **Modified:** `libs/database/src/lib/prisma/seed.ts` - Added Vishal as admin
- **Created:** `scripts/update-vishal-clerk-id.ts` - Clerk ID update script
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

