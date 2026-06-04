import { Module } from '@nestjs/common';
import { DatabaseModule } from '@gt-automotive/database';
import { CommonModule } from '../common/common.module';
import { RepairOrdersController } from './repair-orders.controller';
import { RepairOrdersService } from './repair-orders.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [RepairOrdersController],
  providers: [RepairOrdersService],
  exports: [RepairOrdersService],
})
export class RepairOrdersModule {}
