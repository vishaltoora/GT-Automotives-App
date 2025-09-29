import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobRepository } from './repositories/job.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    JobRepository,
    AuditRepository,
    PrismaService,
  ],
  exports: [JobsService, JobRepository],
})
export class JobsModule {}