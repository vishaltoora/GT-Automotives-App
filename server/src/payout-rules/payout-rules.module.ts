import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { PayoutRulesController } from './payout-rules.controller';
import { PayoutRulesService } from './payout-rules.service';

@Module({
  controllers: [PayoutRulesController],
  providers: [PayoutRulesService, PrismaService],
  exports: [PayoutRulesService],
})
export class PayoutRulesModule {}
