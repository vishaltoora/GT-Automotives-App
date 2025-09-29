import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentRepository } from './repositories/payment.repository';
import { JobRepository } from '../jobs/repositories/job.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    JobRepository,
    AuditRepository,
    PrismaService,
  ],
  exports: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}