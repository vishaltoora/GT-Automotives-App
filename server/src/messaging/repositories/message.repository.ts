import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';

/** The slice of the authenticated user this repository needs. */
export interface MessagingUser {
  id: string;
  role: { name: string };
}

/**
 * Everything needed to render a message. Kept in one place so no read path
 * can accidentally return a message without its mentions — the mentions are
 * what the UI uses to draw the private badge, and their absence would make a
 * private message look public.
 */
export const MESSAGE_INCLUDE = {
  author: { select: { id: true, firstName: true, lastName: true } },
  mentions: {
    select: {
      userId: true,
      user: { select: { firstName: true, lastName: true } },
    },
  },
  references: {
    select: { entityType: true, entityId: true, label: true },
  },
} satisfies Prisma.MessageInclude;

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: typeof MESSAGE_INCLUDE;
}>;

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Who is allowed to see what.
   *
   * This is the security boundary for the whole feature, and it is deliberately
   * the only place the rule is written. Every read composes it. Nothing filters
   * on the client — a hidden message must never reach the browser at all, so
   * hiding one with CSS would be a leak, not a fix.
   *
   * A message is visible when it is public, or you wrote it, or you were tagged
   * in it. There is no role that reads past this — an admin sees a private
   * message only by being in it, the same as everyone else. "Only Sarah will
   * see this" has to mean what it says, or the strip in the composer is a lie
   * and people stop trusting the feature with anything worth keeping private.
   */
  visibilityFilter(user: MessagingUser): Prisma.MessageWhereInput {
    return {
      OR: [
        { visibility: 'PUBLIC' },
        { authorId: user.id },
        { mentions: { some: { userId: user.id } } },
      ],
    };
  }

  /** Messages in a thread that this user may see, oldest first. */
  async findForConversation(
    conversationId: string,
    user: MessagingUser,
    since?: Date
  ): Promise<MessageWithRelations[]> {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...(since ? { createdAt: { gt: since } } : {}),
        AND: [this.visibilityFilter(user)],
      },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  /** A single message, or null when this user may not see it. */
  async findByIdForUser(
    id: string,
    user: MessagingUser
  ): Promise<MessageWithRelations | null> {
    return this.prisma.message.findFirst({
      where: {
        id,
        deletedAt: null,
        AND: [this.visibilityFilter(user)],
      },
      include: MESSAGE_INCLUDE,
    });
  }

  /**
   * Unread mentions for the badge and the inbox.
   *
   * No visibility filter needed: being mentioned is itself the grant, so every
   * row here is one this user is allowed to read by definition.
   */
  async countUnreadMentions(userId: string): Promise<number> {
    return this.prisma.messageMention.count({
      where: { userId, readAt: null, message: { deletedAt: null } },
    });
  }

  /**
   * Unread mentions in threads this reader has never opened.
   *
   * Membership is created by opening a conversation, so being tagged in a
   * repair order thread you have never looked at leaves no membership and no
   * `lastReadAt` — which is exactly the case the mention badge exists for.
   * Those messages are invisible to the per-conversation counts, so they are
   * counted here and nowhere else; anything in a joined conversation is
   * already counted there, and counting it twice is what made one tagged
   * message read as two.
   */
  async countUnreadMentionsOutsideMemberships(userId: string): Promise<number> {
    return this.prisma.messageMention.count({
      where: {
        userId,
        readAt: null,
        message: {
          deletedAt: null,
          conversation: { members: { none: { userId } } },
        },
      },
    });
  }

  async findMentionInbox(userId: string, unreadOnly: boolean) {
    return this.prisma.messageMention.findMany({
      where: {
        userId,
        message: { deletedAt: null },
        ...(unreadOnly ? { readAt: null } : {}),
      },
      select: {
        id: true,
        readAt: true,
        message: {
          include: {
            ...MESSAGE_INCLUDE,
            conversation: {
              select: { id: true, entityType: true, entityId: true },
            },
          },
        },
      },
      orderBy: { message: { createdAt: 'desc' } },
      take: 100,
    });
  }

  /**
   * Unread counts per conversation, for the badges.
   *
   * Counts only messages this user may see, so a private message they are not
   * part of cannot betray its existence through a badge that never clears.
   *
   * One query, not one per membership. It used to loop, and memberships
   * accumulate for life — one per repair-order thread anybody opens — so an
   * idle tab polling in the background was issuing a count per thread that
   * person had ever visited, every minute, all night.
   */
  async unreadCountsByConversation(
    user: MessagingUser
  ): Promise<Record<string, number>> {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId: user.id },
      select: { conversationId: true, lastReadAt: true },
    });

    if (memberships.length === 0) return {};

    const grouped = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        deletedAt: null,
        authorId: { not: user.id },
        AND: [this.visibilityFilter(user)],
        // One clause per membership, because the read mark is per
        // conversation: this thread, and only what arrived after this
        // reader last looked at it.
        OR: memberships.map((membership) => ({
          conversationId: membership.conversationId,
          ...(membership.lastReadAt
            ? { createdAt: { gt: membership.lastReadAt } }
            : {}),
        })),
      },
      _count: { _all: true },
    });

    const counts: Record<string, number> = {};
    for (const row of grouped) {
      if (row._count._all > 0) counts[row.conversationId] = row._count._all;
    }
    return counts;
  }
}
