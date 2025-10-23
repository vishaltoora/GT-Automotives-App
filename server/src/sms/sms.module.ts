import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '@gt-automotive/database';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { SmsSchedulerService } from './sms-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [SmsController],
  providers: [SmsService, SmsSchedulerService, PrismaService],
  exports: [SmsService],
})
export class SmsModule {}
