# Adding Square Credentials to GitHub Secrets

## 🔐 GitHub Secrets Setup for Production

These secrets are needed for your CI/CD pipeline to deploy with Square integration.

### Step 1: Access GitHub Repository Settings

1. Go to your GitHub repository: https://github.com/vishaltoora/GT-Automotives-App
2. Click **"Settings"** (top menu)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**

### Step 2: Add Backend Secrets (for Azure Backend)

Click **"New repository secret"** for each of these:

#### **SQUARE_ENVIRONMENT**
```
Name: SQUARE_ENVIRONMENT
Value: production
```
⚠️ **Important**: Use `production` for live deployment, `sandbox` for testing

---

#### **SQUARE_ACCESS_TOKEN**
```
Name: SQUARE_ACCESS_TOKEN
Value: EAAAl7GonLk89gboA_wlVeyIW_BYCZl7WrOTvh91Xw1DElCmLQshvj1UKfmf1n53
```
⚠️ **Note**: This is your SANDBOX token. When you go live, replace with your PRODUCTION token from Square Developer Console.

---

#### **SQUARE_APPLICATION_ID**
```
Name: SQUARE_APPLICATION_ID
Value: sandbox-sq0idb-ROIcmpzFwkVLGWKEeRA1iA
```
⚠️ **Note**: This is your SANDBOX app ID. When you go live, replace with your PRODUCTION app ID.

---

#### **SQUARE_LOCATION_ID**
```
Name: SQUARE_LOCATION_ID
Value: L1ACB76WR3E3H
```
⚠️ **Note**: This is your SANDBOX location ID. When you go live, replace with your PRODUCTION location ID.

---

#### **SQUARE_WEBHOOK_SIGNATURE_KEY** (Optional for now)
```
Name: SQUARE_WEBHOOK_SIGNATURE_KEY
Value: (leave empty for now, add later when webhooks are configured)
```

---

### Step 3: Add Frontend Build Variables

These are used during the frontend build process. Add them the same way:

#### **VITE_SQUARE_APPLICATION_ID**
```
Name: VITE_SQUARE_APPLICATION_ID
Value: sandbox-sq0idb-ROIcmpzFwkVLGWKEeRA1iA
```
⚠️ **Note**: Same as backend, but with `VITE_` prefix for frontend build

---

#### **VITE_SQUARE_LOCATION_ID**
```
Name: VITE_SQUARE_LOCATION_ID
Value: L1ACB76WR3E3H
```

---

#### **VITE_SQUARE_ENVIRONMENT**
```
Name: VITE_SQUARE_ENVIRONMENT
Value: sandbox
```
⚠️ **Important**: Use `sandbox` for testing, `production` for live

---

## ✅ Verification

After adding all secrets, you should have these 8 Square-related secrets:

**Backend Secrets (used by Azure Web App):**
- ✅ SQUARE_ENVIRONMENT
- ✅ SQUARE_ACCESS_TOKEN
- ✅ SQUARE_APPLICATION_ID
- ✅ SQUARE_LOCATION_ID
- ✅ SQUARE_WEBHOOK_SIGNATURE_KEY (optional)

**Frontend Build Secrets (baked into frontend build):**
- ✅ VITE_SQUARE_APPLICATION_ID
- ✅ VITE_SQUARE_LOCATION_ID
- ✅ VITE_SQUARE_ENVIRONMENT

---

## 🔄 Updating Your GitHub Workflow

Your existing GitHub Actions workflows (`.github/workflows/gt-build.yml` and `.github/workflows/gt-deploy.yml`) need to be updated to use these secrets.

### Update Build Workflow

Edit `.github/workflows/gt-build.yml` and add Square environment variables to the frontend build step:

```yaml
- name: Build frontend
  env:
    VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    # Add Square variables:
    VITE_SQUARE_APPLICATION_ID: ${{ secrets.VITE_SQUARE_APPLICATION_ID }}
    VITE_SQUARE_LOCATION_ID: ${{ secrets.VITE_SQUARE_LOCATION_ID }}
    VITE_SQUARE_ENVIRONMENT: ${{ secrets.VITE_SQUARE_ENVIRONMENT }}
  run: |
    yarn nx build webApp --configuration=production
```

### Update Deploy Workflow

Edit `.github/workflows/gt-deploy.yml` and add Square backend configuration:

```yaml
- name: Configure Azure Web App Settings (Backend)
  run: |
    az webapp config appsettings set \
      --name gt-automotives-backend-api \
      --resource-group gt-automotives \
      --settings \
        "SQUARE_ENVIRONMENT=${{ secrets.SQUARE_ENVIRONMENT }}" \
        "SQUARE_ACCESS_TOKEN=${{ secrets.SQUARE_ACCESS_TOKEN }}" \
        "SQUARE_APPLICATION_ID=${{ secrets.SQUARE_APPLICATION_ID }}" \
        "SQUARE_LOCATION_ID=${{ secrets.SQUARE_LOCATION_ID }}" \
        "SQUARE_WEBHOOK_SIGNATURE_KEY=${{ secrets.SQUARE_WEBHOOK_SIGNATURE_KEY }}"
```

---

## 🚀 When You're Ready for Production

### Get Production Credentials

1. Go to https://developer.squareup.com/console
2. Click on your app
3. Click **"Credentials"**
4. Toggle to **"Production"** mode
5. Copy the **Production** values:
   - Production Application ID
   - Production Access Token
   - Production Location ID

### Update GitHub Secrets

1. Go to your GitHub repository → Settings → Secrets → Actions
2. Edit each secret and replace sandbox values with production values:
   - Update `SQUARE_ACCESS_TOKEN` with production token
   - Update `SQUARE_APPLICATION_ID` with production app ID
   - Update `SQUARE_LOCATION_ID` with production location ID
   - Update `SQUARE_ENVIRONMENT` to `production`
   - Update `VITE_SQUARE_APPLICATION_ID` with production app ID
   - Update `VITE_SQUARE_LOCATION_ID` with production location ID
   - Update `VITE_SQUARE_ENVIRONMENT` to `production`

### Configure Production Webhook

1. In Square Developer Console → Webhooks
2. Add endpoint: `https://gt-automotives.com/api/square/webhook`
3. Subscribe to events: payment.created, payment.updated, refund.created, refund.updated
4. Copy the **Webhook Signature Key**
5. Add to GitHub Secret: `SQUARE_WEBHOOK_SIGNATURE_KEY`

---

## 🔒 Security Best Practices

- ✅ **Never commit** `.env` files to git
- ✅ Keep sandbox and production credentials separate
- ✅ Rotate tokens periodically
- ✅ Use production credentials only on production server
- ✅ Test thoroughly in sandbox before switching to production
- ✅ Monitor Square Dashboard for suspicious activity

---

## 📞 Need Help?

If you have trouble:
1. Check that secret names match exactly (case-sensitive)
2. Verify GitHub Actions has permission to read secrets
3. Check workflow logs for environment variable errors
4. Test locally with `.env` files before deploying

---

**Setup Complete!** Your Square credentials are now securely stored in GitHub and ready for CI/CD deployment.
