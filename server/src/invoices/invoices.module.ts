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
import { CarfaxModule } from '../carfax/carfax.module';
import { AzureBlobService } from '../common/services/azure-blob.service';

@Module({
  imports: [PdfModule, EmailModule, CarfaxModule],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoiceRepository,
    AuditRepository,
    CustomerRepository,
    ServiceRepository,
    PrismaService,
    AzureBlobService,
  ],
  exports: [InvoicesService, InvoiceRepository],
})
export class InvoicesModule {}
