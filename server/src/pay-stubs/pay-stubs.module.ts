import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PdfModule } from '../pdf/pdf.module';
import { PayStubsController } from './pay-stubs.controller';
import { PayStubsService } from './pay-stubs.service';

@Module({
  imports: [PdfModule],
  controllers: [PayStubsController],
  providers: [PayStubsService, PrismaService, AuditRepository],
  exports: [PayStubsService],
})
export class PayStubsModule {}
