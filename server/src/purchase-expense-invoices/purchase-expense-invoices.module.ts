import { Module } from '@nestjs/common';
import { PurchaseExpenseInvoicesController } from './purchase-expense-invoices.controller';
import { PurchaseExpenseInvoicesService } from './purchase-expense-invoices.service';
import { PurchaseExpenseInvoiceRepository } from './purchase-expense-invoice.repository';

@Module({
  controllers: [PurchaseExpenseInvoicesController],
  providers: [PurchaseExpenseInvoicesService, PurchaseExpenseInvoiceRepository],
  exports: [PurchaseExpenseInvoicesService],
})
export class PurchaseExpenseInvoicesModule {}
