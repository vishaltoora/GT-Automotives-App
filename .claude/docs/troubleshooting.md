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

### Cannot Access Customer Dashboard
**Problem:** Customer dashboard shows "page can't be reached"
**Solution:** Ensure both servers are running:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api

## Current Issues Resolved ✅
- ✅ **Invoice Creation Error:** Fixed missing `/api` prefix in controller routes
- ✅ **Authentication 401/403 Errors:** Proper Clerk JWT token handling
- ✅ **MUI Grid2 Warnings:** Updated deprecated Grid syntax across all components
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