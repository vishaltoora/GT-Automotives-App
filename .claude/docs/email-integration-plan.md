# Email Integration Plan for GT Automotives

**Created**: October 28, 2025
**Status**: Planning Phase
**Recommended Provider**: Brevo (formerly Sendinblue)
**Estimated Cost**: $0/month (Free tier) → $15/month (if scaling needed)

## Executive Summary

This plan outlines the integration of transactional email capabilities into the GT Automotives application. After comprehensive research, **Brevo (formerly Sendinblue)** is the recommended provider, offering the best balance of cost, features, and ease of use for our automotive shop use case.

### Why Email Integration?

Currently, GT Automotives relies on SMS for notifications, but email provides:
- **Invoice Delivery**: Professional PDF invoices sent automatically
- **Appointment Confirmations**: Detailed appointment info with calendar attachments
- **Quotation Sharing**: Send quotes to customers for review
- **Payment Receipts**: Automated payment confirmations
- **Service Reminders**: Complementary to SMS reminders
- **Marketing**: Future promotional campaigns (oil change specials, seasonal deals)

### ROI Analysis
- **Cost**: $0/month initially (300 emails/day free tier covers ~9,000 emails/month)
- **Benefit**: Professional communication, reduced phone calls, automatic record-keeping
- **Customer Satisfaction**: Modern, professional communication experience
- **Time Savings**: Automated invoice/quote delivery saves 10-15 minutes per customer

---

## 1. Cost Comparison (2025 Pricing)

### Provider Pricing Summary

| Provider | Free Tier | Low Volume (5k-10k/mo) | Medium Volume (50k/mo) | High Volume (100k/mo) | Best For |
|----------|-----------|------------------------|------------------------|-----------------------|----------|
| **Brevo** | **300/day (9k/mo)** | **$15/mo (20k)** | **$15-25/mo** | **$25-40/mo** | **Best overall value** |
| Resend | 3k/month | $20/mo (10k) | $50/mo (50k) | $90/mo (100k) | Developer experience |
| AWS SES | 3k/mo (1st year) | $1/mo | $5/mo | $10/mo | Cheapest but complex |
| Mailgun | 100/day trial | $35/mo (50k) | $35/mo | $90/mo (100k) | Enterprise features |
| SendGrid | 100/day | $15/mo (10k) | $60/mo (50k) | $89.95/mo (100k) | Popular but expensive |
| Postmark | 100/month | $15/mo (10k) | $75/mo (50k) | $150/mo (100k) | High deliverability |

### GT Automotives Expected Volume

