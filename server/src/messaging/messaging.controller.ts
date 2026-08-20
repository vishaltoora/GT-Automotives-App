import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateMessageDto,
  MentionSearchDto,
  PollQueryDto,
  UpdateMessageDto,
} from '@gt-automotive/data';
// Type-only: these appear in decorated signatures, which emitDecoratorMetadata
// cannot resolve from a value import under isolatedModules.
import type { ConversationEntity } from '@gt-automotive/data';
import { MessagingService } from './messaging.service';
import type { MessagingUser } from './repositories/message.repository';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

/**
 * Internal messaging. Customers are not on this controller by design — they
 * have no Clerk login in this system, and nothing here is ever shown on a
 * document that reaches them.
 */
@Controller('messaging')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN', 'SUPERVISOR', 'FOREMAN', 'ACCOUNTANT', 'STAFF')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  /** The single poll: new messages for the open thread, plus every badge. */
  /**
   * `waitMs` opts into long polling: the request is held open until a message
   * arrives or the wait elapses. Omitted or zero returns immediately, so an
   * older client keeps working unchanged.
   */
  @Get('poll')
  poll(@CurrentUser() user: MessagingUser, @Query() query: PollQueryDto) {
    return this.messaging.poll(
      user,
      query.conversationId,
      query.since,
      query.waitMs ? Number(query.waitMs) : 0
    );
  }

  @Get('conversations/general')
  general(@CurrentUser() user: MessagingUser) {
    return this.messaging.getGeneralConversation(user.id);
  }

  @Get('entity/:entityType/:entityId')
  entityThread(
    @CurrentUser() user: MessagingUser,
    @Param('entityType') entityType: ConversationEntity,
    @Param('entityId') entityId: string
  ) {
    return this.messaging.getEntityConversation(entityType, entityId, user.id);
  }

  @Post('conversations/:id/messages')
  send(
    @CurrentUser() user: MessagingUser,
    @Param('id') conversationId: string,
    @Body() dto: CreateMessageDto
  ) {
    return this.messaging.createMessage(conversationId, user, dto);
  }

  @Post('conversations/:id/read')
  markRead(
    @CurrentUser() user: MessagingUser,
    @Param('id') conversationId: string
  ) {
    return this.messaging.markConversationRead(conversationId, user.id);
  }

  @Patch('messages/:id')
  edit(
    @CurrentUser() user: MessagingUser,
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto
  ) {
    return this.messaging.updateMessage(id, user, dto.body);
  }

  @Delete('messages/:id')
  remove(@CurrentUser() user: MessagingUser, @Param('id') id: string) {
    return this.messaging.deleteMessage(id, user);
  }

  @Get('mentions')
  mentions(
    @CurrentUser() user: MessagingUser,
    @Query('unread') unread?: string
  ) {
    return this.messaging.getMentionInbox(user, unread === 'true');
  }

  @Post('mentions/:id/read')
  markMentionRead(@CurrentUser() user: MessagingUser, @Param('id') id: string) {
    return this.messaging.markMentionRead(id, user.id);
  }

  @Get('mentionable-users')
  mentionableUsers(@Query() query: MentionSearchDto) {
    return this.messaging.findMentionableUsers(query.q);
  }

  @Get('referenceable-ros')
  referenceableRepairOrders(@Query() query: MentionSearchDto) {
    return this.messaging.findReferenceableRepairOrders(query.q);
  }
}
