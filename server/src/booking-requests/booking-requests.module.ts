import { Module } from '@nestjs/common';
import { BookingRequestsController } from './booking-requests.controller';
import { BookingRequestsService } from './booking-requests.service';
import { PrismaService } from '@gt-automotive/database';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [BookingRequestsController],
  providers: [BookingRequestsService, PrismaService],
  exports: [BookingRequestsService],
})
export class BookingRequestsModule {}
