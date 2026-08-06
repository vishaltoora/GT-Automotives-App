import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PdfModule } from '../pdf/pdf.module';
import { TimeClockModule } from '../time-clock/time-clock.module';
import { PayStubsController } from './pay-stubs.controller';
import { PayStubsService } from './pay-stubs.service';

@Module({
  // Raising a stub processes the hours it pays for, which is the time clock's
  // job — reused rather than reimplemented so there is one way hours become
  // paid.
  imports: [PdfModule, TimeClockModule],
  controllers: [PayStubsController],
  providers: [PayStubsService, PrismaService, AuditRepository],
  exports: [PayStubsService],
})
export class PayStubsModule {}
