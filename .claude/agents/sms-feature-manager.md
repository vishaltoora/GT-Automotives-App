# SMS Feature Manager Agent

**Purpose**: Specialized agent for managing SMS/text messaging features in GT Automotive application

**Created**: October 23, 2025
**Status**: Active

---

## Overview

This agent provides guidance and automation for all SMS-related tasks including:
- Adding new SMS message types
- Updating SMS templates
- Managing SMS preferences
- Troubleshooting SMS delivery issues
- Testing SMS workflows
- Monitoring SMS costs and usage

---

## Key Principles

### 1. **Always Check Opt-In Status**
- **Customer SMS**: Check `SmsPreference.customerId` and `optedIn = true`
- **Staff/Admin SMS**: Check `SmsPreference.userId` and `optedIn = true`
- **Never send SMS** to users who haven't opted in

### 2. **Phone Number Validation**
- **Format**: E.164 format required: `+1XXXXXXXXXX` (Canada/US)
- **Regex**: `/^\+1\d{10}$/`
- **Storage**: Always store phone numbers WITH the +1 prefix
- **Display**: Can display as (XXX) XXX-XXXX but store as +1XXXXXXXXXX

### 3. **Error Handling**
- **Non-blocking**: SMS failures should NEVER block critical operations (e.g., appointment creation)
- **Logging**: Always log SMS errors with detailed context
- **Database**: Track all SMS attempts in `sms_messages` table with status

### 4. **Cost Tracking**
- **Record costs**: Update `cost` field in SmsMessage after send
- **Monitor segments**: Track message segments (160 chars per segment)
- **Analytics**: Provide cost reporting in admin dashboard

### 5. **Message Templates**
- **Branding**: Always include "GT Automotive" and location (Prince George, BC)
- **Contact Info**: Include phone number (250) 555-0100 for reschedules
- **Personalization**: Use customer/staff first name
- **Clear CTAs**: Tell recipient what to do (CONFIRM, call, etc.)

---

## SMS Architecture

### Database Schema

```prisma
model SmsMessage {
  id              String        @id @default(cuid())
  to              String        // E.164 format: +1XXXXXXXXXX
  from            String        // Telnyx number: +12366015757
  body            String        // Message content
  status          SmsStatus     @default(PENDING)
  type            SmsType       // Message category
  telnyxMessageId String?       @unique
  cost            Decimal?      @db.Decimal(10, 6)
  segments        Int?          @default(1)
  errorMessage    String?

  // Relationships
  appointmentId   String?
  appointment     Appointment?
  customerId      String?
  customer        Customer?
  userId          String?
  user            User?

  sentAt          DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model SmsPreference {
  id                    String    @id @default(cuid())

  // Can be for customer OR user (staff/admin)
  customerId            String?   @unique
  customer              Customer?
  userId                String?   @unique
  user                  User?

  optedIn               Boolean   @default(false)
  optedInAt             DateTime?
  optedOutAt            DateTime?

  // Customer preferences
  appointmentReminders  Boolean   @default(true)
  serviceUpdates        Boolean   @default(true)
  promotional           Boolean   @default(false)

  // Staff/Admin preferences
  appointmentAlerts     Boolean   @default(true)
  scheduleReminders     Boolean   @default(true)
  dailySummary          Boolean   @default(true)
  urgentAlerts          Boolean   @default(true)
}

enum SmsType {
  APPOINTMENT_REMINDER
  APPOINTMENT_CONFIRMATION
  SERVICE_STATUS
  SERVICE_COMPLETE
  PROMOTIONAL
  EMERGENCY
  STAFF_APPOINTMENT_ALERT
  STAFF_SCHEDULE_REMINDER
  ADMIN_DAILY_SUMMARY
  ADMIN_URGENT_ALERT
}
```

### Service Layer

**Location**: `server/src/sms/sms.service.ts`

