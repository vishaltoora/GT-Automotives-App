import { Module } from '@nestjs/common';
import { DatabaseModule } from '@gt-automotive/database';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [MessagingController],
  providers: [MessagingService, MessageRepository],
  exports: [MessagingService],
})
export class MessagingModule {}
