import { Module } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AppointmentsController } from './appointments.controller';
import { AvailabilityController } from './availability.controller';
import { AppointmentsService } from './appointments.service';
import { AvailabilityService } from './availability.service';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [SmsModule],
  controllers: [AppointmentsController, AvailabilityController],
  providers: [AppointmentsService, AvailabilityService, PrismaService],
  exports: [AppointmentsService, AvailabilityService],
})
export class AppointmentsModule {}
