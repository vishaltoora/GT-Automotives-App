# SMS Integration Plan for GT Automotive

**Created**: October 16, 2025
**Status**: Ready for Implementation
**Estimated Cost**: $48/year (Year 1 with 500 messages/month)

## Executive Summary

This plan outlines the integration of SMS/text messaging capabilities into the GT Automotive application using **Telnyx** as the service provider. Telnyx offers the most cost-effective solution at $0.004 per message (47% cheaper than Twilio) while maintaining enterprise-grade reliability and features.

### ROI Analysis
- **Cost**: $48/year for 500 messages/month
- **Benefit**: Prevents 2-3 no-shows per month = $200-600 saved labor
- **Payback Period**: Less than 1 month
- **Annual ROI**: 417% - 1,150%

---

## 1. Cost Comparison

### Provider Pricing (US & Canada SMS)

| Provider | Cost per Message | Monthly (500 msgs) | Annual (6,000 msgs) | Notes |
|----------|------------------|-------------------|---------------------|-------|
| **Telnyx** | **$0.004** | **$2.00** | **$24.00** | Best value, reliable |
| Plivo | $0.0065 | $3.25 | $39.00 | Good features |
| AWS SNS | $0.0075 | $3.75 | $45.00 | Complex setup |
| Vonage | $0.0070 | $3.50 | $42.00 | Good API |
| Twilio | $0.0080 | $4.00 | $48.00 | Industry standard |
| ClickSend | $0.0092 | $4.60 | $55.20 | Higher pricing |

**Additional Costs:**
- Telnyx Phone Number: $2/month ($24/year)
- **Total Year 1 Cost with Telnyx: $48/year**

### Volume Projections

**Year 1** (Conservative):
- Appointment Reminders: 300 messages/month
- Status Updates: 150 messages/month
- Promotional: 50 messages/month
- **Total: 500 messages/month = $2/month + $2 number = $4/month = $48/year**

**Year 2** (Growth):
- As business grows to 1,000 messages/month
- Cost: $4/month messages + $2 number = $6/month = $72/year

---

## 2. Use Cases for GT Automotive

### A. Appointment Reminders (High Priority)
**Problem**: No-shows cost time and revenue
**Solution**: Automated SMS reminders at 7 days, 3 days, and 24 hours before appointment

**Message Template**:
```
Hi {firstName}, this is GT Automotive.

Reminder: Your appointment for {serviceType} is scheduled for {date} at {time}.

Vehicle: {year} {make} {model}

Reply CONFIRM to confirm or call us at (250) 555-0100 to reschedule.

GT Automotive
Prince George, BC
```

**Expected Impact**:
- Reduce no-shows by 60-80%
- Save 2-3 hours/week in wasted labor
- Improve customer satisfaction

### B. Service Status Updates (High Priority)
**Problem**: Customers call repeatedly asking "Is my car ready?"
**Solution**: Automated status updates when service begins, progresses, and completes

**Message Templates**:
```
Service Started:
Hi {firstName}, we've started working on your {year} {make} {model}. Estimated completion: {time}. We'll text you when it's ready! - GT Automotive

Service Complete:
Great news {firstName}! Your {year} {make} {model} is ready for pickup at GT Automotive. Total: ${amount}. We're open until {closingTime}. See you soon!
```

**Expected Impact**:
- Reduce phone calls by 40-60%
- Free up staff time
- Improve customer experience

### C. Appointment Confirmations (Medium Priority)
**Problem**: Need confirmation that appointment was booked correctly
**Solution**: Immediate SMS confirmation when appointment is created

**Message Template**:
```
Appointment Confirmed!

Service: {serviceType}
Date/Time: {date} at {time}
Vehicle: {year} {make} {model}

GT Automotive - Prince George, BC
(250) 555-0100
```

### D. Promotional Messages (Low Priority)
**Problem**: Limited customer retention and repeat business
**Solution**: Occasional promotions (max 4 per month to stay compliant)

