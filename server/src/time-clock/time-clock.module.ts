import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { TimeClockController } from './time-clock.controller';
import { TimeClockService } from './time-clock.service';

@Module({
  controllers: [TimeClockController],
  providers: [TimeClockService, PrismaService, AuditRepository],
  exports: [TimeClockService],
})
export class TimeClockModule {}
