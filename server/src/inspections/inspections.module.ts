import { Module } from '@nestjs/common';
import { DatabaseModule } from '@gt-automotive/database';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { InvoicesModule } from '../invoices/invoices.module';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [DatabaseModule, InvoicesModule, PdfModule, EmailModule],
  controllers: [InspectionsController],
  providers: [InspectionsService, AuditRepository],
  exports: [InspectionsService],
})
export class InspectionsModule {}
