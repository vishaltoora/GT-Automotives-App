import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { QuotationRepository } from './repositories/quotation.repository';
import { PrismaService } from '@gt-automotive/database';
import { PdfModule } from '../pdf/pdf.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PdfModule, EmailModule],
  controllers: [QuotationsController],
  providers: [QuotationsService, QuotationRepository, PrismaService],
  exports: [QuotationsService],
})
export class QuotationsModule {}