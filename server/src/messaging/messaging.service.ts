import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import {
  ConversationEntity,
  CreateMessageDto,
  MessageDto,
  MessageVisibility,
  PollResponseDto,
} from '@gt-automotive/data';
import {
  MessageRepository,
  MessageWithRelations,
  MESSAGE_INCLUDE,
  MessagingUser,
} from './repositories/message.repository';
import { parseMentionUserIds, parseReferences } from './mention-parser';
import { MessageEventsService } from './message-events.service';

/** Roles that may use messaging. Customers are deliberately absent. */
const INTERNAL_ROLES = [
  'ADMIN',
  'SUPERVISOR',
  'FOREMAN',
  'ACCOUNTANT',
  'STAFF',
];

/** The one shop-wide channel. */
const GENERAL_TITLE = 'Shop Chat';

/**
 * Longest a poll may be held open. Capped below the frontend reverse proxy's
 * 30 second timeout, which would otherwise kill the request and surface as an
 * error rather than an empty result.
 */
const MAX_HOLD_MS = 25_000;

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messages: MessageRepository,
    private readonly events: MessageEventsService
  ) {}

  // ---- Reading ----

  /**
   * One request serves the open thread and every unread badge.
   *
   * `since` comes back from the previous response's serverTime rather than a
   * client clock: a browser running a few seconds fast would ask for messages
   * newer than a moment that has not happened yet, and silently miss them.
   */
  async poll(
    user: MessagingUser,
    conversationId?: string,
    since?: string,
    waitMs = 0
  ): Promise<PollResponseDto> {
    if (conversationId) {
      await this.ensureMembership(conversationId, user.id);
    }

    // Everyone belongs to the shop channel whether or not they have opened it.
    // Unread counts are drawn from memberships, so without this a message in
    // shop chat counted for nobody until each person happened to click the tab.
    await this.ensureGeneralMembership(user.id);

    const first = await this.collect(user, conversationId, since);
    if (first.messages.length > 0 || waitMs <= 0) {
      return first;
    }

    // Nothing new, and the caller is willing to wait. Sleep until a write
    // announces itself rather than re-querying on a timer — see
    // MessageEventsService for why that distinction matters.
    const woke = await this.events.waitForMessage(
      user.id,
      Math.min(waitMs, MAX_HOLD_MS)
    );

    // Re-query either way, waking or timing out. A wake-up only says something
    // happened — whether this user may read it is still the visibility
    // filter's decision — and returning the pre-wait answer on a timeout would
    // hand back counts up to twenty-five seconds old.
    void woke;
    return this.collect(user, conversationId, since);
  }

  private async collect(
    user: MessagingUser,
    conversationId?: string,
    since?: string
  ): Promise<PollResponseDto> {
    const serverTime = new Date();
    const sinceDate = since ? new Date(since) : undefined;

    const messages = conversationId
      ? await this.messages.findForConversation(conversationId, user, sinceDate)
      : [];

    const [unreadMentions, conversationUnreads, unjoinedMentions] =
      await Promise.all([
        this.messages.countUnreadMentions(user.id),
        this.messages.unreadCountsByConversation(user),
        this.messages.countUnreadMentionsOutsideMemberships(user.id),
      ]);

    // Each unread message once: the per-conversation counts cover everything
    // in a thread this reader has joined, mentions included, and the rest are
    // the tags waiting in threads they have never opened.
    const unreadTotal =
      Object.values(conversationUnreads).reduce((sum, n) => sum + n, 0) +
      unjoinedMentions;

    return {
      messages: messages.map((m) => this.toDto(m)),
      unreadMentions,
      conversationUnreads,
      unreadTotal,
      serverTime: serverTime.toISOString(),
    };
  }

  async getMentionInbox(user: MessagingUser, unreadOnly: boolean) {
    const rows = await this.messages.findMentionInbox(user.id, unreadOnly);

    // A mention is read away from the thread it was written in, so it has to
    // carry its own context. The repair order number comes from the
    // conversation rather than from a reference row on the message: a message
    // posted inside a repair order is about that repair order by definition,
    // and storing it twice would leave two things to keep in step.
    const roIds = [
      ...new Set(
        rows
          .filter(
            (row) =>
              row.message.conversation.entityType === 'REPAIR_ORDER' &&
              row.message.conversation.entityId
          )
          .map((row) => row.message.conversation.entityId as string)
      ),
    ];

    const repairOrders = roIds.length
      ? await this.prisma.repairOrder.findMany({
          where: { id: { in: roIds } },
          select: { id: true, roNumber: true },
        })
      : [];
    const roNumberById = new Map(
      repairOrders.map((ro) => [ro.id, ro.roNumber])
    );

    return rows.map((row) => ({
      mentionId: row.id,
      readAt: row.readAt?.toISOString() ?? null,
      message: this.toDto(row.message as unknown as MessageWithRelations),
      conversation: {
        id: row.message.conversation.id,
        entityType: row.message.conversation.entityType,
        entityId: row.message.conversation.entityId,
        roNumber: row.message.conversation.entityId
          ? roNumberById.get(row.message.conversation.entityId) ?? null
          : null,
      },
    }));
  }

  // ---- Writing ----

  /**
   * Post a message.
   *
   * Visibility is worked out here and never taken from the request. A client
   * that could set it — or hand us a mention list — could tag itself into
   * somebody else's private message, so the body is the only input trusted and
   * the mentions are re-derived from it on every write.
   */
  async createMessage(
    conversationId: string,
    user: MessagingUser,
    dto: CreateMessageDto
  ): Promise<MessageDto> {
    await this.assertConversationExists(conversationId);
    await this.ensureMembership(conversationId, user.id);

    const mentionedIds = await this.resolveMentionableIds(
      parseMentionUserIds(dto.body)
    );
    const references = parseReferences(dto.body);

    let visibility: MessageVisibility =
      mentionedIds.length > 0 ? 'MENTIONED_ONLY' : 'PUBLIC';
    const audience = new Set(mentionedIds);

    if (dto.parentMessageId) {
      const parent = await this.messages.findByIdForUser(
        dto.parentMessageId,
        user
      );
      if (!parent || parent.conversationId !== conversationId) {
        throw new NotFoundException('Message being replied to was not found');
      }

      // A reply can never be more visible than what it replies to. Without
      // this, answering a private message without tagging anybody would post
      // publicly into a thread nobody else can see — which leaks the original
      // by implication and reads as a non-sequitur to everyone else.
      if (parent.visibility === 'MENTIONED_ONLY') {
        visibility = 'MENTIONED_ONLY';
        parent.mentions.forEach((m) => audience.add(m.userId));
        audience.add(parent.authorId);
      }
    }

    // The author reaching themselves is implicit — they can always see their
    // own message — so a self-mention row would only add noise.
    audience.delete(user.id);

    const created = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          authorId: user.id,
          parentMessageId: dto.parentMessageId ?? null,
          body: dto.body,
          visibility,
          mentions: {
            create: [...audience].map((userId) => ({ userId })),
          },
          references: {
            create: references.map((ref) => ({
              entityType: ref.entityType,
              entityId: ref.entityId,
              label: ref.label,
            })),
          },
        },
        include: MESSAGE_INCLUDE,
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });

    this.events.publish({
      conversationId,
      mentionedUserIds: [...audience],
      visibility,
      authorId: user.id,
    });

    return this.toDto(created);
  }

  async updateMessage(
    id: string,
    user: MessagingUser,
    body: string
  ): Promise<MessageDto> {
    const existing = await this.messages.findByIdForUser(id, user);
    if (!existing) {
      throw new NotFoundException('Message not found');
    }
    if (existing.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const mentionedIds = await this.resolveMentionableIds(
      parseMentionUserIds(body)
    );
    const references = parseReferences(body);
    const audience = new Set(mentionedIds);
    audience.delete(user.id);

    // An edit re-derives visibility from the new body, so removing the last
    // mention makes a message public. Editing a reply cannot widen it, though:
    // the inherited floor is recomputed from the parent, same as on create.
    let visibility: MessageVisibility =
      audience.size > 0 ? 'MENTIONED_ONLY' : 'PUBLIC';

    if (existing.parentMessageId) {
      const parent = await this.messages.findByIdForUser(
        existing.parentMessageId,
        user
      );
      if (parent?.visibility === 'MENTIONED_ONLY') {
        visibility = 'MENTIONED_ONLY';
        parent.mentions.forEach((m) => audience.add(m.userId));
        audience.add(parent.authorId);
        audience.delete(user.id);
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.messageMention.deleteMany({ where: { messageId: id } });
      await tx.messageReference.deleteMany({ where: { messageId: id } });

      return tx.message.update({
        where: { id },
        data: {
          body,
          visibility,
          editedAt: new Date(),
          mentions: { create: [...audience].map((userId) => ({ userId })) },
          references: {
            create: references.map((ref) => ({
              entityType: ref.entityType,
              entityId: ref.entityId,
              label: ref.label,
            })),
          },
        },
        include: MESSAGE_INCLUDE,
      });
    });

    return this.toDto(updated);
  }

  /**
   * Soft delete. The row stays so replies keep their parent and the thread
   * still reads in order; the body is simply no longer returned.
   */
  async deleteMessage(id: string, user: MessagingUser): Promise<void> {
    const existing = await this.messages.findByIdForUser(id, user);
    if (!existing) {
      throw new NotFoundException('Message not found');
    }
    if (existing.authorId !== user.id && user.role.name !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Reading a conversation clears its mentions too.
   *
   * Without this the badge lied: somebody tagged in a repair order would open
   * that thread, read the message, and still be told they had an unread
   * mention — because the only thing that cleared one was clicking it in the
   * inbox. Being read is being read, wherever it happened.
   */
  async markConversationRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await this.ensureMembership(conversationId, userId);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.conversationMember.updateMany({
        where: { conversationId, userId },
        data: { lastReadAt: now },
      }),
      this.prisma.messageMention.updateMany({
        where: { userId, readAt: null, message: { conversationId } },
        data: { readAt: now },
      }),
    ]);
  }

  async markMentionRead(mentionId: string, userId: string): Promise<void> {
    const result = await this.prisma.messageMention.updateMany({
      where: { id: mentionId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count === 0) {
      // Either it is not theirs or it was already read. Both are no-ops from
      // the caller's point of view, but a missing mention should still 404
      // rather than quietly succeed.
      const exists = await this.prisma.messageMention.findFirst({
        where: { id: mentionId, userId },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException('Mention not found');
      }
    }
  }

  // ---- Conversations ----

  /** The shop-wide channel, created on first use. */
  async getGeneralConversation(userId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { type: 'GENERAL' },
    });

    const conversation =
      existing ??
      (await this.prisma.conversation.create({
        data: { type: 'GENERAL', title: GENERAL_TITLE },
      }));

    await this.ensureMembership(conversation.id, userId);
    return this.withReadState(conversation, userId);
  }

  /**
   * The thread for a repair order, created on first use. The unique constraint
   * on (entityType, entityId) is what guarantees one thread per repair order
   * even if two people open it at the same moment.
   */
  async getEntityConversation(
    entityType: ConversationEntity,
    entityId: string,
    userId: string
  ) {
    const existing = await this.prisma.conversation.findUnique({
      where: { entityType_entityId: { entityType, entityId } },
    });

    let conversation = existing;
    if (!conversation) {
      try {
        conversation = await this.prisma.conversation.create({
          data: { type: 'ENTITY', entityType, entityId },
        });
      } catch {
        // Lost a race with another request; theirs is just as good as ours.
        conversation = await this.prisma.conversation.findUnique({
          where: { entityType_entityId: { entityType, entityId } },
        });
      }
    }

    if (!conversation) {
      throw new NotFoundException('Could not open a thread for this record');
    }

    await this.ensureMembership(conversation.id, userId);
    return this.withReadState(conversation, userId);
  }

  /**
   * Adds where this reader had got to. Everything after it is drawn as new, and
   * the mark is taken once when the thread opens rather than followed live —
   * otherwise the "new" line would erase itself as you looked at it.
   */
  private async withReadState<T extends { id: string }>(
    conversation: T,
    userId: string
  ): Promise<T & { lastReadAt: string | null }> {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId: conversation.id, userId },
      },
      select: { lastReadAt: true },
    });

    return {
      ...conversation,
      lastReadAt: membership?.lastReadAt?.toISOString() ?? null,
    };
  }

  // ---- Lookups for the composer ----

  /** Who can be tagged. Customers are excluded — they have no login. */
  async findMentionableUsers(query?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: { in: INTERNAL_ROLES as never[] } },
        ...(query
          ? {
              OR: [
                {
                  firstName: { contains: query, mode: 'insensitive' as const },
                },
                { lastName: { contains: query, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: { select: { name: true } },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: 25,
    });

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      roleName: u.role.name,
    }));
  }

  async findReferenceableRepairOrders(query?: string) {
    const ros = await this.prisma.repairOrder.findMany({
      where: query
        ? { roNumber: { contains: query, mode: 'insensitive' } }
        : {},
      select: { id: true, roNumber: true, status: true },
      orderBy: { openedAt: 'desc' },
      take: 25,
    });

    return ros.map((ro) => ({
      id: ro.id,
      roNumber: ro.roNumber,
      status: ro.status,
    }));
  }

  // ---- Internals ----

  /**
   * Drops any id that is not an active internal user.
   *
   * A body can carry any token somebody cares to type, including a customer id
   * or a deactivated employee. Only ids that survive this become mentions, and
   * therefore only they can widen who sees the message.
   */
  private async resolveMentionableIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        role: { name: { in: INTERNAL_ROLES as never[] } },
      },
      select: { id: true },
    });

    const allowed = new Set(users.map((u) => u.id));
    return ids.filter((id) => allowed.has(id));
  }

  private async assertConversationExists(id: string): Promise<void> {
    const found = await this.prisma.conversation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Conversation not found');
    }
  }

  private async ensureGeneralMembership(userId: string): Promise<void> {
    const general = await this.prisma.conversation.findFirst({
      where: { type: 'GENERAL' },
      select: { id: true },
    });
    if (general) {
      await this.ensureMembership(general.id, userId);
    }
  }

  private async ensureMembership(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await this.prisma.conversationMember.upsert({
      where: { conversationId_userId: { conversationId, userId } },
      create: { conversationId, userId },
      update: {},
    });
  }

  /**
   * `createdAt` goes out as a real instant. It is a point in time, not a
   * business calendar date, so it must not pass through the business-day
   * helpers — the client formats it for America/Vancouver.
   */
  private toDto(message: MessageWithRelations): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      parentMessageId: message.parentMessageId,
      body: message.body,
      visibility: message.visibility,
      author: {
        id: message.author.id,
        firstName: message.author.firstName,
        lastName: message.author.lastName,
      },
      mentions: message.mentions.map((m) => ({
        userId: m.userId,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
      })),
      references: message.references.map((r) => ({
        entityType: r.entityType,
        entityId: r.entityId,
        label: r.label,
      })),
      createdAt: message.createdAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      deletedAt: message.deletedAt?.toISOString() ?? null,
    };
  }
}
