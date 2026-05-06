import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityController } from './availability.controller';
import { AppointmentsService } from './appointments.service';
import { AvailabilityService } from './availability.service';
import { AppointmentInvoiceService } from './appointment-invoice.service';
import { SmsModule } from '../sms/sms.module';
import { EmailModule } from '../email/email.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { JobsModule } from '../jobs/jobs.module';
import { PayoutRulesModule } from '../payout-rules/payout-rules.module';

@Module({
  imports: [SmsModule, EmailModule, InvoicesModule, JobsModule, PayoutRulesModule],
  controllers: [AppointmentsController, AvailabilityController],
  providers: [AppointmentsService, AvailabilityService, AppointmentInvoiceService, PrismaService],
  exports: [AppointmentsService, AvailabilityService, AppointmentInvoiceService],
})
export class AppointmentsModule {}