**Estimated Monthly Email Volume:**
- Appointment confirmations: ~120 emails (4/day × 30 days)
- Invoice delivery: ~100 emails (100 invoices/month)
- Quotation emails: ~50 emails (50 quotes/month)
- Payment receipts: ~80 emails (80 payments/month)
- Appointment reminders: ~120 emails (duplicate of SMS)
- Service completion notices: ~100 emails
- **Total**: ~570 emails/month (well within Brevo's 9,000/month free tier)

**Growth Projection:**
- Year 1: 500-1,000 emails/month (FREE on Brevo)
- Year 2: 1,500-3,000 emails/month (FREE on Brevo)
- Year 3: 3,000-6,000 emails/month (FREE on Brevo)
- Year 5: 10,000-15,000 emails/month ($15-25/month on Brevo)

---

## 2. Provider Detailed Comparison

### 🏆 RECOMMENDED: Brevo (formerly Sendinblue)

**Pricing:**
- Free: 300 emails/day (9,000/month) - **PERFECT for GT Automotives**
- Paid: $15/month for 20,000 emails
- Scale: $25/month for 40,000 emails

**Pros:**
- ✅ Most generous free tier (9,000 emails/month)
- ✅ Simple, user-friendly dashboard
- ✅ SMTP relay + REST API
- ✅ Email templates with drag-and-drop editor
- ✅ Transactional email tracking
- ✅ Contact management included
- ✅ Marketing emails + transactional emails in one platform
- ✅ Webhooks for delivery tracking
- ✅ Good documentation and Node.js SDK

**Cons:**
- ⚠️ Daily limit (300/day) might require monitoring if batch sending
- ⚠️ Brevo branding on free tier emails (can be removed on paid)

**Perfect For:**
- Small to medium businesses
- Combined transactional + marketing needs
- Budget-conscious operations
- Simple integration requirements

---

### Alternative Option: Resend

**Pricing:**
- Free: 3,000 emails/month
- Paid: $20/month for 10,000 emails
- Scale: $50/month for 50,000 emails

**Pros:**
- ✅ Developer-first API design
- ✅ React Email integration (modern templates)
- ✅ Clean, modern dashboard
- ✅ Excellent documentation
- ✅ No daily limits (monthly only)

**Cons:**
- ⚠️ Lower free tier (3k vs Brevo's 9k)
- ⚠️ Higher cost at scale
- ⚠️ Newer platform (less proven)

**Good For:**
- Developer-heavy teams
- React/modern stack projects
- Preference for API-first approach

---

### Budget Option: AWS SES

**Pricing:**
- Free: 3,000 emails/month (first 12 months)
- After free tier: $0.10 per 1,000 emails

**Pros:**
- ✅ Cheapest at scale ($1 for 10k emails)
- ✅ Reliable infrastructure
- ✅ Part of AWS ecosystem

**Cons:**
- ❌ Complex setup (requires AWS knowledge)
- ❌ Need separate service for bounce/complaint handling
- ❌ No built-in template management
- ❌ Requires verification process
- ❌ Need to build own tracking/monitoring

**Only Consider If:**
- Already using AWS infrastructure
- Have dedicated DevOps resources
- Sending 100k+ emails/month

---

## 3. GT Automotives Email Use Cases

### A. Appointment Confirmation Emails

**Trigger**: Immediately after appointment booking

**Email Content**:
```
Subject: Appointment Confirmed - GT Automotives

Hi {firstName},

Your appointment has been confirmed!

Service: {serviceType}
Date: {date} at {time}
Vehicle: {year} {make} {model}
Location: {isAtGarage ? 'GT Automotives Shop' : 'Mobile Service at ' + customerAddress}

Assigned Technician: {employeeName}

What to Bring:
- Vehicle registration
- Previous service records (if available)

Need to reschedule? Call us at (250) 986-9191 or reply to this email.

[Add to Calendar Button] (iCal attachment)

GT Automotives
Prince George, BC
(250) 986-9191
```

**Features Needed**:
- Calendar attachment (.ics file)
- Professional HTML template
- Delivery tracking

---

### B. Invoice Email Delivery

**Trigger**: When invoice is marked as complete or sent to customer

**Email Content**:
```
Subject: Invoice #{invoiceNumber} - GT Automotives

Hi {firstName},

Thank you for choosing GT Automotives! Your service is complete.

Invoice Number: #{invoiceNumber}
Total Amount: ${totalAmount}
{paymentStatus === 'PAID' ? 'Status: PAID' : 'Amount Due: $' + amountDue}

Services Performed:
- {servicesList}

Your invoice is attached as a PDF.

{if not paid}
Payment Options:
- Cash, Credit/Debit at shop
- E-Transfer to: payments@gt-automotives.com
{endif}

Questions? Call us at (250) 986-9191

GT Automotives
Prince George, BC
```

**Features Needed**:
- PDF attachment support (invoice PDF)
- Professional invoice template
- Payment status tracking

---

### C. Quotation Email

**Trigger**: When admin/staff sends quotation to customer

**Email Content**:
```
Subject: Service Quote #{quoteNumber} - GT Automotives

Hi {firstName},

We've prepared a quote for the service you requested.

Quote Number: #{quoteNumber}
Vehicle: {year} {make} {model}
Valid Until: {validUntil}

Estimated Cost: ${totalAmount}
Estimated Time: {estimatedHours} hours

Services Included:
- {servicesList}

This quote is valid for {daysValid} days. Call us at (250) 986-9191 to schedule your appointment.

[View Quote PDF] (attachment)

GT Automotives
Prince George, BC
```

**Features Needed**:
- PDF attachment support
- Link to book appointment (future enhancement)

---

### D. Payment Receipt

**Trigger**: When payment is recorded for invoice

**Email Content**:
```
Subject: Payment Receipt - Invoice #{invoiceNumber}

Hi {firstName},

Thank you for your payment!

Invoice: #{invoiceNumber}
Payment Amount: ${paymentAmount}
Payment Method: {paymentMethod}
Date: {paymentDate}

{if fullyPaid}
Your invoice is now PAID IN FULL.
{else}
Remaining Balance: ${remainingBalance}
{endif}

Receipt is attached.

GT Automotives
Prince George, BC
(250) 986-9191
```

**Features Needed**:
- PDF receipt generation
- Payment tracking

---

### E. Service Completion Notice

**Trigger**: When job status is updated to "Complete"

**Email Content**:
```
Subject: Your Vehicle is Ready! - GT Automotives

Hi {firstName},

Great news! Your {year} {make} {model} is ready for pickup.

Service Completed: {serviceType}
Total: ${invoiceTotal}
{paymentStatus === 'PAID' ? 'Status: Paid' : 'Please bring payment'}

Pickup Hours:
Monday-Friday: 8am-6pm
Saturday: 9am-4pm

See you soon!

GT Automotives
Prince George, BC
(250) 986-9191
```

**Features Needed**:
- Simple transactional email
- Status updates

---

## 4. Technical Implementation (Brevo)

### Installation

```bash
# Install Brevo Node.js SDK
npm install @sendinblue/client
# or
yarn add @sendinblue/client
```

### Environment Variables

```env
# Brevo Configuration
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_SENDER_EMAIL=noreply@gt-automotives.com
BREVO_SENDER_NAME=GT Automotives
EMAIL_ENABLED=true
```

### Backend Service Structure

```
server/src/
├── email/
│   ├── email.module.ts
│   ├── email.service.ts          # Main email service
│   ├── email.controller.ts       # Admin endpoints
│   ├── templates/                # Email template helpers
│   │   ├── appointment-confirmation.ts
│   │   ├── invoice-delivery.ts
│   │   ├── quotation.ts
│   │   ├── payment-receipt.ts
│   │   └── service-complete.ts
│   └── dto/
│       ├── send-email.dto.ts
│       └── email-template.dto.ts
```

### Database Schema Addition

```prisma
// libs/database/src/lib/prisma/schema.prisma

model EmailLog {
  id            String        @id @default(cuid())
  to            String        // Recipient email
  from          String        // Sender email
  subject       String        // Email subject
  type          EmailType     // Type of email
  status        EmailStatus   @default(PENDING)

  // Brevo specific
  brevoMessageId String?      @unique

  // Relationships
  appointmentId String?
  appointment   Appointment?  @relation(fields: [appointmentId], references: [id])
  invoiceId     String?
  invoice       Invoice?      @relation(fields: [invoiceId], references: [id])
  quotationId   String?
  quotation     Quotation?    @relation(fields: [quotationId], references: [id])
  customerId    String?
  customer      Customer?     @relation(fields: [customerId], references: [id])

  // Timestamps
  sentAt        DateTime?
  deliveredAt   DateTime?
  openedAt      DateTime?     // If tracking enabled
  clickedAt     DateTime?     // If tracking enabled
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([appointmentId])
  @@index([invoiceId])
  @@index([quotationId])
  @@index([customerId])
  @@index([status])
  @@index([type])
  @@map("email_logs")
}

enum EmailStatus {
  PENDING
  QUEUED
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  COMPLAINED
  FAILED
}

enum EmailType {
  APPOINTMENT_CONFIRMATION
  APPOINTMENT_REMINDER
  APPOINTMENT_CANCELLATION
  INVOICE_DELIVERY
  QUOTATION
  PAYMENT_RECEIPT
  SERVICE_COMPLETE
  PROMOTIONAL
}
```

### Sample Email Service Code

```typescript
// server/src/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from '@sendinblue/client';
import { PrismaService } from '@gt-automotive/database';
import { EmailStatus, EmailType } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstance: any;
  private readonly enabled: boolean;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly prisma: PrismaService) {
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@gt-automotives.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'GT Automotives';

    if (this.enabled) {
      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        this.logger.error('BREVO_API_KEY not set - Email will be disabled');
        (this as any).enabled = false;
        return;
      }

      // Initialize Brevo API
      const apiClient = SibApiV3Sdk.ApiClient.instance;
      const apiKeyAuth = apiClient.authentications['api-key'];
      apiKeyAuth.apiKey = apiKey;
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      this.logger.log('Email Service initialized with Brevo');
    } else {
      this.logger.warn('Email Service is disabled');
    }
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    htmlContent: string;
    type: EmailType;
    appointmentId?: string;
    invoiceId?: string;
    quotationId?: string;
    customerId?: string;
    attachments?: Array<{ name: string; content: string }>; // Base64 encoded
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.warn('[EMAIL] Email Service is DISABLED');
      return { success: false, error: 'Email service is disabled' };
    }

    // Create email log
    const emailLog = await this.prisma.emailLog.create({
      data: {
        to: params.to,
        from: this.senderEmail,
        subject: params.subject,
        type: params.type,
        status: EmailStatus.PENDING,
        appointmentId: params.appointmentId,
        invoiceId: params.invoiceId,
        quotationId: params.quotationId,
        customerId: params.customerId,
      },
    });

    try {
      const sendSmtpEmail = {
        sender: { email: this.senderEmail, name: this.senderName },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        attachment: params.attachments,
      };

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      // Update log with success
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
          brevoMessageId: response.messageId,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Email sent successfully: ${response.messageId}`);
      return { success: true, messageId: response.messageId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${errorMessage}`);

      // Update log with failure
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
        employees: { include: { employee: true } },
      },
    });

    if (!appointment || !appointment.customer.email) {
      this.logger.warn('Appointment or customer email not found');
      return;
    }

    const htmlContent = `
      <h2>Appointment Confirmed</h2>
      <p>Hi ${appointment.customer.firstName},</p>
      <p>Your appointment has been confirmed!</p>

      <h3>Details:</h3>
      <ul>
        <li><strong>Service:</strong> ${appointment.serviceType}</li>
        <li><strong>Date:</strong> ${appointment.appointmentDate.toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${appointment.startTime}</li>
        <li><strong>Vehicle:</strong> ${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}</li>
      </ul>

      <p>Need to reschedule? Call us at (250) 986-9191</p>
      <p>GT Automotives<br>Prince George, BC</p>
    `;

    await this.sendEmail({
      to: appointment.customer.email,
      subject: 'Appointment Confirmed - GT Automotives',
      htmlContent,
      type: EmailType.APPOINTMENT_CONFIRMATION,
      appointmentId: appointment.id,
      customerId: appointment.customer.id,
    });
  }

  // Add more methods: sendInvoice, sendQuotation, sendPaymentReceipt, etc.
}
```

---

## 5. Implementation Roadmap

### Phase 1: Setup & Basic Integration (Week 1)
- [ ] Create Brevo account and verify domain
- [ ] Set up SPF/DKIM/DMARC records for gt-automotives.com
- [ ] Install Brevo SDK in backend
- [ ] Create EmailService and EmailModule
- [ ] Add email database schema and migration
- [ ] Create basic HTML email templates

### Phase 2: Core Features (Week 2)
- [ ] Implement appointment confirmation emails
- [ ] Implement invoice delivery emails
- [ ] Implement quotation emails
- [ ] Add email logging and tracking
- [ ] Test email delivery and formatting

### Phase 3: Enhanced Features (Week 3)
- [ ] Add PDF attachments (invoices, quotes, receipts)
- [ ] Implement payment receipt emails
- [ ] Implement service completion emails
- [ ] Add calendar attachments (.ics) for appointments
- [ ] Create admin email history dashboard

### Phase 4: Monitoring & Optimization (Week 4)
- [ ] Set up Brevo webhooks for delivery tracking
- [ ] Add email analytics to admin dashboard
- [ ] Implement email templates with branding
- [ ] Add customer email preferences (opt-in/opt-out)
- [ ] Test with real customers

---

## 6. Email Templates & Branding

### Template System

Use Brevo's drag-and-drop template editor or create HTML templates with:
- GT Automotives logo
- Brand colors (from theme)
- Consistent header/footer
- Mobile-responsive design
- Clear call-to-action buttons

### Branding Elements

```html
<!-- Email Header -->
<div style="background-color: #1976d2; padding: 20px; text-align: center;">
  <img src="https://gt-automotives.com/logo.png" alt="GT Automotives" style="max-width: 200px;">
</div>

<!-- Email Footer -->
<div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
  <p>GT Automotives - Prince George, BC</p>
  <p>Phone: (250) 986-9191</p>
  <p>Email: info@gt-automotives.com</p>
  <p><a href="https://gt-automotives.com">Visit Our Website</a></p>
</div>
```

---

## 7. Cost Projections

### Year 1-3: FREE
- Expected volume: 500-6,000 emails/month
- Brevo free tier: 9,000 emails/month (300/day)
- **Cost: $0/month**

### Year 4-5: Minimal Cost
- Expected volume: 10,000-15,000 emails/month
- Brevo paid tier: $15-25/month for 20k-40k emails
- **Cost: $15-25/month**

### 5-Year Total Cost
- **$0-300 total over 5 years**
- Compared to SMS: $48/year for Telnyx
- Combined communication cost: ~$20-30/month at scale

---

## 8. Domain Setup Requirements

### DNS Records to Add (Namecheap)

Before sending emails, you need to configure these DNS records:

```
1. SPF Record (TXT)
   Host: @
   Value: v=spf1 include:spf.sendinblue.com ~all

2. DKIM Record (TXT)
   Host: mail._domainkey
   Value: (Brevo will provide this after account setup)

3. DMARC Record (TXT)
   Host: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@gt-automotives.com
```

These records ensure emails don't go to spam and verify your domain ownership.

---

## 9. Testing Strategy

### Test Checklist

- [ ] Send test appointment confirmation
- [ ] Send test invoice with PDF attachment
- [ ] Send test quotation email
- [ ] Verify emails don't go to spam
- [ ] Test on multiple email clients (Gmail, Outlook, Apple Mail)
- [ ] Test on mobile devices
- [ ] Verify tracking (opens, clicks)
- [ ] Test unsubscribe links (for marketing emails)

---

## 10. Compliance & Best Practices

### CAN-SPAM Compliance

- ✅ Include physical address in footer
- ✅ Clear "From" name (GT Automotives)
- ✅ Accurate subject lines
- ✅ Unsubscribe option for marketing emails
- ✅ Honor opt-out requests within 10 days

### Email Best Practices

- Keep emails concise and scannable
- Use clear call-to-action buttons
- Optimize for mobile devices
- Test before sending to customers
- Monitor bounce rates and spam complaints
- Never buy email lists
- Only send to customers who provided email

---

## 11. Monitoring & Analytics

### Metrics to Track

- **Send Rate**: Emails sent per day/month
- **Delivery Rate**: % of emails successfully delivered
- **Open Rate**: % of emails opened (if tracking enabled)
- **Click Rate**: % of links clicked
- **Bounce Rate**: % of emails that bounced
- **Complaint Rate**: % of spam complaints

### Dashboard Features

Admin can view:
- Email history by customer
- Email history by type
- Delivery status
- Failed emails with error messages
- Monthly email volume

---

## 12. Future Enhancements

### Phase 5+ (Future)

- [ ] Marketing campaigns (oil change reminders, seasonal promos)
- [ ] Automated birthday/anniversary emails
- [ ] Customer satisfaction surveys via email
- [ ] Email newsletter for maintenance tips
- [ ] Integration with calendar systems
- [ ] Advanced email templates with dynamic content
- [ ] A/B testing for email subject lines
- [ ] Automated follow-up sequences

---

## Summary & Recommendation

**Recommended Provider**: Brevo (formerly Sendinblue)

**Why Brevo?**
1. Most generous free tier (9,000 emails/month)
2. Perfect for GT Automotives' expected volume (500-6,000/month)
3. Simple integration with Node.js SDK
4. Professional features (templates, tracking, webhooks)
5. Future-proof (can scale to marketing emails)
6. Excellent documentation and support

**Estimated Costs:**
- Year 1-3: **$0/month** (free tier)
- Year 4-5: **$15-25/month** (if volume increases)
- 5-Year Total: **~$200-300**

**Next Steps:**
1. Create Brevo account
2. Set up domain verification and DNS records
3. Implement Phase 1 (basic integration)
4. Test with staff emails first
5. Roll out to customers gradually

---

**Last Updated**: October 28, 2025
