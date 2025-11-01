import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceRepository } from './repositories/invoice.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ServiceRepository } from './repositories/service.repository';
import { PrismaService } from '@gt-automotive/database';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PdfModule, EmailModule],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoiceRepository,
    AuditRepository,
    CustomerRepository,
    ServiceRepository,
    PrismaService,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}