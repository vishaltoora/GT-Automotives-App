# Telnyx SMS Setup Guide for GT Automotive

**Created**: October 23, 2025
**Estimated Time**: 15-20 minutes
**Cost**: $2/month + $0.004 per SMS

---

## Table of Contents

1. [Create Telnyx Account](#step-1-create-telnyx-account)
2. [Verify Your Identity](#step-2-verify-your-identity)
3. [Purchase a Phone Number](#step-3-purchase-a-phone-number)
4. [Create Messaging Profile](#step-4-create-messaging-profile)
5. [Get Your API Key](#step-5-get-your-api-key)
6. [Configure Webhook](#step-6-configure-webhook)
7. [Update GT Automotive Environment Variables](#step-7-update-environment-variables)
8. [Test SMS Sending](#step-8-test-sms-sending)
9. [Deploy to Production](#step-9-deploy-to-production)
10. [Troubleshooting](#troubleshooting)

---

## Step 1: Create Telnyx Account

### 1.1 Sign Up

1. Go to **https://telnyx.com/sign-up**
2. Enter your information:
   - **Email**: Use your business email (e.g., `vishal.alawalpuria@gmail.com`)
   - **Password**: Choose a strong password
   - **Company Name**: `GT Automotive` or `16472991 Canada INC.`
3. Click **"Create Account"**

### 1.2 Email Verification

1. Check your email inbox for verification email from Telnyx
2. Click the verification link
3. You'll be redirected to Telnyx dashboard

### 1.3 Add Payment Method

1. In the Telnyx dashboard, click **"Billing"** in the left sidebar
2. Click **"Add Payment Method"**
3. Enter credit card details:
   - Card number
   - Expiration date
   - CVV
   - Billing address
4. Click **"Add Card"**
5. **Set Auto-Recharge** (recommended):
   - When balance drops below $10, auto-add $20
   - This prevents service interruption

> **💡 Note**: Telnyx requires a payment method before you can purchase numbers or send messages.

---

## Step 2: Verify Your Identity

Telnyx requires identity verification to comply with telecom regulations.

### 2.1 Business Verification

1. In dashboard, click **"Settings"** → **"Verification"**
2. Select **"Business Account"**
3. Enter business information:
   - **Business Name**: `16472991 Canada INC.` or `GT Automotive`
   - **Business Address**: Prince George, BC address
   - **Business Phone**: Your existing business phone
   - **Business Website**: `https://gt-automotives.com`
   - **Tax ID/Business Number**: Your Canadian business number

### 2.2 Upload Documents (if required)

Telnyx may request:
- Business registration certificate
- Proof of address (utility bill, bank statement)
- Government-issued ID

Upload these through the verification portal.

### 2.3 Wait for Approval

- Typically takes 1-2 business days
- You'll receive email when approved
- You can still proceed with setup while waiting

---

## Step 3: Purchase a Phone Number

### 3.1 Navigate to Phone Numbers

1. In Telnyx dashboard, click **"Numbers"** in left sidebar
2. Click **"Buy Numbers"** button

### 3.2 Search for Canadian Number

1. In the search interface:
   - **Country**: Select **"Canada"**
   - **Area Code**: Enter `250` (Prince George, BC area code)
   - **Features Required**: Check **"SMS Enabled"**
   - **Number Type**: Select **"Local"**

2. Click **"Search"**

### 3.3 Select and Purchase Number

1. Browse available numbers in the 250 area code
2. Click **"Buy"** next to your preferred number
3. Confirm purchase:
   - Cost: **$2.00/month**
   - No setup fee
4. Click **"Complete Purchase"**

### 3.4 Note Your Phone Number

**IMPORTANT**: Write down your purchased number in E.164 format:
```
Example: +12505551234
```

You'll need this for environment variables.

---

## Step 4: Create Messaging Profile

A Messaging Profile tells Telnyx how to handle your SMS messages.

### 4.1 Navigate to Messaging

1. Click **"Messaging"** in left sidebar
2. Click **"Messaging Profiles"**
3. Click **"Create Messaging Profile"** button

### 4.2 Configure Profile

**Profile Settings:**

1. **Profile Name**: `GT Automotive SMS`
2. **Webhook URL**: Leave blank for now (we'll add this later)
3. **Webhook Failover URL**: Leave blank
4. **Enable HTTP Status Callbacks**: Toggle **ON**

**Message Settings:**

5. **Number Pool**: Toggle **ON**
   - Select your purchased phone number
6. **URL Shortening**: Toggle **OFF** (not needed)
7. **Alphanumeric Sender ID**: Leave blank (Canada doesn't support this)

**Advanced Settings:**

8. **RCS**: Toggle **OFF** (not needed)
9. **MMS**: Toggle **OFF** (we only need SMS)
10. **Delivery Reports**: Toggle **ON** (important for tracking)

### 4.3 Save Profile

1. Click **"Create Messaging Profile"**
2. You'll see your new profile in the list

### 4.4 Note Your Messaging Profile ID

1. Click on your newly created profile
2. Look for **"Messaging Profile ID"** at the top
3. Copy this ID (looks like: `40000000-0000-0000-0000-000000000000`)

**IMPORTANT**: Save this ID - you'll need it for environment variables.

---

## Step 5: Get Your API Key

### 5.1 Navigate to API Keys

1. Click your **profile icon** in top-right corner
2. Click **"API Keys"** from dropdown
3. Click **"Create API Key"** button

### 5.2 Create API Key

1. **Key Name**: `GT Automotive Production`
2. **Key Type**: Select **"Full Access"** (recommended)
   - Alternatively, select **"Custom"** and enable only:
     - ✅ Messaging: Send and Receive
     - ✅ Numbers: View
3. Click **"Create API Key"**

### 5.3 Save Your API Key

**⚠️ CRITICAL - READ THIS CAREFULLY:**

1. Telnyx will show your API key **ONLY ONCE**
2. Copy the entire key (starts with `KEY...`)
3. Store it securely:
   - Save in password manager (1Password, LastPass)
   - Or save in a secure note
4. **Never share this key publicly**
5. **Never commit this key to Git**

Example format:
```
KEYa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

> **💡 If you lose this key**, you'll need to delete it and create a new one.

---

## Step 6: Configure Webhook

Webhooks allow Telnyx to notify GT Automotive about message delivery status.

### 6.1 Get Your Backend URL

Your production webhook URL is:
```
https://gt-automotives.com/api/sms/webhook
```

Or if using direct backend URL:
```
https://gt-automotives-backend-api.azurewebsites.net/api/sms/webhook
```

### 6.2 Update Messaging Profile

1. Go to **"Messaging"** → **"Messaging Profiles"**
2. Click on your **"GT Automotive SMS"** profile
3. Click **"Edit"** button
4. In **"Webhook URL"** field, enter:
   ```
   https://gt-automotives.com/api/sms/webhook
   ```
5. **Webhook Method**: Select **POST**
6. **Webhook Format**: Select **JSON**
7. Click **"Save Changes"**

### 6.3 Test Webhook (Optional)

1. In the same profile settings, click **"Test Webhook"**
2. Telnyx will send a test payload
3. Check your backend logs to verify receipt

---

## Step 7: Update Environment Variables

Now that you have all credentials, update your environment files.

### 7.1 Local Development (.env)

For testing locally:

```bash
# File: server/.env

# SMS Service (Telnyx)
SMS_ENABLED=true
TELNYX_API_KEY=KEYa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
TELNYX_PHONE_NUMBER=+12505551234
TELNYX_MESSAGING_PROFILE_ID=40000000-0000-0000-0000-000000000000
```

Replace with **YOUR actual values**:
- `TELNYX_API_KEY` - From Step 5
- `TELNYX_PHONE_NUMBER` - From Step 3
- `TELNYX_MESSAGING_PROFILE_ID` - From Step 4

### 7.2 Production (.env.production)

For production deployment:

```bash
# File: server/.env.production

# SMS Service (Telnyx)
SMS_ENABLED=true
TELNYX_API_KEY=KEYa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
TELNYX_PHONE_NUMBER=+12505551234
TELNYX_MESSAGING_PROFILE_ID=40000000-0000-0000-0000-000000000000
```

### 7.3 Azure App Service Environment Variables

You also need to add these to Azure:

1. Go to **Azure Portal**
2. Navigate to your backend App Service
3. Click **"Configuration"** → **"Application settings"**
4. Click **"+ New application setting"** for each:

| Name | Value |
|------|-------|
| `SMS_ENABLED` | `true` |
| `TELNYX_API_KEY` | `KEYa1b2c3d4...` |
| `TELNYX_PHONE_NUMBER` | `+12505551234` |
| `TELNYX_MESSAGING_PROFILE_ID` | `40000000-0000-...` |

5. Click **"Save"**
6. Click **"Continue"** to restart the app

---

## Step 8: Test SMS Sending

Let's verify everything works before deploying to production.

### 8.1 Start Local Development Server

```bash
cd /Users/vishaltoora/projects/gt-automotives-app
yarn dev
```

Wait for:
- ✅ Frontend: http://localhost:4200
- ✅ Backend: http://localhost:3000

### 8.2 Test via Postman or cURL

**Option A: Using cURL**

```bash
curl -X POST http://localhost:3000/api/sms/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1YOUR_PHONE_NUMBER",
    "body": "Test message from GT Automotive!",
    "type": "PROMOTIONAL",
    "customerId": "test-customer-id"
  }'
```

Replace `+1YOUR_PHONE_NUMBER` with your actual phone number.

**Option B: Using the Admin Dashboard**

1. Login as admin: http://localhost:4200/login
2. Navigate to **SMS History**: http://localhost:4200/admin/sms-history
3. The page should load without errors

### 8.3 Test Appointment Reminder (Full Flow)

1. Login as admin
2. Go to **Customers** → Create a test customer with your phone number
3. Go to **Appointments** → Create an appointment for tomorrow
4. Manually trigger reminder:

```bash
# Via backend console or direct database call
# This would normally run via cron at 9 AM
```

### 8.4 Check Telnyx Dashboard

1. Go to **Telnyx Dashboard** → **"Messaging"** → **"Messages"**
2. You should see your test message
3. Status should show:
   - ✅ **Queued** → **Sent** → **Delivered**

---

## Step 9: Deploy to Production

Once local testing is successful, deploy to production.

### 9.1 Commit Environment Variable Changes

**⚠️ IMPORTANT**: Never commit `.env` files with real credentials!

Only commit `.env.example` with placeholders:

```bash
git add server/.env.example
git commit -m "docs: update SMS environment variable examples"
```

### 9.2 Verify Azure Environment Variables

Double-check Azure App Service has all SMS variables (from Step 7.3).

### 9.3 Deploy Latest Code

```bash
# Push to main branch to trigger build
git push origin main

# Wait for GitHub Actions build to complete
# Then manually deploy via GitHub Actions UI
```

Or manually build and deploy:

```bash
# Build backend
yarn nx build server

# Deploy to Azure (your existing process)
```

### 9.4 Verify Production Deployment

1. Check backend logs for SMS service initialization:
   ```
   [SmsService] SMS Service initialized with Telnyx
   ```

2. Navigate to production admin dashboard:
   ```
   https://gt-automotives.com/admin/sms-history
   ```

3. Page should load successfully

### 9.5 Test Production SMS

Send a test SMS from production:

1. Create a test customer with your phone number
2. Create an appointment for tomorrow
3. Wait for automatic reminder at 9 AM
   - Or manually trigger via backend

---

## Troubleshooting

### Issue 1: "SMS service is disabled"

**Symptom**: Backend logs show SMS disabled warning

**Solution**:
1. Check `SMS_ENABLED=true` in environment variables
2. Restart backend server
3. Verify environment variable is loaded:
   ```bash
   echo $SMS_ENABLED  # Should output: true
   ```

---

### Issue 2: "Invalid phone number format"

**Symptom**: SMS fails with "Invalid phone number format" error

**Solution**:
- Phone numbers MUST be in E.164 format: `+1XXXXXXXXXX`
- Examples:
  - ✅ **Correct**: `+12505551234`
  - ❌ **Wrong**: `250-555-1234`
  - ❌ **Wrong**: `(250) 555-1234`
  - ❌ **Wrong**: `2505551234`

---

### Issue 3: "Customer has not opted in to SMS"

**Symptom**: SMS blocked with "Customer has not opted in" error

**Solution**:
1. Go to Admin Dashboard → Customers
2. Find the customer
3. Click **Edit**
4. Check SMS opt-in checkbox (once SMS preferences UI is integrated)
5. Or manually update database:
   ```sql
   INSERT INTO sms_preferences (customerId, optedIn, appointmentReminders, serviceUpdates)
   VALUES ('customer-id', true, true, true);
   ```

---

### Issue 4: Webhook not receiving delivery status

**Symptom**: Messages show as "SENT" but never "DELIVERED"

**Solution**:
1. Verify webhook URL is correct in Telnyx Messaging Profile
2. Check webhook URL is publicly accessible:
   ```bash
   curl https://gt-automotives.com/api/sms/webhook
   # Should return: {"success": true}
   ```
3. Check backend logs for incoming webhook requests
4. Verify firewall/security group allows Telnyx IPs

**Telnyx Webhook IPs to Whitelist**:
```
54.172.60.0/23
54.172.62.0/24
```

---

### Issue 5: Messages fail with "Insufficient balance"

**Symptom**: SMS status shows "FAILED" with balance error

**Solution**:
1. Go to Telnyx Dashboard → **Billing**
2. Check account balance
3. Add funds or enable auto-recharge
4. Recommended: Set auto-recharge at $10 → add $20

---

### Issue 6: Messages fail with "Invalid API Key"

**Symptom**: Telnyx API returns 401 Unauthorized

**Solution**:
1. Verify `TELNYX_API_KEY` is correct (starts with `KEY`)
2. Check API key hasn't been deleted in Telnyx dashboard
3. Regenerate API key if needed (Step 5)
4. Update environment variables
5. Restart backend

---

### Issue 7: Cron jobs not running

**Symptom**: Automatic reminders not sending at scheduled times

**Solution**:
1. Verify `@nestjs/schedule` module is imported in SmsModule
2. Check server timezone matches expected timezone
3. Verify cron expressions:
   - Customer reminders: `0 9 * * *` (9 AM daily)
   - Staff reminders: `0 8 * * *` (8 AM daily)
   - Admin summaries: `0 18 * * *` (6 PM daily)
4. Check backend logs for cron execution:
   ```
   [SmsSchedulerService] Starting daily appointment reminder job
   ```

---

### Issue 8: High SMS costs

**Symptom**: Bill higher than expected

**Solution**:
1. Check SMS History for unexpected volume
2. Review message types being sent
3. Common causes:
   - Multiple reminders for same appointment
   - Promotional messages to non-opted-in customers
   - Long messages being split into multiple segments
4. Optimize message templates to stay under 160 characters
5. Review and adjust reminder schedules if needed

---

## Cost Monitoring

### Check Current Month Spend

1. Telnyx Dashboard → **Billing** → **Usage**
2. View breakdown by:
   - Message count
   - Total cost
   - Cost per message type

### Expected Monthly Costs

**Conservative Estimate (500 messages/month)**:
- Phone Number: $2.00
- SMS (500 × $0.004): $2.00
- **Total: $4.00/month or $48/year**

**Growth Estimate (1,000 messages/month)**:
- Phone Number: $2.00
- SMS (1,000 × $0.004): $4.00
- **Total: $6.00/month or $72/year**

### Set Up Billing Alerts

1. Telnyx Dashboard → **Billing** → **Alerts**
2. Set alert when balance drops below $10
3. Enable email notifications

---

## Testing Checklist

Before going live, verify:

- [ ] Telnyx account created and verified
- [ ] Phone number purchased (250 area code)
- [ ] Messaging profile created
- [ ] API key generated and saved securely
- [ ] Webhook URL configured
- [ ] Environment variables updated (dev + production)
- [ ] Local testing successful
- [ ] Test SMS received on your phone
- [ ] Azure environment variables configured
- [ ] Production deployment successful
- [ ] Production webhook receiving delivery status
- [ ] Automatic reminders scheduled
- [ ] Admin SMS History page accessible

---

## Security Best Practices

### 1. Protect Your API Key

- ✅ Store in Azure Key Vault (recommended)
- ✅ Use environment variables
- ✅ Never commit to Git
- ❌ Never share in emails or chat
- ❌ Never expose in frontend code

### 2. Webhook Security

Add webhook signature verification (recommended):

```typescript
// In sms.controller.ts
import * as crypto from 'crypto';

@Post('webhook')
async handleWebhook(@Body() payload: any, @Headers() headers: any) {
  // Verify webhook signature
  const signature = headers['telnyx-signature-ed25519'];
  const timestamp = headers['telnyx-timestamp'];

  // Verify signature matches
  const isValid = this.verifyWebhookSignature(
    signature,
    timestamp,
    JSON.stringify(payload)
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  await this.smsService.handleWebhook(payload);
  return { success: true };
}
```

### 3. Rate Limiting

Already implemented in backend with `RATE_LIMIT_ENABLED=true`.

### 4. Data Privacy

- Customer phone numbers are stored encrypted in database
- SMS history only accessible to admins
- Opt-out honored immediately

---

## Support Resources

### Telnyx Support

- **Email**: support@telnyx.com
- **Phone**: 1-844-856-7532
- **Live Chat**: Available in dashboard
- **Documentation**: https://developers.telnyx.com/docs/

### GT Automotive SMS Documentation

- SMS Integration Plan: `.claude/docs/sms-integration-plan.md`
- Troubleshooting: This guide
- API Documentation: `.claude/docs/api-documentation.md`

---

## Next Steps After Setup

Once SMS is working:

1. **Enable for Real Customers**
   - Add SMS opt-in to customer registration
   - Send announcement about new SMS reminders
   - Encourage opt-in with incentives

2. **Monitor Performance**
   - Track delivery rates (target: >98%)
   - Monitor opt-out rates (target: <2%)
   - Measure no-show reduction

3. **Optimize Messages**
   - A/B test message templates
   - Adjust reminder timing based on feedback
   - Refine message length to minimize segments

4. **Expand Usage**
   - Add promotional campaigns
   - Implement two-way messaging
   - Add MMS for service photos

---

## Summary

**You've successfully set up Telnyx SMS integration!** 🎉

Your GT Automotive application can now:
- ✅ Send appointment reminders automatically
- ✅ Notify staff of new appointments
- ✅ Send daily summaries to admins
- ✅ Track delivery status and costs
- ✅ Manage customer opt-in preferences

**Total setup time**: 15-20 minutes
**Monthly cost**: $4-6 (500-1,000 messages)
**ROI**: Pays for itself with 2-3 prevented no-shows

---

**Questions?** Refer to the troubleshooting section or contact Telnyx support.

**Document Version**: 1.0
**Last Updated**: October 23, 2025