**Key Methods**:
- `sendSms()` - Core sending logic with opt-in checks
- `sendAppointmentConfirmation()` - Immediate booking confirmation
- `sendAppointmentReminder()` - 1-hour before reminder
- `sendStaffAppointmentAlert()` - Alert to assigned employee
- `sendStaffScheduleReminder()` - Daily schedule summary
- `sendAdminDailySummary()` - End-of-day metrics
- `handleWebhook()` - Process Telnyx delivery status

### Scheduler Service

**Location**: `server/src/sms/sms-scheduler.service.ts`

**Cron Jobs**:
- `@Cron('*/15 * * * *')` - Every 15 minutes: Check for 1-hour reminders

### Controller

**Location**: `server/src/sms/sms.controller.ts`

**Endpoints**:
- `POST /api/sms/webhook` - Telnyx delivery status (no auth)
- `GET /api/sms/history` - SMS history (admin only)
- `GET /api/sms/preferences/customer` - Get customer preferences
- `GET /api/sms/preferences/user` - Get staff/admin preferences
- `POST /api/sms/preferences/customer` - Update customer preferences
- `POST /api/sms/preferences/user` - Update staff/admin preferences
- `GET /api/sms/statistics` - Analytics dashboard (admin only)

---

## Common Tasks

### Task 1: Add New SMS Message Type

**Steps**:
1. Add new enum value to `SmsType` in `schema.prisma`
2. Create migration: `yarn prisma migrate dev --name "add_sms_type_xyz"`
3. Add new method to `SmsService` (follow existing pattern)
4. Add preference check if needed
5. Update frontend if user-facing

**Example**:
```typescript
// schema.prisma
enum SmsType {
  // ... existing types
  PAYMENT_REMINDER  // NEW
}

// sms.service.ts
async sendPaymentReminder(invoiceId: string): Promise<void> {
  const invoice = await this.prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice || !invoice.customer.phone) {
    return;
  }

  const message = `Hi ${invoice.customer.firstName}, friendly reminder that invoice #${invoice.invoiceNumber} for $${invoice.total.toFixed(2)} is due on ${invoice.dueDate.toLocaleDateString()}. Pay online or call us at (250) 555-0100.\n\nGT Automotive\nPrince George, BC`;

  await this.sendSms({
    to: invoice.customer.phone,
    body: message,
    type: SmsType.PAYMENT_REMINDER,
    customerId: invoice.customer.id,
  });
}
```

### Task 2: Update SMS Template

**Steps**:
1. Find the method in `sms.service.ts` (e.g., `sendAppointmentConfirmation`)
2. Update the message template
3. Test with real phone number
4. Verify message length (keep under 160 chars if possible to avoid multi-segment charges)
5. Deploy to production

**Message Best Practices**:
- Keep under 160 characters when possible (1 segment = $0.004)
- Use clear, concise language
- Include brand name "GT Automotive"
- Add call-to-action (CONFIRM, call, etc.)
- Personalize with customer name
- Include contact info for questions

### Task 3: Add SMS to Existing Feature

**Pattern**: Appointment creation integration (reference)

**Steps**:
1. Import `SmsService` into target module
2. Add `SmsModule` to target module's imports
3. Inject `SmsService` in target service constructor
4. Call SMS method after successful operation
5. Use `.catch()` to prevent SMS failures from blocking operation

**Example**:
```typescript
// target.module.ts
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [SmsModule],
  // ...
})

// target.service.ts
import { SmsService } from '../sms/sms.service';

constructor(private smsService: SmsService) {}

