import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceRepository } from './repositories/invoice.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoiceRepository,
    AuditRepository,
    CustomerRepository,
    PrismaService,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule {}