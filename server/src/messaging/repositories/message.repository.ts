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

/**
 * How many messages a thread opens with.
 *
 * Opening a conversation used to read every message it had ever held. Repair
 * order threads are purged thirty days after the job closes so they stay
 * small, but shop chat is kept forever — so that read grew without limit, on
 * every panel open, for every person.
 */
export const CONVERSATION_PAGE_SIZE = 50;

/**
 * How much of a backlog one catch-up poll will carry.
 *
 * A tab that slept through a long weekend wakes with a cursor days old, and
 * "everything since" is then the whole weekend in one response with three
 * nested includes. Kept close to a page because the cursor resumes: a real
 * backlog costs an extra trip rather than one big response, and the size of
 * that response is not something a caller should get to choose by sending an
 * old enough cursor.
 */
export const CATCHUP_LIMIT = 100;

/**
 * Ordering for every windowed read, newest first.
 *
 * `createdAt` alone is not unique — it is `TIMESTAMP(3)` defaulting to the
 * transaction clock, so two people sending inside the same millisecond get the
 * same value. Which of them landed on a page boundary was then arbitrary, and
 * paging on `createdAt < that` excluded its twin from the next page as well:
 * the message existed and no amount of scrolling back would ever show it. The
 * id breaks the tie and makes the cursor total.
 */
const NEWEST_FIRST = [
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.MessageOrderByWithRelationInput[];

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

  /**
   * The newest page of a thread, oldest first, plus whether more sit behind it.
   *
   * Reads one row more than the page to answer that question without a second
   * count query.
   */
  async findRecentForConversation(
    conversationId: string,
    user: MessagingUser,
    limit: number = CONVERSATION_PAGE_SIZE
  ): Promise<{ messages: MessageWithRelations[]; hasOlder: boolean }> {
    const newestFirst = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        AND: [this.visibilityFilter(user)],
      },
      include: MESSAGE_INCLUDE,
      orderBy: NEWEST_FIRST,
      take: limit + 1,
    });

    const hasOlder = newestFirst.length > limit;
    const page = hasOlder ? newestFirst.slice(0, limit) : newestFirst;

    return { messages: page.reverse(), hasOlder };
  }

  /**
   * The page before a point in a thread, for scrolling back through it.
   *
   * The cursor is the `(createdAt, id)` pair of the oldest message the caller
   * holds, not the timestamp alone — see NEWEST_FIRST for what a bare
   * timestamp loses.
   */
  async findOlderForConversation(
    conversationId: string,
    user: MessagingUser,
    before: Date,
    beforeId: string | undefined,
    limit: number = CONVERSATION_PAGE_SIZE
  ): Promise<{ messages: MessageWithRelations[]; hasOlder: boolean }> {
    // Without an id — a client from before the two deployed apart — the
    // timestamp has to stand on its own, tie and all.
    const olderThanCursor = beforeId
      ? {
          OR: [
            { createdAt: { lt: before } },
            { createdAt: before, id: { lt: beforeId } },
          ],
        }
      : { createdAt: { lt: before } };

    const newestFirst = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...olderThanCursor,
        AND: [this.visibilityFilter(user)],
      },
      include: MESSAGE_INCLUDE,
      orderBy: NEWEST_FIRST,
      take: limit + 1,
    });

    const hasOlder = newestFirst.length > limit;
    const page = hasOlder ? newestFirst.slice(0, limit) : newestFirst;

    return { messages: page.reverse(), hasOlder };
  }

  /**
   * What has happened in a thread since a cursor, oldest first.
   *
   * Usually a handful of messages — but not always, and the exception is what
   * this is capped for: a tablet that slept through a long weekend wakes with
   * a days-old cursor, and "everything since" is then the entire weekend in
   * one response. `truncated` says the caller has not caught up yet, so the
   * poll can hand back a cursor that stops at what it actually returned and
   * let the next trip carry the rest.
   */
  async findSinceForConversation(
    conversationId: string,
    user: MessagingUser,
    since: Date,
    limit: number = CATCHUP_LIMIT
  ): Promise<{ messages: MessageWithRelations[]; truncated: boolean }> {
    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        createdAt: { gt: since },
        AND: [this.visibilityFilter(user)],
      },
      include: MESSAGE_INCLUDE,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: limit + 1,
    });

    const truncated = rows.length > limit;
    if (!truncated) return { messages: rows, truncated };

    /*
     * Stop the page short of a shared millisecond.
     *
     * The cursor that resumes a truncated catch-up is a timestamp — one ISO
     * string on the wire — so if the last message delivered shares its
     * millisecond with the first one dropped, `gt` steps over the twin and
     * that message is never delivered to this tab again. Trimming the trailing
     * run means the cursor always lands on a clean boundary. The trimmed rows
     * are not lost: the next trip asks for them.
     */
    const page = rows.slice(0, limit);
    const boundary = page[page.length - 1].createdAt.getTime();
    const firstDropped = rows[limit];

    // Only when the boundary is genuinely straddled. Otherwise the cursor
    // already lands cleanly and there is nothing to give up.
    if (firstDropped.createdAt.getTime() !== boundary) {
      return { messages: page, truncated };
    }

    const trimmed = page.filter((m) => m.createdAt.getTime() !== boundary);

    // Unless the whole page is one millisecond, which no shop produces, and
    // where trimming would leave nothing to advance the cursor with at all.
    return {
      messages: trimmed.length > 0 ? trimmed : page,
      truncated,
    };
  }

  /**
   * Who a message was private to, without its content.
   *
   * Deliberately outside the visibility filter and unfiltered by `deletedAt`,
   * and deliberately returning ids only: it exists so an edit can recompute
   * the floor a reply inherited even after the parent has been deleted. No
   * body, no author name — nothing the caller could not already read off the
   * mentions stored on their own reply.
   */
  async findParentAudience(id: string): Promise<{
    authorId: string;
    visibility: string;
    mentionUserIds: string[];
  } | null> {
    const parent = await this.prisma.message.findUnique({
      where: { id },
      select: {
        authorId: true,
        visibility: true,
        mentions: { select: { userId: true } },
      },
    });

    if (!parent) return null;

    return {
      authorId: parent.authorId,
      visibility: parent.visibility,
      mentionUserIds: parent.mentions.map((m) => m.userId),
    };
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
