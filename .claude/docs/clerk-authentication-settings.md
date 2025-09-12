# Clerk Authentication Settings Guide

## Dashboard Configuration for GT Automotive

### Important Clerk Dashboard Settings

To configure Clerk for optimal authentication flow, check these settings in your Clerk Dashboard:

#### 1. Authentication Strategy Settings
**Location:** Clerk Dashboard → User & Authentication → Email, Phone, Username

**Recommended Settings:**
- **Username:** ✅ Enabled (Allow users to sign in with username)
- **Email:** ✅ Enabled (As alternative)
- **Phone:** ❌ Disabled (Unless needed)
- **Name:** Optional (Collect during signup if needed)

#### 2. Multi-Factor Authentication
**Location:** Clerk Dashboard → User & Authentication → Multi-factor

**Current Settings:**
- **SMS:** ❌ Disabled
- **Authenticator app:** ❌ Disabled  
- **Backup codes:** ❌ Disabled

*Note: Disabling MFA simplifies the login flow to username/email + password only*

#### 3. Sign-in Methods
**Location:** Clerk Dashboard → User & Authentication → Email, Phone, Username → Sign-in

**Recommended:**
- **Identifier:** Username or Email address
- **Password:** Required
- **Verification:** Not required for sign-in

#### 4. Session Settings
**Location:** Clerk Dashboard → Sessions

**Recommended:**
- **Inactivity timeout:** 7 days
- **Maximum lifetime:** 30 days
- **Touch session on API usage:** ✅ Enabled

#### 5. Appearance & Branding
**Location:** Clerk Dashboard → Customization → Appearance

**Can Configure:**
- Logo upload
- Brand colors
- Font selection
- Component theming

*Note: We handle most styling in code, but dashboard settings can provide defaults*

#### 6. Restrictions
**Location:** Clerk Dashboard → User & Authentication → Restrictions

**Important Settings:**
- **Sign-up mode:** ❌ Disabled (Admin creates users only)
- **Allowlist:** Not needed (controlled by admin)
- **Blocklist:** Configure if needed

#### 7. Attack Protection
**Location:** Clerk Dashboard → User & Authentication → Attack protection

**Recommended:**
- **Bot protection:** ✅ Enabled
- **Require CAPTCHA:** For suspicious activity only
- **Email address leak protection:** ✅ Enabled

### Routing Configuration in Code

Based on Clerk's routing strategies:

#### 1. Virtual Routing (Recommended for SPAs)
```typescript
<SignIn routing="virtual" />
```
- No URL changes during auth steps
- Smooth transitions between username → password
- Best for React Router apps

#### 2. Path Routing
```typescript
<SignIn routing="path" path="/login" />
```
- Changes URL for each step (/login/factor-one, etc.)
- Can cause issues with React Router
- Not recommended with our setup

#### 3. Hash Routing
```typescript
<SignIn routing="hash" />
```
- Uses URL fragments (#/factor-one)
- Cannot be used with `path` prop
- Alternative to virtual routing

### Current Implementation

We're using **virtual routing** which:
- Keeps URL stable during authentication
- Prevents page reloads
- Works seamlessly with React Router
- Provides best user experience

### Troubleshooting Common Issues

#### Issue 1: Page Reloads During Authentication
**Solution:** Use `routing="virtual"` without `path` prop

#### Issue 2: Multi-step Flow Issues
**Solution:** Disable MFA in Clerk Dashboard if not needed

#### Issue 3: Users Can't Sign In
**Check:**
- Username/Email is enabled in dashboard
- User exists in Clerk
- Password requirements are met

#### Issue 4: Redirect After Sign In
**Solution:** Handle in Login component's useEffect, not in Clerk props

### API Configuration

For backend authentication, ensure these environment variables:

```env
# Backend (.env.production)
CLERK_SECRET_KEY=sk_live_YOUR_KEY
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
CLERK_JWKS_URL=https://clerk.gt-automotives.com/.well-known/jwks.json

# Frontend (.env.production)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

### Testing Authentication Flow

1. **Local Testing:**
   ```bash
   # Use test keys for development
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
   ```

2. **Production Testing:**
   - Ensure DNS records are verified
   - SSL certificates are active
   - Custom domain is working

### Best Practices

1. **Keep It Simple:** 
   - Username/Email + Password only
   - Avoid complex MFA unless required

2. **Consistent Experience:**
   - Use virtual routing for smooth flow
   - Handle redirects in React, not Clerk

3. **Security:**
   - Keep sign-ups disabled (admin-only)
   - Use attack protection features
   - Monitor failed login attempts

4. **Performance:**
   - Use custom domain for faster loading
   - Enable session touch on API usage
   - Set reasonable timeout values

### Quick Checklist for Production

- [ ] Custom domain DNS verified
- [ ] SSL certificates active
- [ ] Virtual routing configured
- [ ] Sign-ups disabled
- [ ] Attack protection enabled
- [ ] Session settings configured
- [ ] Environment variables set
- [ ] Test with all user roles

---

**Last Updated:** September 12, 2025
**Status:** Using virtual routing for smooth authentication flow