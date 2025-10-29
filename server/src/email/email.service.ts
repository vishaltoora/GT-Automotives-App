import { Injectable, Logger } from '@nestjs/common';
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
import { PrismaService } from '@gt-automotive/database';
import { EmailStatus, EmailType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstance!: TransactionalEmailsApi;
  private readonly enabled: boolean;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly logoBase64: string;

  constructor(private readonly prisma: PrismaService) {
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'gt-automotives@outlook.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'GT Automotives';

    // Load logo as base64 for email embedding
    try {
      const logoPath = path.join(process.cwd(), 'apps', 'webApp', 'public', 'logo-email.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        this.logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        this.logger.log(`✅ Logo loaded for email embedding (${logoBuffer.length} bytes, base64: ${this.logoBase64.length} chars)`);
        this.logger.log(`📸 Logo preview: ${this.logoBase64.substring(0, 100)}...`);
      } else {
        // Fallback: use production URL
        this.logoBase64 = '';
        this.logger.warn('⚠️  Logo file not found, will use production URL');
      }
    } catch (error) {
      this.logoBase64 = '';
      this.logger.warn('⚠️  Failed to load logo, will use production URL');
    }

    if (this.enabled) {
      try {
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
          this.logger.error('BREVO_API_KEY is not set - Email will be disabled');
          (this as any).enabled = false;
          return;
        }

        // Initialize Brevo API (correct pattern from SDK docs)
        const emailAPI = new TransactionalEmailsApi();
        // Set API key (accessing protected property via type assertion)
        (emailAPI as any).authentications.apiKey.apiKey = apiKey;
        (this as any).apiInstance = emailAPI;

        this.logger.log('✅ Email Service initialized with Brevo');
        this.logger.log(`📧 Sender: ${this.senderName} <${this.senderEmail}>`);
      } catch (error) {
        this.logger.error('Failed to initialize Brevo SDK - Email will be disabled:', error);
        (this as any).enabled = false;
      }
    } else {
      this.logger.warn('⚠️ Email Service is disabled (EMAIL_ENABLED is not true)');
    }
  }

  /**
   * Get logo src for email templates
   * Uses base64 embedding for maximum compatibility
   */
  private getLogoSrc(): string {
    // Return base64 embedded logo if available, otherwise fallback to production URL
    // Note: Base64 images work in most email clients and don't require external hosting
    return this.logoBase64 || 'https://gt-automotives.com/gt-favicon.svg';
  }

  /**
   * Send an email via Brevo
   */
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
    this.logger.log(`[EMAIL] sendEmail called - enabled: ${this.enabled}, to: ${params.to}, type: ${params.type}`);

    if (!this.enabled) {
      this.logger.warn('[EMAIL] Email Service is DISABLED. Set EMAIL_ENABLED=true to enable.');
      this.logger.warn('[EMAIL] Would send:', { to: params.to, subject: params.subject, type: params.type });
      return { success: false, error: 'Email service is disabled' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.to)) {
      this.logger.error(`Invalid email format: ${params.to}`);
      return { success: false, error: 'Invalid email format' };
    }

    // Create email log in database
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
      // Prepare email data for Brevo
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.sender = { email: this.senderEmail, name: this.senderName };
      sendSmtpEmail.to = [{ email: params.to }];
      sendSmtpEmail.subject = params.subject;
      sendSmtpEmail.htmlContent = params.htmlContent;

      if (params.attachments && params.attachments.length > 0) {
        sendSmtpEmail.attachment = params.attachments;
      }

      // Send email via Brevo API
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      // Extract message ID from response body
      const messageId = response.body?.messageId || 'unknown';

      // Update email log with success
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
          brevoMessageId: messageId,
          sentAt: new Date(),
        },
      });

      this.logger.log(`✅ Email sent successfully: ${messageId}`);
      return { success: true, messageId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`❌ Failed to send email: ${errorMessage}`, errorStack);

      // Update email log with failure
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a simple test email
   */
  async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const logoSrc = this.getLogoSrc();
    this.logger.log(`📧 Sending test email with logo src length: ${logoSrc.length} chars`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <!-- Header -->
        <div style="background-color: #1976d2; padding: 20px; text-align: center;">
          <img src="${logoSrc}" alt="GT Automotives Logo" style="max-width: 180px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />
          <h1 style="color: white; margin: 0;">GT Automotives</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>Congratulations! Your email integration with Brevo is working correctly.</p>
          <p>This test email confirms that GT Automotives can now send:</p>
          <ul>
            <li>✅ Appointment confirmations</li>
            <li>✅ Invoice delivery</li>
            <li>✅ Quotation emails</li>
            <li>✅ Payment receipts</li>
            <li>✅ Service completion notices</li>
          </ul>
          <p><strong>Email Service Status:</strong> Operational ✅</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>GT Automotives - Prince George, BC</p>
          <p>Phone: (250) 986-9191</p>
          <p>Email: gt-automotives@outlook.com</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: 'Test Email - GT Automotives Email Service',
      htmlContent,
      type: EmailType.PROMOTIONAL,
    });
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    this.logger.log(`[EMAIL] sendAppointmentConfirmation called for appointment: ${appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
        employees: { include: { employee: true } },
      },
    });

    if (!appointment) {
      this.logger.warn(`[EMAIL] Appointment ${appointmentId} not found`);
      return;
    }

    if (!appointment.customer.email) {
      this.logger.warn(`[EMAIL] Customer ${appointment.customer.id} has no email address. Skipping email.`);
      return;
    }

    const employeeNames = appointment.employees
      .map(ae => `${ae.employee.firstName} ${ae.employee.lastName}`)
      .join(', ') || 'TBD';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <!-- Header -->
        <div style="background-color: #1976d2; padding: 20px; text-align: center;">
          <img src="${this.getLogoSrc()}" alt="GT Automotives" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0;">GT Automotives</h1>
        </div>

        <!-- Content -->
        <div style="padding: 30px; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Confirmed ✓</h2>
          <p>Hi ${appointment.customer.firstName},</p>
          <p>Your appointment has been confirmed!</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Service:</strong> ${appointment.serviceType}</p>
            <p><strong>Date:</strong> ${new Date(appointment.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${appointment.scheduledTime}</p>
            ${appointment.vehicle ? `<p><strong>Vehicle:</strong> ${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}</p>` : ''}
            <p><strong>Technician(s):</strong> ${employeeNames}</p>
            <p><strong>Location:</strong> ${appointment.appointmentType === 'AT_GARAGE' ? 'GT Automotives Shop' : 'Mobile Service'}</p>
          </div>

          ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}

          <p>Need to reschedule? Call us at <strong>(250) 986-9191</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>GT Automotives - Prince George, BC</p>
          <p>Phone: (250) 986-9191</p>
          <p>Email: gt-automotives@outlook.com</p>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: appointment.customer.email,
      subject: `Appointment Confirmed - ${appointment.serviceType}`,
      htmlContent,
      type: EmailType.APPOINTMENT_CONFIRMATION,
      appointmentId: appointment.id,
      customerId: appointment.customer.id,
    });
  }

  /**
   * Send End of Day summary email to admin users
   */
  async sendEODSummary(data: {
    date: string;
    totalPayments: number;
    totalOwed: number;
    paymentsByMethod: Record<string, number>;
    atGaragePayments: number;
    atGarageCount: number;
    atGaragePaymentsByMethod: Record<string, number>;
    mobileServicePayments: number;
    mobileServiceCount: number;
    mobileServicePaymentsByMethod: Record<string, number>;
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    this.logger.log('[EMAIL] sendEODSummary called');

    // Get all admin users with email addresses
    const allAdminUsers = await this.prisma.user.findMany({
      where: {
        role: {
          name: 'ADMIN',
        },
      },
      include: {
        role: true,
      },
    });

    // Filter for users with email addresses
    const adminUsers = allAdminUsers.filter(user => user.email != null && user.email !== '');

    if (adminUsers.length === 0) {
      this.logger.warn('[EMAIL] No admin users with email addresses found');
      return { success: false, sent: 0, failed: 0 };
    }

    // Format payment methods
    const formatPaymentMethods = (methods: Record<string, number>): string => {
      return Object.entries(methods)
        .map(([method, amount]) => `<li><strong>${method}</strong>: $${amount.toFixed(2)}</li>`)
        .join('');
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <!-- Header -->
        <div style="background-color: #1976d2; padding: 20px; text-align: center;">
          <img src="${this.getLogoSrc()}" alt="GT Automotives" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0;">GT Automotives</h1>
          <p style="color: white; margin: 5px 0 0 0;">End of Day Summary</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; max-width: 800px; margin: 0 auto; background-color: white;">
          <h2 style="color: #1976d2;">📊 Daily Summary - ${data.date}</h2>

          <!-- Overall Stats -->
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">💰 Overall Financial Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Total Payments Collected:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #4caf50; font-size: 18px; font-weight: bold;">$${data.totalPayments.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Total Amount Owed:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #f44336; font-size: 18px; font-weight: bold;">$${data.totalOwed.toFixed(2)}</td>
              </tr>
            </table>

            <h4 style="margin-top: 20px; margin-bottom: 10px;">Payment Breakdown:</h4>
            <ul style="list-style: none; padding: 0;">
              ${formatPaymentMethods(data.paymentsByMethod)}
            </ul>
          </div>

          <!-- At Garage Stats -->
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ff9800;">🏪 At Garage Services</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Completed Jobs:</strong></td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.atGarageCount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Total Collected:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #4caf50; font-weight: bold;">$${data.atGaragePayments.toFixed(2)}</td>
              </tr>
            </table>

            ${Object.keys(data.atGaragePaymentsByMethod).length > 0 ? `
              <h4 style="margin-top: 20px; margin-bottom: 10px;">Payment Methods:</h4>
              <ul style="list-style: none; padding: 0;">
                ${formatPaymentMethods(data.atGaragePaymentsByMethod)}
              </ul>
            ` : '<p style="color: #666; margin-top: 10px;">No payments collected</p>'}
          </div>

          <!-- Mobile Service Stats -->
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4caf50;">🚗 Mobile Services</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Completed Jobs:</strong></td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.mobileServiceCount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Total Collected:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #4caf50; font-weight: bold;">$${data.mobileServicePayments.toFixed(2)}</td>
              </tr>
            </table>

            ${Object.keys(data.mobileServicePaymentsByMethod).length > 0 ? `
              <h4 style="margin-top: 20px; margin-bottom: 10px;">Payment Methods:</h4>
              <ul style="list-style: none; padding: 0;">
                ${formatPaymentMethods(data.mobileServicePaymentsByMethod)}
              </ul>
            ` : '<p style="color: #666; margin-top: 10px;">No payments collected</p>'}
          </div>

          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #1976d2;">
            <p style="margin: 0; color: #666;">
              <strong>Note:</strong> This is an automated End of Day summary generated from GT Automotives management system.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>GT Automotives - Prince George, BC</p>
          <p>Phone: (250) 986-9191</p>
          <p>Email: gt-automotives@outlook.com</p>
        </div>
      </body>
      </html>
    `;

    let sent = 0;
    let failed = 0;

    // Send email to each admin user
    for (const admin of adminUsers) {
      if (!admin.email) continue;

      try {
        const result = await this.sendEmail({
          to: admin.email,
          subject: `EOD Summary - ${data.date} - GT Automotives`,
          htmlContent,
          type: EmailType.PROMOTIONAL, // Using PROMOTIONAL for now, could add ADMIN_EOD_SUMMARY type
        });

        if (result.success) {
          sent++;
          this.logger.log(`✅ EOD summary sent to ${admin.email}`);
        } else {
          failed++;
          this.logger.error(`❌ Failed to send EOD summary to ${admin.email}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        this.logger.error(`❌ Error sending EOD summary to ${admin.email}:`, error);
      }
    }

    this.logger.log(`[EMAIL] EOD Summary complete: ${sent} sent, ${failed} failed`);
    return { success: sent > 0, sent, failed };
  }

  /**
   * Send employee day schedule email
   */
  async sendEmployeeDaySchedule(data: {
    employeeEmail: string;
    employeeName: string;
    date: string;
    appointments: Array<{
      time: string;
      customerName: string;
      serviceType: string;
      vehicleInfo: string;
      location: string;
      duration: number;
      notes?: string;
    }>;
  }): Promise<{ success: boolean; messageId?: string }> {
    this.logger.log(`[EMAIL] Sending employee day schedule to ${data.employeeEmail}`);

    if (!this.enabled) {
      this.logger.warn('[EMAIL] Email service is disabled');
      return { success: false };
    }

    if (!data.employeeEmail || !data.employeeName) {
      this.logger.warn('[EMAIL] Missing employee email or name');
      return { success: false };
    }

    try {
      // Format date nicely
      const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Build appointments table rows
      const appointmentsHtml = data.appointments.length > 0
        ? data.appointments
            .map(
              (apt, index) => `
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 15px 10px; font-weight: 500; color: #1976d2;">${apt.time}</td>
            <td style="padding: 15px 10px;">
              <div style="font-weight: 500; margin-bottom: 4px;">${apt.customerName}</div>
              <div style="color: #666; font-size: 14px;">${apt.vehicleInfo}</div>
            </td>
            <td style="padding: 15px 10px;">
              <div style="margin-bottom: 4px;">${apt.serviceType}</div>
              <div style="color: #666; font-size: 14px;">${apt.duration} min</div>
            </td>
            <td style="padding: 15px 10px;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; ${
                apt.location === 'At Garage'
                  ? 'background-color: #e3f2fd; color: #1976d2;'
                  : 'background-color: #fff3e0; color: #f57c00;'
              }">
                ${apt.location === 'At Garage' ? '🏢 At Garage' : '🚗 Mobile Service'}
              </span>
            </td>
          </tr>
          ${
            apt.notes
              ? `<tr style="border-bottom: 1px solid #e0e0e0;">
            <td colspan="4" style="padding: 10px; background-color: #fffde7; font-size: 14px;">
              <strong>Notes:</strong> ${apt.notes}
            </td>
          </tr>`
              : ''
          }
        `
            )
            .join('')
        : `
          <tr>
            <td colspan="4" style="padding: 30px; text-align: center; color: #999;">
              No appointments scheduled for this day
            </td>
          </tr>
        `;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Schedule for ${formattedDate}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <!-- Email Container -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <!-- Main Content -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 30px 40px; text-align: center;">
                      <img src="${this.getLogoSrc()}" alt="GT Automotives" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">GT Automotives</h1>
                      <p style="margin: 10px 0 0 0; color: #e3f2fd; font-size: 16px;">Your Daily Schedule</p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 30px 40px 20px 40px;">
                      <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px; font-weight: 500;">
                        Hello ${data.employeeName},
                      </h2>
                      <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                        Here's your schedule for <strong style="color: #1976d2;">${formattedDate}</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Summary Badge -->
                  ${
                    data.appointments.length > 0
                      ? `
                  <tr>
                    <td style="padding: 0 40px 20px 40px;">
                      <div style="background-color: #e3f2fd; border-left: 4px solid #1976d2; padding: 15px 20px; border-radius: 4px;">
                        <p style="margin: 0; color: #1565c0; font-size: 16px;">
                          <strong>${data.appointments.length} Appointment${data.appointments.length !== 1 ? 's' : ''}</strong> scheduled for today
                        </p>
                      </div>
                    </td>
                  </tr>
                  `
                      : ''
                  }

                  <!-- Appointments Table -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f5f5f5;">
                            <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #666; font-size: 14px; text-transform: uppercase;">Time</th>
                            <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #666; font-size: 14px; text-transform: uppercase;">Customer</th>
                            <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #666; font-size: 14px; text-transform: uppercase;">Service</th>
                            <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #666; font-size: 14px; text-transform: uppercase;">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${appointmentsHtml}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <!-- Tips Section -->
                  ${
                    data.appointments.length > 0
                      ? `
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #f9fbe7; border: 1px solid #f0f4c3; border-radius: 4px; padding: 20px;">
                        <h3 style="margin: 0 0 10px 0; color: #827717; font-size: 16px; font-weight: 600;">📋 Daily Reminders</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                          <li>Review appointment notes before starting each job</li>
                          <li>Confirm mobile service locations and contact customers if needed</li>
                          <li>Update job status in the system as you complete each appointment</li>
                          <li>Contact the shop if you need additional parts or support</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  `
                      : ''
                  }

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                        <strong>GT Automotives</strong>
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px;">
                        Prince George, BC | Phone: (250) 986-9191
                      </p>
                      <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                        Questions? Contact the shop or check your schedule in the staff dashboard
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const sendSmtpEmail: SendSmtpEmail = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: data.employeeEmail,
            name: data.employeeName,
          },
        ],
        subject: `Your Schedule for ${formattedDate}`,
        htmlContent,
      };

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = response.body?.messageId || 'unknown';

      this.logger.log(`[EMAIL] Employee schedule sent successfully. Message ID: ${messageId}`);

      // Log to database
      try {
        await this.prisma.emailLog.create({
          data: {
            to: data.employeeEmail,
            from: this.senderEmail,
            subject: `Your Schedule for ${formattedDate}`,
            type: 'APPOINTMENT_REMINDER',
            status: 'SENT',
            brevoMessageId: messageId,
            sentAt: new Date(),
          },
        });
      } catch (dbError) {
        this.logger.error('[EMAIL] Failed to log email to database:', dbError);
      }

      return { success: true, messageId };
    } catch (error) {
      this.logger.error('[EMAIL] Failed to send employee day schedule:', error);
      return { success: false };
    }
  }

  /**
   * Send appointment assignment notification to employee
   */
  async sendAppointmentAssignment(data: {
    employeeEmail: string;
    employeeName: string;
    appointmentId: string;
    customerName: string;
    customerPhone?: string;
    vehicleInfo: string;
    serviceType: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    appointmentType: 'AT_GARAGE' | 'MOBILE_SERVICE';
    address?: string;
    notes?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    this.logger.log(`[EMAIL] Sending appointment assignment to ${data.employeeEmail}`);

    if (!this.enabled) {
      this.logger.warn('[EMAIL] Email service is disabled');
      return { success: false };
    }

    if (!data.employeeEmail || !data.employeeName) {
      this.logger.warn('[EMAIL] Missing employee email or name');
      return { success: false };
    }

    try {
      // Format date nicely
      const appointmentDate = new Date(data.scheduledDate);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Calculate end time
      const [hours, minutes] = data.scheduledTime.split(':');
      const startTime = new Date();
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);
      const endTime = new Date(startTime.getTime() + data.duration * 60000);
      const endTimeStr = endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const isGarage = data.appointmentType === 'AT_GARAGE';
      const isMobile = data.appointmentType === 'MOBILE_SERVICE';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Appointment Assignment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <!-- Email Container -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <!-- Main Content -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${isGarage ? '#1976d2' : '#f57c00'} 0%, ${isGarage ? '#1565c0' : '#ef6c00'} 100%); padding: 30px 40px; text-align: center;">
                      <img src="${this.getLogoSrc()}" alt="GT Automotives" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔔 New Appointment</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">You've been assigned to a ${isMobile ? 'mobile service' : 'garage'} appointment</p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 30px 40px 20px 40px;">
                      <h2 style="margin: 0 0 10px 0; color: #333; font-size: 22px; font-weight: 500;">
                        Hi ${data.employeeName},
                      </h2>
                      <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">
                        You have been assigned to a new appointment. Please review the details below:
                      </p>
                    </td>
                  </tr>

                  <!-- Appointment Type Badge -->
                  <tr>
                    <td style="padding: 0 40px 20px 40px;">
                      <div style="display: inline-block; background-color: ${isGarage ? '#e3f2fd' : '#fff3e0'}; border-left: 4px solid ${isGarage ? '#1976d2' : '#f57c00'}; padding: 12px 20px; border-radius: 4px;">
                        <p style="margin: 0; color: ${isGarage ? '#1565c0' : '#e65100'}; font-size: 14px; font-weight: 600;">
                          ${isGarage ? '🏢 AT GARAGE APPOINTMENT' : '🚗 MOBILE SERVICE APPOINTMENT'}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Appointment Details -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

                        <!-- Date & Time -->
                        <tr style="background-color: #f5f5f5;">
                          <td colspan="2" style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                            <div style="display: flex; align-items: center;">
                              <span style="font-size: 24px; margin-right: 12px;">📅</span>
                              <div>
                                <div style="font-weight: 600; color: #333; font-size: 18px; margin-bottom: 4px;">${formattedDate}</div>
                                <div style="color: #1976d2; font-size: 16px; font-weight: 500;">${data.scheduledTime} - ${endTimeStr} (${data.duration} minutes)</div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <!-- Customer Info -->
                        <tr>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #666; width: 140px;">Customer</td>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                            <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${data.customerName}</div>
                            ${data.customerPhone ? `<div style="color: #666; font-size: 14px;">📞 ${data.customerPhone}</div>` : ''}
                          </td>
                        </tr>

                        <!-- Vehicle Info -->
                        <tr>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #666;">Vehicle</td>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0; color: #333;">
                            🚗 ${data.vehicleInfo}
                          </td>
                        </tr>

                        <!-- Service Type -->
                        <tr>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #666;">Service</td>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                            <span style="display: inline-block; padding: 6px 12px; background-color: #e8f5e9; color: #2e7d32; border-radius: 4px; font-weight: 500; font-size: 14px;">
                              ${data.serviceType}
                            </span>
                          </td>
                        </tr>

                        <!-- Location -->
                        ${
                          isMobile && data.address
                            ? `
                        <tr>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #666;">Location</td>
                          <td style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
                            <div style="color: #333; margin-bottom: 4px;">📍 ${data.address}</div>
                            <a href="https://maps.google.com/?q=${encodeURIComponent(data.address)}" style="color: #1976d2; text-decoration: none; font-size: 14px;">
                              Open in Google Maps →
                            </a>
                          </td>
                        </tr>
                        `
                            : `
                        <tr>
                          <td style="padding: 15px 20px; font-weight: 600; color: #666;">Location</td>
                          <td style="padding: 15px 20px; color: #333;">
                            🏢 GT Automotives Shop - Prince George, BC
                          </td>
                        </tr>
                        `
                        }

                      </table>
                    </td>
                  </tr>

                  <!-- Notes Section -->
                  ${
                    data.notes
                      ? `
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #fffde7; border: 1px solid #fff9c4; border-radius: 8px; padding: 20px;">
                        <div style="display: flex; align-items: start;">
                          <span style="font-size: 20px; margin-right: 12px;">📝</span>
                          <div>
                            <h3 style="margin: 0 0 8px 0; color: #f57f17; font-size: 16px; font-weight: 600;">Special Notes</h3>
                            <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">${data.notes}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  `
                      : ''
                  }

                  <!-- Action Items -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px; font-weight: 600;">✓ What to do next:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                          <li>Review the appointment details above</li>
                          ${isMobile ? '<li>Verify the service location and plan your route</li>' : '<li>Prepare the necessary tools and parts</li>'}
                          ${data.customerPhone ? '<li>Contact the customer if you have any questions</li>' : ''}
                          <li>Update the job status in the system when you start and complete the work</li>
                          ${isMobile ? '<li>Ensure you have all mobile service equipment ready</li>' : '<li>Check the bay availability before the scheduled time</li>'}
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px; text-align: center;">
                      <a href="https://gt-automotives.com/staff/appointments" style="display: inline-block; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);">
                        View in Dashboard →
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                        <strong>GT Automotives</strong>
                      </p>
                      <p style="margin: 0; color: #999; font-size: 12px;">
                        Prince George, BC | Phone: (250) 986-9191
                      </p>
                      <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                        This is an automated notification. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const sendSmtpEmail: SendSmtpEmail = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: data.employeeEmail,
            name: data.employeeName,
          },
        ],
        subject: `🔔 New ${isMobile ? 'Mobile Service' : 'Garage'} Appointment - ${data.customerName} (${formattedDate})`,
        htmlContent,
      };

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = response.body?.messageId || 'unknown';

      this.logger.log(`[EMAIL] Appointment assignment sent successfully. Message ID: ${messageId}`);

      // Log to database
      try {
        await this.prisma.emailLog.create({
          data: {
            to: data.employeeEmail,
            from: this.senderEmail,
            subject: `New ${isMobile ? 'Mobile Service' : 'Garage'} Appointment - ${data.customerName}`,
            type: 'APPOINTMENT_CONFIRMATION',
            status: 'SENT',
            brevoMessageId: messageId,
            appointmentId: data.appointmentId,
            sentAt: new Date(),
          },
        });
      } catch (dbError) {
        this.logger.error('[EMAIL] Failed to log email to database:', dbError);
      }

      return { success: true, messageId };
    } catch (error) {
      this.logger.error('[EMAIL] Failed to send appointment assignment:', error);
      return { success: false };
    }
  }
}
