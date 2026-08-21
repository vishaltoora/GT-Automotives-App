import {
  IsEnum,
  IsISO8601,
  IsNumberString,
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

/** Query for a page of messages older than the ones already on screen. */
export class OlderMessagesQueryDto {
  /**
   * `createdAt` of the oldest message the caller already holds.
   */
  @IsISO8601()
  before!: string;

  /**
   * Its id, which makes the cursor total.
   *
   * `createdAt` is millisecond precision, so two people sending inside the
   * same millisecond share one. Paging on the timestamp alone then excluded
   * whichever twin did not land on the boundary — from this page and from
   * every page after it.
   *
   * Optional because the frontend and the backend deploy separately: a tab
   * opened before the frontend caught up still sends the timestamp alone, and
   * a 400 in its face is a worse trade than the tie it cannot break.
   */
  @IsOptional()
  @IsString()
  beforeId?: string;
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

  /**
   * Opt into long polling: hold the request open this many milliseconds if
   * there is nothing new. Server-capped; omit or send 0 to return at once.
   */
  @IsOptional()
  @IsNumberString()
  waitMs?: string;
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
  /** Where this reader had got to when the thread opened. */
  lastReadAt?: string | null;
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
    /** Repair order number, so a mention read outside its thread says which job. */
    roNumber: string | null;
  };
}

/** One poll serves the open thread and every unread badge. */
export interface PollResponseDto {
  messages: MessageDto[];
  unreadMentions: number;
  conversationUnreads: Record<string, number>;
  /**
   * Whether the thread has messages older than the ones in `messages`.
   *
   * Present only on the first poll of a conversation, which is the one that
   * returns a window rather than everything since a cursor. Later polls leave
   * it undefined and the client keeps what it had.
   */
  hasOlderMessages?: boolean;
  /**
   * Every unread message, counted once.
   *
   * Not the sum of the two fields above: a message that tags you is both an
   * unread mention and an unread message in its conversation, so adding them
   * showed two of everything. Derived server-side because only the server can
   * see which mentions sit in threads the reader has never opened.
   */
  unreadTotal: number;
  /** Send this back as `since` on the next poll. */
  serverTime: string;
}

/** A page of older messages, oldest first, plus whether more remain behind it. */
export interface MessagePageDto {
  messages: MessageDto[];
  hasOlder: boolean;
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