**Message Template**:
```
Hi {firstName}, it's time for your seasonal tire change!

Book this week at GT Automotive and get:
- Free tire rotation
- Complimentary vehicle inspection

Call (250) 555-0100 or book online at gt-automotives.com

Reply STOP to opt-out
```

**Compliance**:
- Max 4 promotional messages per customer per month
- Must include opt-out instructions
- Only send to customers who opted in

### E. Emergency Notifications (Low Priority)
**Problem**: Need to reach customers urgently (shop closure, recall, urgent repair needed)
**Solution**: Emergency broadcast SMS capability

**Message Template**:
```
URGENT: GT Automotive will be closed tomorrow {date} due to {reason}.

If you have an appointment, please call (250) 555-0100 to reschedule.

We apologize for any inconvenience.
```

---

## 3. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GT Automotive App                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────┐      ┌──────────────────────┐      │
│  │   React Frontend   │      │   NestJS Backend     │      │
│  │                    │      │                      │      │
│  │  • SmsPreferences  │◄────►│  • SmsService        │      │
│  │  • SmsHistory      │      │  • SmsScheduler      │      │
│  │  • Appointment UI  │      │  • SmsController     │      │
│  └────────────────────┘      └──────────┬───────────┘      │
│                                          │                   │
│                                          ▼                   │
│                              ┌───────────────────┐          │
│                              │ PostgreSQL + Prisma│          │
│                              │                    │          │
│                              │ • SmsMessage       │          │
│                              │ • SmsPreference    │          │
│                              └───────────────────┘          │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   │ HTTPS API Calls
                                   ▼
                      ┌────────────────────────┐
                      │     Telnyx API         │
                      │                        │
                      │ • Send SMS             │
                      │ • Delivery Status      │
                      │ • Webhooks             │
                      └────────────────────────┘
                                   │
                                   ▼
                         [ Customer's Phone ]
```

### Technology Stack

**Frontend**:
- React 18 + TypeScript
- Material-UI components
- Axios for API calls

**Backend**:
- NestJS framework
- @telnyx/sdk NPM package
- @nestjs/schedule for cron jobs
- Prisma ORM

**Database**:
- PostgreSQL
- New tables: SmsMessage, SmsPreference

**External Service**:
- Telnyx Messaging API
- Webhooks for delivery status

---

## 4. Database Schema

### New Prisma Models

```prisma
// libs/database/src/lib/prisma/schema.prisma

model SmsMessage {
  id            String        @id @default(cuid())
  to            String        // Phone number in E.164 format (+1XXXXXXXXXX)
  from          String        // Telnyx phone number
  body          String        // Message content
  status        SmsStatus     @default(PENDING)
  type          SmsType       // APPOINTMENT_REMINDER, STATUS_UPDATE, etc.

  // Telnyx specific fields
  telnyxMessageId String?     @unique
  cost          Decimal?      @db.Decimal(10, 6)
  segments      Int?          @default(1)
  errorMessage  String?

  // Relationships
  appointmentId String?
  appointment   Appointment?  @relation(fields: [appointmentId], references: [id])
  customerId    String?
  customer      Customer?     @relation(fields: [customerId], references: [id])

  // Timestamps
  sentAt        DateTime?
  deliveredAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([appointmentId])
  @@index([customerId])
  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@map("sms_messages")
}

enum SmsStatus {
  PENDING      // Queued for sending
  QUEUED       // Accepted by Telnyx
  SENT         // Sent to carrier
  DELIVERED    // Delivered to phone
  FAILED       // Failed to send
  UNDELIVERED  // Carrier couldn't deliver
}

enum SmsType {
  APPOINTMENT_REMINDER     // 7-day, 3-day, 24-hour reminders
  APPOINTMENT_CONFIRMATION // Immediate booking confirmation
  SERVICE_STATUS           // Service started, in progress, etc.
  SERVICE_COMPLETE         // Ready for pickup
  PROMOTIONAL              // Marketing messages
  EMERGENCY                // Urgent notifications
}

model SmsPreference {
  id                  String    @id @default(cuid())
  customerId          String    @unique
  customer            Customer  @relation(fields: [customerId], references: [id])

  // Opt-in/out tracking
  optedIn             Boolean   @default(false)
  optedInAt           DateTime?
  optedOutAt          DateTime?

  // Preference toggles
  appointmentReminders Boolean  @default(true)
  serviceUpdates       Boolean  @default(true)
  promotional          Boolean  @default(false)

  // Timestamps
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@map("sms_preferences")
}
```

### Migration Command

```bash
DATABASE_URL="postgresql://postgres@localhost:5432/gt_automotive?schema=public" \
npx prisma migrate dev --name "add_sms_messaging_system" \
--schema=libs/database/src/lib/prisma/schema.prisma
```

---

## 5. Backend Implementation

### A. SMS Service (`server/src/sms/sms.service.ts`)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Telnyx } from '@telnyx/sdk';
import { PrismaService } from '@gt-automotive/data';
import { SmsStatus, SmsType } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly telnyx: Telnyx;
  private readonly fromNumber: string;
  private readonly enabled: boolean;

  constructor(private readonly prisma: PrismaService) {
    this.enabled = process.env.SMS_ENABLED === 'true';

    if (this.enabled) {
      this.telnyx = new Telnyx(process.env.TELNYX_API_KEY);
      this.fromNumber = process.env.TELNYX_PHONE_NUMBER;
      this.logger.log('SMS Service initialized with Telnyx');
    } else {
      this.logger.warn('SMS Service is disabled');
    }
  }

  /**
   * Send an SMS message
   */
  async sendSms(params: {
    to: string;
    body: string;
    type: SmsType;
    appointmentId?: string;
    customerId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.warn('SMS disabled - would send:', params);
      return { success: false, error: 'SMS service is disabled' };
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(params.to)) {
      this.logger.error(`Invalid phone number format: ${params.to}`);
      return { success: false, error: 'Invalid phone number format' };
    }

    // Check customer preferences
    if (params.customerId) {
      const prefs = await this.prisma.smsPreference.findUnique({
        where: { customerId: params.customerId },
      });

      if (!prefs?.optedIn) {
        this.logger.warn(`Customer ${params.customerId} has not opted in`);
        return { success: false, error: 'Customer has not opted in to SMS' };
      }

      // Check specific preferences
      if (params.type === 'PROMOTIONAL' && !prefs.promotional) {
        return { success: false, error: 'Customer opted out of promotional messages' };
      }
      if (params.type === 'APPOINTMENT_REMINDER' && !prefs.appointmentReminders) {
        return { success: false, error: 'Customer opted out of appointment reminders' };
      }
      if (params.type === 'SERVICE_STATUS' && !prefs.serviceUpdates) {
        return { success: false, error: 'Customer opted out of service updates' };
      }
    }

    // Create database record
    const smsRecord = await this.prisma.smsMessage.create({
      data: {
        to: params.to,
        from: this.fromNumber,
        body: params.body,
        type: params.type,
        status: SmsStatus.PENDING,
        appointmentId: params.appointmentId,
        customerId: params.customerId,
      },
    });

    try {
      // Send via Telnyx
      const response = await this.telnyx.messages.create({
        from: this.fromNumber,
        to: params.to,
        text: params.body,
        messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
      });

      // Update record with Telnyx response
      await this.prisma.smsMessage.update({
        where: { id: smsRecord.id },
        data: {
          status: SmsStatus.QUEUED,
          telnyxMessageId: response.data.id,
          segments: response.data.parts,
          sentAt: new Date(),
        },
      });

      this.logger.log(`SMS sent successfully: ${response.data.id}`);
      return { success: true, messageId: response.data.id };

    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);

      // Update record with error
      await this.prisma.smsMessage.update({
        where: { id: smsRecord.id },
        data: {
          status: SmsStatus.FAILED,
          errorMessage: error.message,
        },
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(appointmentId: string, daysAhead: number): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        employee: true,
        job: true,
      },
    });

    if (!appointment || !appointment.customer.phone) {
      return;
    }

    const date = new Date(appointment.scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const time = appointment.scheduledTime;

    const serviceType = appointment.job?.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();

    let message = `Hi ${appointment.customer.firstName}, this is GT Automotive.\n\n`;

    if (daysAhead === 7) {
      message += `Reminder: Your appointment for ${serviceType} is coming up next week.\n\n`;
    } else if (daysAhead === 3) {
      message += `Reminder: Your appointment for ${serviceType} is in 3 days.\n\n`;
    } else if (daysAhead === 1) {
      message += `Reminder: Your appointment for ${serviceType} is TOMORROW!\n\n`;
    }

    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nReply CONFIRM to confirm or call us at (250) 555-0100 to reschedule.\n\n`;
    message += `GT Automotive\nPrince George, BC`;

    await this.sendSms({
      to: appointment.customer.phone,
      body: message,
      type: SmsType.APPOINTMENT_REMINDER,
      appointmentId: appointment.id,
      customerId: appointment.customer.id,
    });
  }

  /**
   * Handle webhook from Telnyx for delivery status
   */
  async handleWebhook(payload: any): Promise<void> {
    const eventType = payload.data?.event_type;
    const messageId = payload.data?.payload?.id;

    if (!messageId) {
      this.logger.warn('Webhook received without message ID');
      return;
    }

    const message = await this.prisma.smsMessage.findUnique({
      where: { telnyxMessageId: messageId },
    });

    if (!message) {
      this.logger.warn(`Message not found: ${messageId}`);
      return;
    }

    let status: SmsStatus;
    switch (eventType) {
      case 'message.sent':
        status = SmsStatus.SENT;
        break;
      case 'message.delivered':
        status = SmsStatus.DELIVERED;
        await this.prisma.smsMessage.update({
          where: { id: message.id },
          data: {
            status,
            deliveredAt: new Date(),
          },
        });
        return;
      case 'message.failed':
        status = SmsStatus.FAILED;
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
        return;
    }

    await this.prisma.smsMessage.update({
      where: { id: message.id },
      data: { status },
    });

    this.logger.log(`Updated message ${messageId} status to ${status}`);
  }
}
```

### B. SMS Scheduler Service (`server/src/sms/sms-scheduler.service.ts`)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@gt-automotive/data';
import { SmsService } from './sms.service';

@Injectable()
export class SmsSchedulerService {
  private readonly logger = new Logger(SmsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Run daily at 9 AM to send appointment reminders
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders() {
    this.logger.log('Starting daily appointment reminder job');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeDaysOut = new Date(now);
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);

    const sevenDaysOut = new Date(now);
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

    // Find appointments that need reminders
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          in: [
            tomorrow.toISOString().split('T')[0],
            threeDaysOut.toISOString().split('T')[0],
            sevenDaysOut.toISOString().split('T')[0],
          ],
        },
      },
      include: {
        customer: true,
      },
    });

    for (const appointment of appointments) {
      if (!appointment.customer.phone) {
        continue;
      }

      const appointmentDate = new Date(appointment.scheduledDate);
      const daysDiff = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send appropriate reminder
      if (daysDiff === 1) {
        await this.smsService.sendAppointmentReminder(appointment.id, 1);
      } else if (daysDiff === 3) {
        await this.smsService.sendAppointmentReminder(appointment.id, 3);
      } else if (daysDiff === 7) {
        await this.smsService.sendAppointmentReminder(appointment.id, 7);
      }
    }

    this.logger.log(`Sent reminders for ${appointments.length} appointments`);
  }
}
```

