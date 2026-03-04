import { Module, forwardRef } from '@nestjs/common';
import { TireSalesController } from './tire-sales.controller';
import { TireSalesService } from './tire-sales.service';
import { TireSaleRepository } from './repositories/tire-sale.repository';
import { DatabaseModule } from '@gt-automotive/database';
import { CommonModule } from '../common/common.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { JobsModule } from '../jobs/jobs.module';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    forwardRef(() => InvoicesModule),
    forwardRef(() => JobsModule),
  ],
  controllers: [TireSalesController],
  providers: [TireSalesService, TireSaleRepository, AuditRepository],
  exports: [TireSalesService],
})
export class TireSalesModule {}
