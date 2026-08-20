import { Module } from '@nestjs/common';
import { DatabaseModule } from '@gt-automotive/database';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessageRepository } from './repositories/message.repository';
import { MessagingPurgeService } from './messaging-purge.service';
import { MessageEventsService } from './message-events.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessageRepository,
    MessagingPurgeService,
    MessageEventsService,
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