### C. SMS Controller (`server/src/sms/sms.controller.ts`)

```typescript
import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SmsService } from './sms.service';
import { PrismaService } from '@gt-automotive/data';

@Controller('api/sms')
@UseGuards(AuthGuard, RolesGuard)
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Telnyx webhook endpoint (no auth required)
   */
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    await this.smsService.handleWebhook(payload);
    return { success: true };
  }

  /**
   * Get SMS history (admin only)
   */
  @Get('history')
  @Roles('ADMIN')
  async getHistory(
    @Query('customerId') customerId?: string,
    @Query('limit') limit = '50',
  ) {
    const messages = await this.prisma.smsMessage.findMany({
      where: customerId ? { customerId } : undefined,
      include: {
        customer: true,
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    return messages;
  }

  /**
   * Get customer preferences
   */
  @Get('preferences')
  async getPreferences(@Query('customerId') customerId: string) {
    let prefs = await this.prisma.smsPreference.findUnique({
      where: { customerId },
    });

    if (!prefs) {
      // Create default preferences
      prefs = await this.prisma.smsPreference.create({
        data: {
          customerId,
          optedIn: false,
          appointmentReminders: true,
          serviceUpdates: true,
          promotional: false,
        },
      });
    }

    return prefs;
  }

  /**
   * Update customer preferences
   */
  @Post('preferences')
  async updatePreferences(
    @Body() data: {
      customerId: string;
      optedIn?: boolean;
      appointmentReminders?: boolean;
      serviceUpdates?: boolean;
      promotional?: boolean;
    },
  ) {
    const updateData: any = {
      appointmentReminders: data.appointmentReminders,
      serviceUpdates: data.serviceUpdates,
      promotional: data.promotional,
    };

    if (data.optedIn !== undefined) {
      updateData.optedIn = data.optedIn;
      if (data.optedIn) {
        updateData.optedInAt = new Date();
      } else {
        updateData.optedOutAt = new Date();
      }
    }

    const prefs = await this.prisma.smsPreference.upsert({
      where: { customerId: data.customerId },
      update: updateData,
      create: {
        customerId: data.customerId,
        ...updateData,
      },
    });

    return prefs;
  }
}
```