async createOperation() {
  // Create operation
  const result = await this.prisma.operation.create({ ... });

  // Send SMS (non-blocking)
  await this.smsService.sendOperationConfirmation(result.id).catch(err => {
    console.error('Failed to send SMS:', err);
    // Don't throw - operation succeeded
  });

  return result;
}
```

### Task 4: Troubleshoot SMS Delivery

**Common Issues**:

1. **SMS not sending**:
   - Check `SMS_ENABLED=true` in environment variables
   - Verify Telnyx credentials are correct
   - Check phone number format (must be +1XXXXXXXXXX)
   - Verify customer/user has opted in
   - Check database `sms_messages` table for error messages

2. **SMS shows PENDING forever**:
   - Check Telnyx dashboard for delivery status
   - Verify webhook is configured (https://gt-automotives.com/api/sms/webhook)
   - Check webhook signature verification

3. **Opt-in check failing**:
   - Verify `SmsPreference` record exists for customer/user
   - Check `optedIn = true`
   - Use admin dashboard to manually set opt-in for testing

4. **Wrong phone number format**:
   - Always validate with regex: `/^\+1\d{10}$/`
   - Reject numbers without +1 prefix
   - Strip spaces, dashes, parentheses before validation

**Debug SQL**:
```sql
-- Check recent SMS messages
SELECT * FROM sms_messages ORDER BY created_at DESC LIMIT 10;

-- Check customer opt-in status
SELECT c.first_name, c.last_name, c.phone, sp.opted_in, sp.opted_in_at
FROM customers c
LEFT JOIN sms_preferences sp ON sp.customer_id = c.id
WHERE c.phone IS NOT NULL;

-- Check failed SMS
SELECT to, body, status, error_message, created_at
FROM sms_messages
WHERE status = 'FAILED'
ORDER BY created_at DESC;
```

### Task 5: Test SMS Workflow

**Local Testing**:
```bash
# 1. Ensure environment variables are set
cat server/.env | grep SMS
cat server/.env | grep TELNYX

# 2. Start development servers
yarn dev

# 3. Create test customer with phone number
# Use your personal cell: +1XXXXXXXXXX

# 4. Manually set opt-in in database
psql $DATABASE_URL
INSERT INTO sms_preferences (id, customer_id, opted_in, opted_in_at, appointment_reminders)
VALUES (gen_random_uuid(), 'CUSTOMER_ID', true, NOW(), true);

# 5. Create appointment for that customer
# Should receive immediate confirmation SMS

# 6. Check SMS history in admin dashboard
# Navigate to: http://localhost:4200/admin/sms-history
```

**Production Testing**:
```bash
# 1. Check Telnyx dashboard
# https://portal.telnyx.com/#/app/messaging

# 2. Check SMS history via API
curl https://gt-automotives.com/api/sms/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Check database
# Connect to production database and run debug SQL above
```

---

## Integration Points

### 1. Appointment Creation
**File**: `server/src/appointments/appointments.service.ts`
**Trigger**: After appointment created
**SMS Sent**:
- Customer: Appointment confirmation
- Employees: Assignment alert

### 2. Appointment Reminder
**File**: `server/src/sms/sms-scheduler.service.ts`
**Trigger**: Cron job every 15 minutes
**SMS Sent**:
- Customer: 1-hour before reminder

### 3. Manual EOD Summary (Pending)
**File**: TBD
**Trigger**: Manual button click by admin/employee
**SMS Sent**:
- Admin: Daily summary with metrics

---

## Environment Variables

**Required**:
```bash
# Enable/disable SMS system
SMS_ENABLED=true

