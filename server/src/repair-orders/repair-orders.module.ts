import { Module } from '@nestjs/common';
import { DatabaseModule } from '@gt-automotive/database';
import { CommonModule } from '../common/common.module';
import { RepairOrdersController } from './repair-orders.controller';
import { RepairOrdersService } from './repair-orders.service';
import { InspectionsModule } from '../inspections/inspections.module';
import { QuotationsModule } from '../quotations/quotations.module';

@Module({
  imports: [DatabaseModule, CommonModule, InspectionsModule, QuotationsModule],
  controllers: [RepairOrdersController],
  providers: [RepairOrdersService],
  exports: [RepairOrdersService],
})
export class RepairOrdersModule {}
