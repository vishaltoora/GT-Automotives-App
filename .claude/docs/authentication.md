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
1. Users sign in/up through Clerk at `/login` or `/register`
2. New users automatically get "customer" role
3. JWT tokens are verified using Clerk's JWKS endpoint via `ClerkJwtStrategy`
4. Role-based routing redirects users to appropriate dashboards
5. Dual JWT strategy support: Clerk JWT (primary) and local JWT (fallback)

### Admin User (Vishal Toora)
- **Email:** vishal.alawalpuria@gmail.com
- **Clerk ID:** user_31JM1BAB2lrW82JVPgrbBekTx5H
- **Role:** Admin (full system access)
- **Database ID:** cmekadftv003xvbokv2ioi7op
- **Status:** Active and ready for login

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
- Self-registration enabled
- View own data only (invoices, appointments, vehicles)
- Request appointments online
- Download invoices as PDF

### Staff Role (Technician/Sales)
- Create and manage invoices
- View all customers
- Manage inventory (no price changes)
- Schedule appointments
- View operational reports

### Admin Role (Owner/Manager)
- Full system access
- User management
- Financial reports
- Price controls
- Business analytics

**See `/docs/ROLE_PERMISSIONS.md` for complete permissions matrix**