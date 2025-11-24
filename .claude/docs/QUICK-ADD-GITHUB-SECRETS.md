# Quick Guide: Add Square Secrets to GitHub

## 🚀 Fast Method (5 minutes)

### Step 1: Go to GitHub Secrets Page

Click this link (or copy and paste into your browser):

```
https://github.com/vishaltoora/GT-Automotives-App/settings/secrets/actions
```

### Step 2: Add Each Secret

Click **"New repository secret"** button and add these **8 secrets** one by one:

---

#### 1. SQUARE_ENVIRONMENT
- **Name**: `SQUARE_ENVIRONMENT`
- **Value**: `sandbox`
- Click "Add secret"

---

#### 2. SQUARE_ACCESS_TOKEN
- **Name**: `SQUARE_ACCESS_TOKEN`
- **Value**: `EAAAl7GonLk89gboA_wlVeyIW_BYCZl7WrOTvh91Xw1DElCmLQshvj1UKfmf1n53`
- Click "Add secret"

---

#### 3. SQUARE_APPLICATION_ID
- **Name**: `SQUARE_APPLICATION_ID`
- **Value**: `sandbox-sq0idb-ROIcmpzFwkVLGWKEeRA1iA`
- Click "Add secret"

---

#### 4. SQUARE_LOCATION_ID
- **Name**: `SQUARE_LOCATION_ID`
- **Value**: `L1ACB76WR3E3H`
- Click "Add secret"

---

#### 5. SQUARE_WEBHOOK_SIGNATURE_KEY
- **Name**: `SQUARE_WEBHOOK_SIGNATURE_KEY`
- **Value**: (leave empty for now)
- Click "Add secret"

---

#### 6. VITE_SQUARE_APPLICATION_ID
- **Name**: `VITE_SQUARE_APPLICATION_ID`
- **Value**: `sandbox-sq0idb-ROIcmpzFwkVLGWKEeRA1iA`
- Click "Add secret"

---

#### 7. VITE_SQUARE_LOCATION_ID
- **Name**: `VITE_SQUARE_LOCATION_ID`
- **Value**: `L1ACB76WR3E3H`
- Click "Add secret"

---

#### 8. VITE_SQUARE_ENVIRONMENT
- **Name**: `VITE_SQUARE_ENVIRONMENT`
- **Value**: `sandbox`
- Click "Add secret"

---

## ✅ Done!

After adding all 8 secrets, you should see them listed on the page. They'll be used automatically in your GitHub Actions workflows.

---

## 📸 What It Looks Like

When you're done, your secrets page should show:

```
Repository secrets
- SQUARE_ENVIRONMENT                    Updated ...
- SQUARE_ACCESS_TOKEN                   Updated ...
- SQUARE_APPLICATION_ID                 Updated ...
- SQUARE_LOCATION_ID                    Updated ...
- SQUARE_WEBHOOK_SIGNATURE_KEY         Updated ...
- VITE_SQUARE_APPLICATION_ID           Updated ...
- VITE_SQUARE_LOCATION_ID              Updated ...
- VITE_SQUARE_ENVIRONMENT              Updated ...
```

---

## ⚡ Why You Need This

These secrets allow your GitHub Actions (CI/CD) to:
1. Build frontend with Square configuration
2. Deploy backend with Square credentials
3. Enable Square payments in production

Without these, Square payments won't work when you deploy!

---

**Ready?** Just go to that link and start adding secrets! Takes about 5 minutes. 😊
