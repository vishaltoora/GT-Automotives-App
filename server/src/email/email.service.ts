import { Injectable, Logger } from '@nestjs/common';
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
import { PrismaService } from '@gt-automotive/database';
import { EmailStatus, EmailType } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstance!: TransactionalEmailsApi;
  private readonly enabled: boolean;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly prisma: PrismaService) {
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'gt-automotives@outlook.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'GT Automotives';

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
}
