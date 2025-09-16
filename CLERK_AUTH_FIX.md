# Clerk Authentication Loop Fix Guide

## Current Status
- **Clerk Authentication**: Temporarily disabled due to redirect loop
- **Mock Authentication**: Currently enabled for development

## How to Use the App Now (Mock Authentication)

Visit: **http://localhost:4200**

### Login Credentials:
- **Admin Account**: 
  - Username: `admin`
  - Password: `password`

- **Staff Account**:
  - Username: `staff` 
  - Password: `password`

- **Customer Account**:
  - Username: `customer`
  - Password: `password`

## The Clerk Authentication Issue

### Problem
When Clerk authentication is enabled, a redirect loop occurs because:
1. User signs in with Clerk successfully
2. Frontend tries to sync with backend database
3. If user doesn't exist in backend, the sync fails
4. Authentication state becomes inconsistent
5. Login page redirects to dashboard
6. Dashboard redirects back to login
7. Loop continues...

### Root Cause
The issue is in the user synchronization between Clerk (authentication provider) and your backend database. When a user exists in Clerk but not in your database, the app doesn't handle this state properly.

## How to Fix Clerk Authentication

### Option 1: Add Your Clerk User to Database

1. **Get your Clerk User ID**:
   ```bash
   # Go to https://dashboard.clerk.com
   # Find your user and copy the User ID (starts with user_)
   ```

2. **Add user to database using Prisma Studio**:
   ```bash
   yarn db:studio
   # Opens at http://localhost:5555
   ```

3. **In Prisma Studio**:
   - Navigate to `User` table
   - Click "Add record"
   - Fill in:
     - `clerkId`: Your Clerk User ID
     - `email`: Your email address
     - `firstName`: Your first name
     - `lastName`: Your last name
     - `roleId`: Select ADMIN role (cmerelvoi000vvb8vd6pougbt)
   - Save the record

### Option 2: Implement Webhook for Auto-Sync

1. **Set up Clerk webhook** in `.env`:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

2. **Configure webhook in Clerk Dashboard**:
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to `user.created` and `user.updated` events

3. **The webhook handler** (already exists at `/api/webhooks/clerk`) will automatically create users in your database when they sign up with Clerk.

### Option 3: Manual Database Insert

```sql
-- Connect to PostgreSQL
psql -U postgres -d gt_automotive

-- Insert your user (replace values)
INSERT INTO "User" (
  id, 
  "clerkId", 
  email, 
  "firstName", 
  "lastName", 
  "roleId"
) VALUES (
  'cuid_generated_id',
  'your_clerk_user_id',
  'your@email.com',
  'YourFirstName',
  'YourLastName',
  'cmerelvoi000vvb8vd6pougbt' -- ADMIN role ID
);
```

## Re-enabling Clerk Authentication

Once you've added your user to the database:

1. **Edit** `/apps/webApp/.env.local`
2. **Uncomment** the Clerk key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlYW4tZG92ZS01My5jbGVyay5hY2NvdW50cy5kZXYk
   ```
3. **Restart** the frontend:
   ```bash
   # Kill current frontend process
   # Then restart:
   yarn nx serve webApp
   ```

## Debugging Tips

If the loop persists after adding your user:

1. **Check browser console** for:
   - `🔐 Auth State:` logs
   - `🔍 Login Page State:` logs
   - Network errors in the Network tab

2. **Verify user exists** in database:
   ```sql
   SELECT * FROM "User" WHERE email = 'your@email.com';
   ```

3. **Check backend logs** for sync errors:
   - Look for 404 or 401 errors
   - Check if `/api/auth/me` endpoint is responding

## Current Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │────▶│  Clerk Auth  │────▶│   Backend    │
│  (React)    │     │   (Cloud)    │     │  (NestJS)    │
└─────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    ▼                    ▼
       │            ┌──────────────┐     ┌──────────────┐
       └───────────▶│   JWT Token  │────▶│  PostgreSQL  │
                    └──────────────┘     └──────────────┘
```

## Contact

If you continue to have issues:
1. Check the GitHub Issues: https://github.com/vishaltoora/GT-Automotives-App/issues
2. Review the authentication documentation in `.claude/docs/authentication.md`
3. Check the troubleshooting guide in `.claude/docs/authentication-troubleshooting.md`

---

**Note**: Mock authentication is perfectly fine for development. Only production requires proper Clerk setup.