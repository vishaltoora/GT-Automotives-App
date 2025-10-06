import { Module } from '@nestjs/common';
import { PurchaseInvoicesController } from './purchase-invoices.controller';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { PurchaseInvoiceRepository } from './purchase-invoice.repository';

@Module({
  controllers: [PurchaseInvoicesController],
  providers: [PurchaseInvoicesService, PurchaseInvoiceRepository],
  exports: [PurchaseInvoicesService],
})
export class PurchaseInvoicesModule {}
