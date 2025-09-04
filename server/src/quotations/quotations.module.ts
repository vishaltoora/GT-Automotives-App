import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { QuotationRepository } from './repositories/quotation.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  controllers: [QuotationsController],
  providers: [QuotationsService, QuotationRepository, PrismaService],
  exports: [QuotationsService],
})
export class QuotationsModule {}