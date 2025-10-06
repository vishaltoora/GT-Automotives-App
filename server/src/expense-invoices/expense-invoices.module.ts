import { Module } from '@nestjs/common';
import { ExpenseInvoicesController } from './expense-invoices.controller';
import { ExpenseInvoicesService } from './expense-invoices.service';
import { ExpenseInvoiceRepository } from './expense-invoice.repository';

@Module({
  controllers: [ExpenseInvoicesController],
  providers: [ExpenseInvoicesService, ExpenseInvoiceRepository],
  exports: [ExpenseInvoicesService],
})
export class ExpenseInvoicesModule {}
