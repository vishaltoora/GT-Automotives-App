import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ConversationEntity,
  ConversationType,
  MessageVisibility,
} from './prisma-enums';

export { ConversationEntity, ConversationType, MessageVisibility };

/** Longest message we accept. Generous for a shop note, short of an essay. */
export const MESSAGE_MAX_LENGTH = 4000;

/**
 * Sending a message.
 *
 * Deliberately carries no `visibility` and no mention list. Both are derived
 * on the server from `body`, because a client that could set either could
 * grant itself sight of someone else's private message.
 */
export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MESSAGE_MAX_LENGTH)
  body!: string;

  /** Reply target. The reply inherits this message's visibility. */
  @IsOptional()
  @IsString()
  parentMessageId?: string;
}

export class UpdateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MESSAGE_MAX_LENGTH)
  body!: string;
}

/** Query for the single poll endpoint. */
export class PollQueryDto {
  /** Thread currently open, if any. Counts come back either way. */
  @IsOptional()
  @IsString()
  conversationId?: string;

  /**
   * The previous response's `serverTime`, echoed back verbatim. Never a client
   * clock — skew against a UTC server would silently drop messages.
   */
  @IsOptional()
  @IsISO8601()
  since?: string;
}

export class MentionSearchDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class EntityThreadParamsDto {
  @IsEnum(ConversationEntity)
  entityType!: ConversationEntity;

  @IsString()
  entityId!: string;
}

// ---- Response shapes ----

export interface MessageAuthorDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface MessageMentionDto {
  userId: string;
  firstName: string | null;
  lastName: string | null;
}

export interface MessageReferenceDto {
  entityType: ConversationEntity;
  entityId: string;
  label: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  parentMessageId: string | null;
  body: string;
  visibility: MessageVisibility;
  author: MessageAuthorDto;
  mentions: MessageMentionDto[];
  references: MessageReferenceDto[];
  /** A real instant. Format for America/Vancouver on the client. */
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface ConversationDto {
  id: string;
  type: ConversationType;
  title: string | null;
  entityType: ConversationEntity | null;
  entityId: string | null;
  updatedAt: string;
  unreadCount: number;
}

export interface MentionInboxItemDto {
  mentionId: string;
  readAt: string | null;
  message: MessageDto;
  conversation: {
    id: string;
    entityType: ConversationEntity | null;
    entityId: string | null;
  };
}

/** One poll serves the open thread and every unread badge. */
export interface PollResponseDto {
  messages: MessageDto[];
  unreadMentions: number;
  conversationUnreads: Record<string, number>;
  /** Send this back as `since` on the next poll. */
  serverTime: string;
}

export interface MentionableUserDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  roleName: string;
}

export interface ReferenceableRODto {
  id: string;
  roNumber: string;
  status: string;
}
