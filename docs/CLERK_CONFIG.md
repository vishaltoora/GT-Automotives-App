# Clerk Configuration

## Clerk Instance Details
- **Instance:** clean-dove-53
- **Frontend API:** https://clean-dove-53.clerk.accounts.dev
- **Backend API:** https://api.clerk.com
- **JWKS URL:** https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json

## Environment Variables

### Frontend (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlYW4tZG92ZS01My5jbGVyay5hY2NvdW50cy5kZXYk
```

### Backend (.env)
```
CLERK_SECRET_KEY=sk_test_z1yz3LAc4dQglp0oCUWxscpuKWqh8mnCsYHT5hYjxB
CLERK_JWKS_URL=https://clean-dove-53.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=(to be configured in Clerk dashboard)
```

## Webhook Configuration (When Needed)

To set up webhooks for user synchronization:

1. Go to Clerk Dashboard → Webhooks
2. Create new endpoint with URL: `https://your-domain.com/api/webhooks/clerk`
3. Select events:
   - user.created
   - user.updated
   - user.deleted
4. Copy the webhook secret and add to backend .env as `CLERK_WEBHOOK_SECRET`

## JWKS Public Key
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzLW+wyLElI2aT5ePVFoT
NDTmGqf+mOVMOJx15ih8gIG1A8Dxj/Qj6pRNPLtTx3lKiRXlNh5iX8lV/9xmhsnw
9fSfxdZocTGFKXnyOyp9a2xmCgcxIp3gsWaxpAZ9lbhL5uLzxd5455PqnrkkEBvF
8fCGrwxAAeyxjyOCwon0kBMSGzvlgDDKm8Xt8VEI69x4CuesDz3B+WgUe+dgjmN5
Cxwxq3LdsTyt4UmphugcfVOoUhVKivhKUt5o/0TLezHKg6KFP xyo3o7F1/aOPag6xpl9xTA7PvRjbUiYoelQISmezCJFORicpJapZocoCQzAPXw/P
QwIDAQAB
-----END PUBLIC KEY-----
```

## Testing Authentication

1. Visit http://localhost:4200/login
2. Sign in with Clerk (Google, email, etc.)
3. New users will automatically be assigned "customer" role
4. Users are redirected to their role-specific dashboard

## Development Notes

- Webhook synchronization is optional for local development
- Users can sign in with Clerk and get default customer role
- For production, set up webhook to sync users to database