# Authentication & User Management

## Authentication with Clerk (Production Mode)

### Clerk Instance Details
- **Instance:** clean-dove-53
- **Frontend API:** https://clean-dove-53.clerk.accounts.dev
- **JWKS URL:** https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json

### Configuration Files
- **Frontend Key:** Set in `apps/webApp/.env.local` as `VITE_CLERK_PUBLISHABLE_KEY`
- **Backend Key:** Set in `server/.env` as `CLERK_SECRET_KEY`

### How Authentication Works
1. **Admin/Staff Login**: Secure login with username or email via branded login page
2. **JWT Verification**: Tokens verified using Clerk's JWKS endpoint via `ClerkJwtStrategy`
3. **Role-based Routing**: Automatic redirect to appropriate dashboard based on user role
4. **User Synchronization**: Automatic sync between Clerk and local database
5. **Session Management**: Secure session handling with proper timeout and refresh

### Enhanced Authentication Features
- **Dual Login Support**: Users can login with either username or email
- **Branded Login UI**: Professional GT Automotive branded login interface
- **Admin-only Registration**: Public signup disabled - only admins can create accounts
- **Role-based Redirects**: Automatic navigation to role-appropriate dashboards
- **Loading States**: Professional loading screens during authentication
- **Error Handling**: Comprehensive error management with custom dialogs

### Admin User (Vishal Toora)
- **Email:** vishal.alawalpuria@gmail.com
- **Clerk ID:** user_31JM1BAB2lrW82JVPgrbBekTx5H
- **Role:** Admin (full system access)
- **Database ID:** cm1g1a2b3c4d5e6f7g8h9i0j1
- **Status:** ✅ Active and ready for login
- **Login Flow:** Login → Loading → Redirect to `/admin/dashboard`

## Development Mode (Without Clerk)

To run without Clerk authentication:

### Setup
1. Comment out `VITE_CLERK_PUBLISHABLE_KEY` in `apps/webApp/.env.local`
2. Restart servers - the app will use `MockClerkProvider`
3. Access the application with automatic mock authentication

### Mock User Details
- **Email:** customer@example.com
- **Name:** Test Customer
- **Role:** Customer (automatically assigned)
- **Access:** Full customer portal features

## User Roles & Permissions

### Customer Role
- **Portal Access**: Self-service customer portal with branded interface
- **Data Isolation**: View own data only (invoices, appointments, vehicles)
- **Appointment Management**: Request and manage service appointments
- **Invoice Access**: View and download invoices as PDF
- **Vehicle Management**: Add and manage personal vehicles
- **Tire Browsing**: Browse available tire inventory

### Staff Role (Technician/Sales)
- **Operational Dashboard**: Comprehensive staff dashboard for daily operations
- **Customer Management**: Create, view, and manage all customer accounts
- **Invoice Creation**: Create and manage invoices with full item support
- **Inventory Management**: Manage tire inventory (view prices, no modifications)
- **Appointment Scheduling**: Schedule and manage customer appointments
- **Operational Reports**: Access to operational and inventory reports
- **Logout Functionality**: Secure logout with proper session cleanup

### Admin Role (Owner/Manager)
- **Full System Access**: Complete access to all application features
- **User Management**: Create, edit, and manage all user accounts (Staff/Admin only)
- **User Creation**: Professional user creation dialogs with validation
- **Financial Control**: Full access to financial reports and price management
- **System Configuration**: Modify system settings and business rules
- **Analytics Dashboard**: Business intelligence and comprehensive reporting
- **Audit Capabilities**: View all system activities and changes

**See `/docs/ROLE_PERMISSIONS.md` for complete permissions matrix**

## Troubleshooting Authentication Issues

### Common Issue: Login Loop or Redirect to Home Instead of Dashboard

**Symptoms:**
- Login form appears and accepts credentials
- After login, redirected to home page instead of role-specific dashboard
- Console shows `isSignedIn: false` despite successful Clerk authentication

**Root Cause:**
Environment variable access inconsistency between `ClerkProvider` and `useAuth` hook.

**Quick Fix:**
Ensure `useAuth` hook uses direct environment variable access:
```typescript
// In apps/webApp/src/app/hooks/useAuth.ts
// @ts-ignore
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
```

**Debug Steps:**
1. Check browser console for these logs:
   - `🔍 useAuth Debug - Clerk State:` should show proper publishableKey
   - `isSignedIn: true` after successful login
   - User data should be populated with admin role

2. If publishableKey shows as 'NONE', the environment variable isn't being accessed properly

**Complete Troubleshooting Guide:** See `authentication-troubleshooting.md`

## Technical Implementation Notes

### Environment Variable Access
- **ClerkProvider**: Uses direct `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`
- **useAuth Hook**: Must use same direct access for consistency
- **Avoid**: Using `getEnvVar()` utility which may fail in certain environments

### Authentication Flow Debugging
The application includes comprehensive debug logging:
- Login component logs authentication attempts
- Home component logs redirect decisions
- useAuth hook logs Clerk state changes

Enable debug mode by checking browser console during authentication flow.