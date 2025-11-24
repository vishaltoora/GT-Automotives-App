# Square Payment Integration Plan

## Overview
Complete Square payment integration for GT Automotives, enabling online invoice payments, customer portal payments, and physical card reader integration.

## Architecture

### Database Schema Addition
New `SquarePayment` model to track Square-specific payment data:
- `squarePaymentId` - Square's payment ID
- `squareOrderId` - Square's order ID (optional)
- `invoiceId` - Link to Invoice
- `amount` - Payment amount
- `currency` - CAD
- `status` - Square payment status
- `cardBrand` - Visa, Mastercard, etc.
- `last4` - Last 4 digits of card
- `receiptUrl` - Square receipt URL
- `metadata` - Additional Square data

### Backend Components

1. **SquarePaymentService** (`server/src/square/square-payment.service.ts`)
   - Initialize Square SDK client
   - Process payments
   - Create payment tokens
   - Handle refunds
   - Verify webhook signatures

2. **SquarePaymentController** (`server/src/square/square-payment.controller.ts`)
   - POST `/api/square/create-payment` - Process invoice payment
   - POST `/api/square/refund` - Process refund
   - POST `/api/square/webhook` - Handle Square webhooks
   - GET `/api/square/payment/:id` - Get payment details

3. **Square Webhook Handler**
   - Listen for payment.created
   - Listen for payment.updated
   - Update invoice status automatically
   - Send confirmation emails

### Frontend Components

1. **SquarePaymentForm** (`apps/webApp/src/app/components/square/SquarePaymentForm.tsx`)
   - Square Web Payments SDK integration
   - Credit card form with validation
   - Loading states and error handling
   - Success confirmation

2. **InvoicePaymentDialog** (`apps/webApp/src/app/components/invoices/InvoicePaymentDialog.tsx`)
   - Modal for paying invoice
   - Shows invoice details
   - Integrates SquarePaymentForm
   - Success/error handling

3. **PaymentHistory** (`apps/webApp/src/app/components/square/PaymentHistory.tsx`)
   - List of customer payments
   - Payment status
   - Receipt links

### Integration Points

1. **Invoice List** - Add "Pay Now" button
2. **Invoice Details** - Add payment section
3. **Customer Portal** - Show payment options
4. **Admin Dashboard** - View all Square transactions

## Environment Variables Needed

```bash
# Development (Sandbox)
SQUARE_ACCESS_TOKEN=sandbox_token_here
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=sandbox_app_id_here
SQUARE_LOCATION_ID=sandbox_location_id_here

# Production
SQUARE_ACCESS_TOKEN=prod_token_here
SQUARE_ENVIRONMENT=production
SQUARE_APPLICATION_ID=prod_app_id_here
SQUARE_LOCATION_ID=prod_location_id_here

# Webhook
SQUARE_WEBHOOK_SIGNATURE_KEY=webhook_signature_key_here
```

## Implementation Steps

### Phase 1: Database & Backend Foundation (Days 1-2)
- [ ] Create Prisma migration for SquarePayment model
- [ ] Install Square Node.js SDK
- [ ] Create SquarePaymentService with basic payment processing
- [ ] Create SquarePaymentController with endpoints
- [ ] Set up Square sandbox environment

### Phase 2: Frontend Payment Form (Days 3-4)
- [ ] Install react-square-web-payments-sdk
- [ ] Create SquarePaymentForm component
- [ ] Create InvoicePaymentDialog component
- [ ] Add "Pay Invoice" button to Invoice List
- [ ] Test payment flow with sandbox

### Phase 3: Customer Portal Integration (Day 5)
- [ ] Add payment history to customer dashboard
- [ ] Create "Pay Now" buttons for unpaid invoices
- [ ] Show payment status indicators
- [ ] Add receipt download links

### Phase 4: Webhook & Automation (Day 6)
- [ ] Implement webhook endpoint
- [ ] Add webhook signature verification
- [ ] Auto-update invoice status on payment
- [ ] Send payment confirmation emails
- [ ] Test webhook with Square's test events

### Phase 5: Admin Features (Day 7)
- [ ] Square payments dashboard
- [ ] Refund functionality
- [ ] Payment transaction history
- [ ] Revenue reporting with Square fees

### Phase 6: Testing & Documentation (Day 8)
- [ ] End-to-end testing
- [ ] Error handling review
- [ ] Documentation for setup
- [ ] Production deployment checklist

## Security Considerations

1. **PCI Compliance**: Square Web Payments SDK handles card data - never touches your server
2. **API Keys**: Store in environment variables, never commit to git
3. **Webhook Verification**: Always verify Square webhook signatures
4. **HTTPS Only**: Square requires HTTPS for production
5. **Idempotency**: Use idempotency keys to prevent duplicate charges

## Cost Analysis

### Processing Fees (as researched)
- In-person: 2.6% + $0.10
- Online: 2.9% + $0.30
- Invoices: 3.3% + $0.30

### Example Costs
- $100 invoice: $3.20 fee
- $500 invoice: $15.00 fee
- $1000 invoice: $29.30 fee

## User Workflows

### Customer Pays Invoice Online
1. Customer receives invoice email
2. Clicks "Pay Invoice" link
3. Opens payment form on GT Automotives site
4. Enters card details (secured by Square)
5. Clicks "Pay Now"
6. Square processes payment
7. Invoice automatically marked as PAID
8. Customer receives confirmation email

### Staff Takes In-Person Payment
1. Staff creates invoice in system
2. Clicks "Process Payment"
3. Customer taps/inserts card on Square device
4. Payment processes through Square API
5. Invoice marked as PAID
6. Receipt printed/emailed

### Customer Pays via Portal
1. Customer logs into portal
2. Sees list of unpaid invoices
3. Clicks "Pay Now" on specific invoice
4. Payment form opens
5. Enters card and pays
6. Sees confirmation immediately

## Success Metrics

- Reduce unpaid invoices by 50%
- 80% of customers pay within 24 hours
- Zero manual payment entry errors
- Automatic reconciliation with accounting
- Customer satisfaction increase

## Next Steps

1. Get Square account credentials (sandbox first)
2. Create database migration
3. Install Square SDK
4. Build payment service
5. Create payment form
6. Test with sandbox
7. Deploy to production

---

**Status**: Planning Complete - Ready for Implementation
**Estimated Time**: 8-10 days for full implementation
**Priority**: High - Adds crucial payment functionality