# Telnyx credentials
TELNYX_API_KEY=KEY019A12E58E404F383F416E54C3A081B3_8GaswjMEGBYxiSUzNTDI2p
TELNYX_PHONE_NUMBER=+12366015757
TELNYX_MESSAGING_PROFILE_ID=40019a12-d618-4140-9066-cea635fbd4a9
TELNYX_PUBLIC_KEY=f6DmNwLKKN6yBzlEg76RozABbpZpf2XRCldCzuyED7o=
```

**Files**:
- `server/.env` (local development)
- `server/.env.production` (production)
- Azure App Service → Configuration → Application Settings

---

## Cost Monitoring

### Telnyx Costs
- **SMS**: $0.004 per message segment
- **Phone Number**: $2/month
- **Segment**: 160 characters (GSM-7) or 70 characters (Unicode)

### Projected Costs
- **500 messages/month**: $2 + $2 = $4/month
- **1,000 messages/month**: $4 + $2 = $6/month

### Cost Optimization
1. Keep messages under 160 characters when possible
2. Avoid emojis (forces Unicode = 70 char segments)
3. Monitor promotional message frequency (max 4/month per customer)
4. Use admin dashboard to track total costs

---

## Testing Checklist

Before deploying SMS changes:

- [ ] Phone number validation works (E.164 format)
- [ ] Opt-in check prevents unauthorized sends
- [ ] Message template is clear and under 160 chars
- [ ] Error handling doesn't block critical operations
- [ ] Database tracks all send attempts
- [ ] Telnyx webhook updates delivery status
- [ ] Admin dashboard shows new message type
- [ ] Cost is tracked in database
- [ ] Test with real phone number
- [ ] Production environment variables updated

---

## Useful Commands

```bash
# Check SMS service status
yarn nx run server:serve
# Watch logs for SMS-related messages

# Check database for recent SMS
psql $DATABASE_URL -c "SELECT * FROM sms_messages ORDER BY created_at DESC LIMIT 10;"

# Manually trigger cron job (for testing)
# Add this to sms-scheduler.service.ts temporarily:
@Get('test-cron')
async testCron() {
  await this.sendOneHourReminders();
  return { message: 'Cron job executed' };
}

# Send test SMS via curl
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"to": "+12506499699", "message": "Test SMS"}'
```

---

## Key Learnings

### 1. **Phone Number Linking to Messaging Profile**
- **Issue**: Telnyx phone numbers must be explicitly linked to messaging profile
- **Solution**: `PATCH /v2/phone_numbers/{id}/messaging` with `messaging_profile_id`
- **Prevention**: Always verify phone number is linked after purchase

### 2. **Mobile-Only Restriction**
- **Issue**: Telnyx may have "mobile-only" setting enabled
- **Solution**: Disable in Telnyx dashboard or only send to mobile numbers
- **Testing**: Always test with actual mobile number, not landline

### 3. **Auth Guard Imports**
- **Issue**: Wrong imports for NestJS auth guards caused build failures
- **Solution**: Use `JwtAuthGuard`, `RoleGuard`, `Roles` from correct paths
- **Pattern**:
  ```typescript
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RoleGuard } from '../auth/guards/role.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  ```

### 4. **Non-Blocking SMS**
- **Issue**: SMS failures should never block critical operations
- **Solution**: Always wrap SMS calls in `.catch()` and log errors
- **Pattern**:
  ```typescript
  await this.smsService.sendSms(...).catch(err => {
    console.error('SMS failed:', err);
    // Don't throw - operation succeeded
  });
  ```

### 5. **Flexible Schema for Users and Customers**
- **Design**: SmsMessage and SmsPreference support both `customerId` and `userId`
- **Benefit**: Single system handles customer and staff/admin SMS
- **Pattern**: Check if `customerId` or `userId` is provided, apply appropriate preferences

---

## Future Enhancements

### Phase 4 (Pending)
- [ ] Manual EOD summary trigger
- [ ] SMS opt-in during customer registration
- [ ] Two-way SMS (reply handling)
- [ ] Message templates management UI
- [ ] Advanced analytics dashboard
- [ ] Cost alerting (budget limits)
- [ ] Promotional campaign management
- [ ] A/B testing for message templates
- [ ] SMS scheduling (send at specific time)
- [ ] Bulk SMS sending

---

## Related Documentation

- [SMS Integration Plan](.claude/docs/sms-integration-plan.md) - Full implementation plan
- [Telnyx Setup Guide](.claude/docs/telnyx-setup-guide.md) - Step-by-step Telnyx configuration
- [API Documentation](.claude/docs/api-documentation.md) - REST API reference
- [Development Guidelines](.claude/docs/development-guidelines.md) - Code standards

---

**Last Updated**: October 23, 2025
**Agent Version**: 1.0
**Status**: Active
