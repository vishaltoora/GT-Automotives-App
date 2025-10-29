import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '@gt-automotive/database';

@Module({
  providers: [EmailService, PrismaService],
  exports: [EmailService],
})
export class EmailModule {}
