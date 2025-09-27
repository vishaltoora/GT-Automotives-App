# Environment Variables - Critical Rules

## 🚨 CRITICAL RULE: NEVER USE process.env.VITE_* in Frontend Code

### ❌ WRONG - Will NOT work in production:
```typescript
const apiUrl = process.env.VITE_API_URL;  // ❌ WRONG - undefined in browser
const clerkKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;  // ❌ WRONG
```

### ✅ CORRECT - Use import.meta.env for Vite projects:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;  // ✅ CORRECT
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;  // ✅ CORRECT
```

## Why This Matters

### In Vite Projects (Frontend):
- **`import.meta.env.VITE_*`** is replaced at **build time** by Vite with actual values
- **`process.env`** does NOT exist in browser environments (always `undefined`)
- This caused production bugs where:
  - Authentication defaulted to Mock providers
  - API calls went to `localhost` instead of production
  - Users couldn't access protected routes

### In Node.js Projects (Backend):
- **`process.env.*`** is the standard way to access environment variables
- This is correct for backend code (server/src/)

## File-by-File Guidelines

### Frontend Files (apps/webApp/src/):
```typescript
// ✅ CORRECT
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// ✅ ALSO CORRECT - NODE_ENV is fine with process.env
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug mode');
}
```

### Backend Files (server/src/):
```typescript
// ✅ CORRECT for backend
const dbUrl = process.env.DATABASE_URL;
const clerkSecret = process.env.CLERK_SECRET_KEY;
```

## Environment Variable Naming Convention

### Frontend (Public) Variables:
- Must start with `VITE_` prefix
- Embedded in client-side bundle
- Examples:
  - `VITE_API_URL`
  - `VITE_CLERK_PUBLISHABLE_KEY`

### Backend (Private) Variables:
- No special prefix required
- Never exposed to client
- Examples:
  - `DATABASE_URL`
  - `CLERK_SECRET_KEY`
  - `JWT_SECRET`

## Common Patterns

### Service Files:
```typescript
// apps/webApp/src/app/services/user.service.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const userService = {
  async getUsers() {
    const token = localStorage.getItem('authToken');
    return axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
```

### Provider/Hook Files:
```typescript
// apps/webApp/src/app/hooks/useAuth.ts
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## Build-Time vs Runtime

### Build-Time Replacement (Vite):
```typescript
// At build time, Vite replaces this:
const url = import.meta.env.VITE_API_URL;

// With the actual value:
const url = "https://gt-automotives.com/api";
```

### Runtime Access (Backend):
```typescript
// At runtime, Node.js reads from environment:
const dbUrl = process.env.DATABASE_URL;
// Value comes from .env file or system environment
```

## Checking Compliance

### Search for violations:
```bash
# Find incorrect usage in frontend:
grep -r "process\.env\.VITE_" apps/webApp/src/

# Should return: No matches found
```

### Fix violations:
```bash
# Replace all instances:
find apps/webApp/src -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' 's/process\.env\.VITE_/import.meta.env.VITE_/g'
```

## ESLint Rule - ACTIVE

✅ **ESLint rule is now active** in the following files:
- `.eslintrc.json` (root)
- `apps/webApp/.eslintrc.json`

The rule will catch and prevent usage of `process.env.VITE_*` in frontend code:

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[object.object.name='process'][object.property.name='env'][property.name=/^VITE_/]",
        "message": "❌ CRITICAL: Use import.meta.env.VITE_* instead of process.env.VITE_* in Vite projects. See .claude/rules/environment-variables.md"
      }
    ]
  }
}
```

### Testing the Rule

A test file is available at `apps/webApp/src/test-eslint-rule.ts` that demonstrates:
- ❌ Wrong usage: `process.env.VITE_API_URL`
- ✅ Correct usage: `import.meta.env.VITE_API_URL`

**Note**: Lint targets need to be configured in Nx for automated enforcement. The ESLint configuration is in place and ready to use.

## Historical Context

**Issue Date**: September 27, 2025

**Problem**: Production deployment showed "Development Mode - Sign In" and admin users couldn't access dashboards.

**Root Cause**: All frontend code used `process.env.VITE_*` which evaluated to `undefined` in browser, causing:
1. Mock authentication providers instead of real Clerk
2. API calls to localhost instead of production
3. Failed role-based redirects

**Resolution**: Replaced all instances with `import.meta.env.VITE_*` across:
- useAuth.ts
- Login.tsx
- ServicesProvider.tsx
- All service files (7 files)

**Lesson**: Always use `import.meta.env` for Vite environment variables in frontend code.

---

**Last Updated**: September 27, 2025
**Status**: ✅ All frontend files verified and corrected