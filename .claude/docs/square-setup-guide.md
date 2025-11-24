# Square Account Setup Guide

## Prerequisites
- Active Square account
- Access to Square Developer Dashboard
- Production or Sandbox credentials

## Step 1: Access Square Developer Dashboard

1. Go to https://developer.squareup.com/
2. Sign in with your Square account credentials
3. Click "Open Developer Dashboard"

## Step 2: Create Application (if not exists)

1. In the Developer Dashboard, click "+ Create App"
2. Enter application name: **GT Automotives Payment Integration**
3. Click "Create App"
4. Your application is now created

## Step 3: Get API Credentials

### Sandbox Credentials (for development)

1. In your application dashboard, click on the application name
2. In the left sidebar, click **"Credentials"**
3. Toggle to **"Sandbox"** mode at the top
4. Copy the following values:

```
Sandbox Application ID: sq0idp-XXXXXXXXXXXXXXXXXXXXXXXX
Sandbox Access Token: EAAAXXXXXXXXXXXXXXXXXXXXXXXXX
```

5. Scroll down to find **Location ID**:
```
Sandbox Location ID: LXXXXXXXXXXXXXXXXX
```

### Production Credentials (for live payments)

1. In the Credentials page, toggle to **"Production"** mode
2. Copy the following values:

```
Production Application ID: sq0idp-XXXXXXXXXXXXXXXXXXXXXXXX
Production Access Token: EAAAXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Copy your **Location ID**:
```
Production Location ID: LXXXXXXXXXXXXXXXXX
```

## Step 4: Configure Webhook (for production)

1. In the left sidebar, click **"Webhooks"**
2. Click **"+ Add Endpoint"**
3. Enter webhook URL:
   ```
   https://gt-automotives.com/api/square/webhook
   ```
4. Select API version: **2025-01-23** (latest)
5. Subscribe to events:
   - ✅ payment.created
   - ✅ payment.updated
   - ✅ refund.created
   - ✅ refund.updated

6. Click **"Save"**
7. Copy the **Webhook Signature Key**:
   ```
   Signature Key: XXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Step 5: Add Environment Variables

### Development (.env.local)

Add to `server/.env` or your environment configuration:

```bash
# Square Sandbox Credentials (Development)
SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN=EAAAXXXXXXXXXXXXXXXXXXXXXXXXX
SQUARE_APPLICATION_ID=sq0idp-XXXXXXXXXXXXXXXXXXXXXXXX
SQUARE_LOCATION_ID=LXXXXXXXXXXXXXXXXX
SQUARE_WEBHOOK_SIGNATURE_KEY=your_sandbox_webhook_key
```

### Production (Azure/Production Environment)

Add to Azure Web App Configuration or production `.env`:

```bash
# Square Production Credentials
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=EAAAXXXXXXXXXXXXXXXXXXXXXXXXX
SQUARE_APPLICATION_ID=sq0idp-XXXXXXXXXXXXXXXXXXXXXXXX
SQUARE_LOCATION_ID=LXXXXXXXXXXXXXXXXX
SQUARE_WEBHOOK_SIGNATURE_KEY=your_production_webhook_key
```

## Step 6: Frontend Environment Variables

Add to `apps/webApp/.env.local`:

```bash
# Square Frontend Configuration
VITE_SQUARE_APPLICATION_ID=sq0idp-XXXXXXXXXXXXXXXXXXXXXXXX
VITE_SQUARE_LOCATION_ID=LXXXXXXXXXXXXXXXXX
VITE_SQUARE_ENVIRONMENT=sandbox  # or 'production'
```

## Step 7: Test Square Sandbox

### Test Card Numbers (Sandbox Only)

Use these test cards in Sandbox mode:

| Card Number | Behavior |
|------------|----------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 0069 | Card declined: expired card |
| 4000 0000 0000 0119 | Card declined: processing error |
| 5105 1051 0510 5100 | Success (Mastercard) |
| 3782 822463 10005 | Success (Amex) |

**CVV**: Any 3 digits (e.g., 123)
**Expiration**: Any future date (e.g., 12/25)
**Postal Code**: Any valid postal code (e.g., V2N 4Z9)

### Testing Steps

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Navigate to an invoice in your app

3. Click "Pay Invoice" button

4. Enter test card: **4111 1111 1111 1111**

5. Enter CVV: **123**

6. Enter Expiration: **12/25**

7. Click "Pay Now"

8. Verify payment success message

9. Check Square Dashboard → Sandbox → Transactions to see the test payment

## Step 8: Verify Webhook Configuration (Production)

### Test Webhook Locally (Development)

Use ngrok or similar tool:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add to Square webhook settings: https://abc123.ngrok.io/api/square/webhook
```

### Verify Webhook Events

1. Make a test payment in Sandbox
2. Check server logs for webhook received messages
3. Verify invoice status updated automatically

## Step 9: Production Checklist

Before going live:

- [ ] Switched to Production credentials
- [ ] Updated frontend env vars to production
- [ ] Configured production webhook URL
- [ ] Tested payment flow with real card (small amount)
- [ ] Verified webhook events received
- [ ] Confirmed invoice auto-updates on payment
- [ ] Tested email confirmations sent
- [ ] Verified Square Dashboard shows transactions
- [ ] Confirmed refund functionality works
- [ ] Tested error scenarios (declined cards)

## Important Notes

### Security

- ✅ **NEVER** commit API keys to git
- ✅ Always use environment variables
- ✅ Production keys should only be on production server
- ✅ Verify webhook signatures to prevent fraud
- ✅ Use HTTPS for all production endpoints

### PCI Compliance

- ✅ Square Web Payments SDK handles card data (PCI Level 1)
- ✅ Card numbers never touch your server
- ✅ Only store last 4 digits and card brand
- ✅ Never log full card numbers

### Testing

- ✅ Always test in Sandbox first
- ✅ Use test card numbers (never real cards in sandbox)
- ✅ Verify webhooks work correctly
- ✅ Test refund scenarios
- ✅ Test error handling (declined cards, network errors)

## Troubleshooting

### "Unauthorized" Error

- Check that `SQUARE_ACCESS_TOKEN` is correct
- Verify you're using the right environment (sandbox vs production)
- Ensure access token matches the environment

### "Location not found" Error

- Verify `SQUARE_LOCATION_ID` is correct
- Check that location is active in Square Dashboard
- Ensure location matches environment (sandbox vs production)

### Webhook Not Receiving Events

- Verify webhook URL is publicly accessible (HTTPS)
- Check webhook signature verification code
- Review webhook logs in Square Dashboard
- Ensure correct API version selected

### Payment Stuck in "Processing"

- Check server logs for errors
- Verify Square API response handling
- Check database for payment record
- Review webhook logs

### Card Declined Errors

In Sandbox:
- Use approved test card numbers only
- Check CVV and expiration are valid

In Production:
- Customer's actual card may be declined
- Check Square Dashboard for decline reason
- Customer should contact their bank

## Support

- **Square Developer Docs**: https://developer.squareup.com/docs
- **Square Support**: https://squareup.com/help/contact
- **API Status**: https://status.squareup.com/
- **Developer Forum**: https://developer.squareup.com/forums

## Next Steps

After completing setup:

1. Install Square SDK: `yarn add square`
2. Install React Square SDK: `yarn add react-square-web-payments-sdk`
3. Implement Square Payment Service (backend)
4. Create Payment Form Component (frontend)
5. Test end-to-end payment flow
6. Deploy to production with production credentials

---

**Setup Complete!** You're now ready to integrate Square payments into GT Automotives.
