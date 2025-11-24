import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SquarePaymentService } from './square-payment.service';
import { SquarePaymentController } from './square-payment.controller';
import { SquarePaymentRepository } from './repositories/square-payment.repository';
import { PrismaService } from '@gt-automotive/database';

@Module({
  imports: [ConfigModule],
  controllers: [SquarePaymentController],
  providers: [SquarePaymentService, SquarePaymentRepository, PrismaService],
  exports: [SquarePaymentService],
})
export class SquareModule {}