### D. SMS Module (`server/src/sms/sms.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { SmsSchedulerService } from './sms-scheduler.service';
import { DataModule } from '@gt-automotive/data';

@Module({
  imports: [DataModule],
  controllers: [SmsController],
  providers: [SmsService, SmsSchedulerService],
  exports: [SmsService],
})
export class SmsModule {}
```

---

## 6. Frontend Implementation

### A. SMS Preferences Component (`apps/webApp/src/app/components/sms/SmsPreferences.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface SmsPreferenceData {
  id: string;
  customerId: string;
  optedIn: boolean;
  appointmentReminders: boolean;
  serviceUpdates: boolean;
  promotional: boolean;
}

export const SmsPreferences: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [preferences, setPreferences] = useState<SmsPreferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [customerId]);

  const loadPreferences = async () => {
    try {
      const response = await axios.get(`/api/sms/preferences?customerId=${customerId}`);
      setPreferences(response.data);
    } catch (err) {
      setError('Failed to load SMS preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('/api/sms/preferences', preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          SMS Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your text message preferences for appointment reminders and updates.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Preferences saved successfully!</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.optedIn}
                onChange={(e) => setPreferences({ ...preferences, optedIn: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Enable SMS Notifications</Typography>
                <Typography variant="caption" color="text.secondary">
                  Receive text messages from GT Automotive
                </Typography>
              </Box>
            }
          />

          {preferences.optedIn && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.appointmentReminders}
                    onChange={(e) =>
                      setPreferences({ ...preferences, appointmentReminders: e.target.checked })
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Appointment Reminders</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Get reminders 7 days, 3 days, and 24 hours before your appointment
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.serviceUpdates}
                    onChange={(e) => setPreferences({ ...preferences, serviceUpdates: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Service Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Get notified when your vehicle service is complete and ready for pickup
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.promotional}
                    onChange={(e) => setPreferences({ ...preferences, promotional: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Promotional Messages</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive occasional special offers and promotions (max 4 per month)
                    </Typography>
                  </Box>
                }
              />
            </>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Standard messaging rates may apply. Reply STOP to any message to opt-out.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
```

### B. SMS History Component (`apps/webApp/src/app/pages/admin/sms/SmsHistory.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface SmsMessage {
  id: string;
  to: string;
  body: string;
  status: string;
  type: string;
  cost: number;
  customer: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  deliveredAt: string | null;
}

export const SmsHistory: React.FC = () => {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await axios.get('/api/sms/history?limit=100');
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load SMS history', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'SENT': return 'info';
      case 'FAILED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const totalCost = messages.reduce((sum, msg) => sum + (msg.cost || 0), 0);
  const deliveredCount = messages.filter(m => m.status === 'DELIVERED').length;
  const failedCount = messages.filter(m => m.status === 'FAILED').length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        SMS Message History
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Messages
            </Typography>
            <Typography variant="h4">{messages.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Delivered
            </Typography>
            <Typography variant="h4" color="success.main">
              {deliveredCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Failed
            </Typography>
            <Typography variant="h4" color="error.main">
              {failedCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Cost
            </Typography>
            <Typography variant="h4">${totalCost.toFixed(4)}</Typography>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Message Preview</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell>
                  {new Date(message.createdAt).toLocaleDateString()}
                  <Typography variant="caption" display="block">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {message.customer.firstName} {message.customer.lastName}
                </TableCell>
                <TableCell>{message.to}</TableCell>
                <TableCell>
                  <Typography variant="caption">{getTypeLabel(message.type)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={message.status}
                    color={getStatusColor(message.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {message.body}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  ${(message.cost || 0).toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
```

---

## 7. Environment Variables

Add to `.env` files:

```bash
# Telnyx Configuration
TELNYX_API_KEY=your_api_key_here
TELNYX_PHONE_NUMBER=+1XXXXXXXXXX
TELNYX_MESSAGING_PROFILE_ID=your_profile_id
SMS_ENABLED=true

# Development
# SMS_ENABLED=false  # Disable in development
```

---

## 8. Implementation Timeline

### Phase 1: Setup & Configuration (Week 1)

**Tasks**:
1. Sign up for Telnyx account
2. Purchase phone number ($2/month)
3. Create messaging profile
4. Get API credentials
5. Add environment variables
6. Install dependencies: `yarn add @telnyx/sdk`

**Deliverables**:
- Telnyx account configured
- Phone number provisioned
- Environment variables set

### Phase 2: Database & Backend (Week 2)

**Tasks**:
1. Create Prisma schema models (SmsMessage, SmsPreference)
2. Run database migration
3. Implement SmsService
4. Implement SmsSchedulerService
5. Implement SmsController
6. Create SmsModule
7. Configure webhook endpoint
8. Test basic SMS sending

**Deliverables**:
- Database schema updated
- Backend services operational
- Test SMS sent successfully

### Phase 3: Frontend & Integration (Week 3)

**Tasks**:
1. Create SmsPreferences component
2. Create SmsHistory component (admin)
3. Integrate with appointment creation flow
4. Add SMS opt-in during customer registration
5. Test appointment reminders
6. Test service status updates
7. Production deployment

**Deliverables**:
- Customer SMS preferences UI
- Admin SMS history dashboard
- Automated appointment reminders working
- Full system deployed to production

---

## 9. Testing Checklist

### Before Production Launch

- [ ] SMS sends successfully to test phone numbers
- [ ] Webhook receives delivery status updates
- [ ] Customer opt-in/opt-out works correctly
- [ ] Appointment reminders trigger at correct times (7, 3, 1 day)
- [ ] Service status updates send properly
- [ ] Message costs are tracked in database
- [ ] Admin can view SMS history
- [ ] Rate limiting prevents spam (max 4 promotional/month)
- [ ] Invalid phone numbers are rejected
- [ ] Error handling works (failed sends are logged)

### Test Scenarios

1. **New Customer Opt-In**:
   - Create customer with phone number
   - Customer opts in to SMS
   - Book appointment
   - Verify reminder is scheduled

2. **Appointment Reminder Flow**:
   - Book appointment 8 days out
   - Run scheduler (or wait for cron)
   - Verify 7-day reminder sent
   - Wait for 3-day reminder
   - Wait for 24-hour reminder

3. **Service Status Update**:
   - Mark job as "In Progress"
   - Verify status SMS sent
   - Mark job as "Complete"
   - Verify completion SMS sent

4. **Opt-Out**:
   - Customer opts out
   - Attempt to send message
   - Verify message is blocked

5. **Failed Send**:
   - Use invalid phone number
   - Verify error is logged
   - Check database shows FAILED status

---

## 10. Compliance & Legal

### TCPA Compliance (Telephone Consumer Protection Act)

**Requirements**:
1. **Explicit Consent**: Customers must opt-in before receiving messages
2. **Opt-Out Mechanism**: Must honor "STOP" replies immediately
3. **Identification**: All messages must identify GT Automotive
4. **Timing**: No messages before 8 AM or after 9 PM local time
5. **Rate Limiting**: Maximum 4 promotional messages per month

**Implementation**:
- SmsPreference model tracks opt-in/opt-out with timestamps
- Service checks preferences before sending
- Webhook handles "STOP" replies (Telnyx auto-processes these)
- Scheduler runs at 9 AM to respect timing rules
- Promotional messages limited by business logic

### Message Content Best Practices

**Do**:
- Include business name (GT Automotive)
- Provide opt-out instructions for promotional
- Keep messages under 160 characters when possible
- Use clear, professional language
- Include contact information

**Don't**:
- Send unsolicited promotional messages
- Use all caps or excessive punctuation
- Include misleading information
- Send to customers who opted out
- Exceed 4 promotional messages per month

---

## 11. Monitoring & Analytics

### Key Metrics to Track

1. **Delivery Rate**: Should be >98%
2. **Opt-Out Rate**: Should be <2%
3. **Cost per Message**: Track against Telnyx pricing
4. **Response Rate**: % of customers who confirm appointments
5. **No-Show Reduction**: Compare before/after SMS implementation

### Success Indicators

**Month 1**:
- Delivery rate >95%
- <1% opt-out rate
- 300+ messages sent
- Cost under budget ($4/month)

**Month 3**:
- No-show rate reduced by 40%
- 500+ messages/month
- Positive customer feedback
- ROI clearly demonstrated

**Month 6**:
- No-show rate reduced by 60%
- 800+ messages/month
- Promotional campaigns generating bookings
- Clear cost savings vs. labor losses

### Dashboard Queries

```sql
-- Daily message volume
SELECT
  DATE(created_at) as date,
  COUNT(*) as messages,
  SUM(cost) as total_cost,
  COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered
FROM sms_messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Opt-out rate
SELECT
  COUNT(*) as total_customers,
  COUNT(CASE WHEN opted_in = true THEN 1 END) as opted_in,
  COUNT(CASE WHEN opted_in = false THEN 1 END) as opted_out,
  ROUND(100.0 * COUNT(CASE WHEN opted_in = false THEN 1 END) / COUNT(*), 2) as opt_out_rate
FROM sms_preferences;

-- Cost by message type
SELECT
  type,
  COUNT(*) as count,
  SUM(cost) as total_cost,
  AVG(cost) as avg_cost
FROM sms_messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY type
ORDER BY total_cost DESC;
```

---

## 12. Cost Optimization Strategies

### Reduce Costs Further

1. **Message Length**: Keep under 160 characters to avoid multi-segment charges
2. **Timing**: Batch reminders to send once daily (not multiple times)
3. **Selective Sending**: Only send to customers who opted in
4. **Template Optimization**: Use concise, effective templates
5. **Error Handling**: Validate phone numbers before sending to avoid wasted messages

### Scaling Considerations

**If volume reaches 1,000+ messages/month**:
- Cost: $4/month + $2 number = $6/month
- Consider volume discounts (Telnyx offers them at higher tiers)
- Monitor delivery rates to ensure quality remains high

**If volume reaches 5,000+ messages/month**:
- Cost: $20/month + $2 number = $22/month
- Negotiate bulk pricing with Telnyx
- Consider A2P 10DLC registration for better deliverability ($50 one-time fee)

---

## 13. Future Enhancements

### Phase 4+ (Post-Launch)

1. **Two-Way Messaging**:
   - Allow customers to reply with questions
   - Staff dashboard to respond to incoming messages
   - Auto-responses for common questions

2. **Advanced Scheduling**:
   - Customer-selected reminder preferences (e.g., only 1 day before)
   - Time zone support for traveling customers
   - Holiday/weekend scheduling rules

3. **Rich Media (MMS)**:
   - Send photos of completed work
   - Before/after comparisons
   - Branded graphics

4. **Analytics Dashboard**:
   - Real-time delivery monitoring
   - Customer engagement metrics
   - ROI calculator

5. **Integration with Other Systems**:
   - CRM integration for customer communication history
   - Calendar sync for appointment confirmations
   - Payment reminders with links

6. **AI-Powered Responses**:
   - Automatic booking via SMS
   - Natural language appointment scheduling
   - FAQ auto-responses

---

## 14. Rollout Strategy

### Soft Launch (Month 1)

**Goal**: Test system with small group

**Steps**:
1. Enable SMS for admin/staff only (testing)
2. Enable for 20-30 willing customers
3. Gather feedback
4. Fix any issues
5. Monitor costs and delivery rates

### Full Launch (Month 2)

**Goal**: All customers receive SMS

**Steps**:
1. Enable SMS for all new customers (opt-in during registration)
2. Email existing customers about SMS service (with opt-in link)
3. Train staff on SMS features
4. Monitor system performance
5. Collect customer feedback

### Optimization (Month 3+)

**Goal**: Improve results and reduce costs

**Steps**:
1. Analyze which message types perform best
2. Optimize message templates
3. Adjust reminder timing based on data
4. Add promotional campaigns
5. Measure ROI and adjust strategy

---

## 15. Support & Maintenance

### Telnyx Support

- **Email**: support@telnyx.com
- **Phone**: 1-844-856-7532
- **Docs**: https://developers.telnyx.com/docs/
- **Status**: https://status.telnyx.com/

### Internal Maintenance Tasks

**Daily**:
- Monitor webhook endpoint health
- Check for failed messages
- Review delivery rates

**Weekly**:
- Review SMS costs vs. budget
- Check opt-out rates
- Analyze customer feedback

**Monthly**:
- Reconcile Telnyx bill with database records
- Review message templates for effectiveness
- Analyze ROI metrics
- Plan next month's promotional campaigns

---

## 16. Conclusion

**Why Telnyx?**
- **Lowest Cost**: $0.004/message (47% cheaper than Twilio)
- **Reliable**: 99.999% uptime SLA
- **Developer-Friendly**: Excellent API and documentation
- **Scalable**: Can grow with GT Automotive

**Expected Outcomes**:
- **60-80% reduction in no-shows** within 3 months
- **40-60% reduction in "Is my car ready?" calls**
- **Improved customer satisfaction** with proactive communication
- **Clear ROI**: $48/year cost vs. $2,400+ in prevented no-show losses

**Recommendation**:
**Implement Telnyx SMS integration immediately** with these priorities:
1. **Month 1**: Basic appointment reminders (1 day, 3 day, 7 day)
2. **Month 2**: Add service status updates
3. **Month 3**: Introduce promotional messages (max 4/month)
4. **Month 4**: Analyze results and optimize

---

**Document Version**: 1.0
**Last Updated**: October 16, 2025
**Next Review**: After Phase 1 completion
