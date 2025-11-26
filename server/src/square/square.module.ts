import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SquarePaymentService } from './square-payment.service';
import { SquarePaymentController } from './square-payment.controller';
import { SquareWebhookController } from './square-webhook.controller';
import { SquareWebhookService } from './square-webhook.service';
import { SquarePaymentRepository } from './repositories/square-payment.repository';
import { PrismaService } from '@gt-automotive/database';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [ConfigModule, AppointmentsModule],
  controllers: [SquarePaymentController, SquareWebhookController],
  providers: [SquarePaymentService, SquareWebhookService, SquarePaymentRepository, PrismaService],
  exports: [SquarePaymentService, SquareWebhookService],
})
export class SquareModule {}
