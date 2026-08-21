import { MessageRepository, MessagingUser } from './message.repository';

/**
 * The visibility filter decides who can read what, so it is tested as a value
 * rather than through a query. What matters is the shape of the clause handed
 * to Prisma — if it is ever `{}`, every private message in the shop becomes
 * readable.
 */
describe('MessageRepository.visibilityFilter', () => {
  const repo = new MessageRepository({} as never);

  const asUser = (id: string, roleName: string): MessagingUser => ({
    id,
    role: { name: roleName },
  });

  it('holds an admin to the same rule as everyone else', () => {
    expect(repo.visibilityFilter(asUser('admin1', 'ADMIN'))).toEqual({
      OR: [
        { visibility: 'PUBLIC' },
        { authorId: 'admin1' },
        { mentions: { some: { userId: 'admin1' } } },
      ],
    });
  });

  it.each(['STAFF', 'SUPERVISOR', 'FOREMAN', 'ACCOUNTANT', 'ADMIN'])(
    'constrains %s to public, own, and mentioned',
    (roleName) => {
      const filter = repo.visibilityFilter(asUser('u1', roleName));

      expect(filter).toEqual({
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: 'u1' },
          { mentions: { some: { userId: 'u1' } } },
        ],
      });
    }
  );

  it('never returns an unrestricted filter for any role', () => {
    for (const roleName of [
      'STAFF',
      'SUPERVISOR',
      'FOREMAN',
      'ACCOUNTANT',
      'ADMIN',
    ]) {
      const filter = repo.visibilityFilter(asUser('u1', roleName));

      expect(filter).not.toEqual({});
      expect(filter.OR).toHaveLength(3);
    }
  });

  it('scopes the filter to the asking user, not a shared one', () => {
    const mine = repo.visibilityFilter(asUser('u1', 'STAFF'));
    const theirs = repo.visibilityFilter(asUser('u2', 'STAFF'));

    expect(mine).not.toEqual(theirs);
  });
});

/**
 * The badge query used to issue one count per conversation the reader had ever
 * opened, on every poll — including the background poll a hidden tab now runs
 * once a minute. What matters here is that it is one query, and that each
 * conversation is still counted from its own read mark.
 */
describe('MessageRepository.unreadCountsByConversation', () => {
  const prisma = {
    conversationMember: { findMany: jest.fn() },
    message: { groupBy: jest.fn(), count: jest.fn() },
  };
  const repo = new MessageRepository(prisma as never);

  const reader: MessagingUser = { id: 'sarah-1', role: { name: 'STAFF' } };
  const readMark = new Date('2026-08-21T17:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.conversationMember.findMany.mockResolvedValue([
      { conversationId: 'general-1', lastReadAt: readMark },
      { conversationId: 'ro-thread-1', lastReadAt: null },
    ]);
    prisma.message.groupBy.mockResolvedValue([
      { conversationId: 'general-1', _count: { _all: 2 } },
      { conversationId: 'ro-thread-1', _count: { _all: 1 } },
    ]);
  });

  it('asks once, however many conversations the reader belongs to', async () => {
    await repo.unreadCountsByConversation(reader);

    expect(prisma.message.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.message.count).not.toHaveBeenCalled();
  });

  it('counts each conversation from its own read mark', async () => {
    await repo.unreadCountsByConversation(reader);

    const where = prisma.message.groupBy.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { conversationId: 'general-1', createdAt: { gt: readMark } },
      // Never opened, so everything in it is unread.
      { conversationId: 'ro-thread-1' },
    ]);
  });

  it('still composes the visibility filter — the badge must not betray a private message', async () => {
    await repo.unreadCountsByConversation(reader);

    const where = prisma.message.groupBy.mock.calls[0][0].where;
    expect(where.AND).toEqual([repo.visibilityFilter(reader)]);
    expect(where.authorId).toEqual({ not: 'sarah-1' });
    expect(where.deletedAt).toBeNull();
  });

  it('returns a map of conversation id to count', async () => {
    expect(await repo.unreadCountsByConversation(reader)).toEqual({
      'general-1': 2,
      'ro-thread-1': 1,
    });
  });

  it('asks for nothing when the reader belongs to no conversation', async () => {
    prisma.conversationMember.findMany.mockResolvedValue([]);

    expect(await repo.unreadCountsByConversation(reader)).toEqual({});
    expect(prisma.message.groupBy).not.toHaveBeenCalled();
  });
});

/**
 * Opening a thread used to read every message it had ever held. Repair order
 * threads are purged thirty days after the job closes, but shop chat is kept
 * for good — so this is the read that grows for as long as the shop exists.
 */
describe('MessageRepository.findRecentForConversation', () => {
  const prisma = { message: { findMany: jest.fn() } };
  const repo = new MessageRepository(prisma as never);
  const reader: MessagingUser = { id: 'sarah-1', role: { name: 'STAFF' } };

  const rows = (count: number) =>
    Array.from({ length: count }, (_, index) => ({ id: `m-${index}` }));

  beforeEach(() => jest.clearAllMocks());

  it('asks for one row more than the page, to know whether more remain', async () => {
    prisma.message.findMany.mockResolvedValue(rows(3));

    await repo.findRecentForConversation('conv-1', reader, 2);

    const args = prisma.message.findMany.mock.calls[0][0];
    expect(args.take).toBe(3);
    // Newest first, so a window means the newest window.
    expect(args.orderBy).toEqual({ createdAt: 'desc' });
    expect(args.where.AND).toEqual([repo.visibilityFilter(reader)]);
  });

  it('returns the page oldest first, dropping the extra row', async () => {
    // Newest first from the database: m-0 is newest, m-2 is the probe.
    prisma.message.findMany.mockResolvedValue(rows(3));

    const page = await repo.findRecentForConversation('conv-1', reader, 2);

    expect(page.messages.map((m) => m.id)).toEqual(['m-1', 'm-0']);
    expect(page.hasOlder).toBe(true);
  });

  it('reports no more history when the thread fits in one page', async () => {
    prisma.message.findMany.mockResolvedValue(rows(2));

    const page = await repo.findRecentForConversation('conv-1', reader, 2);

    expect(page.messages.map((m) => m.id)).toEqual(['m-1', 'm-0']);
    expect(page.hasOlder).toBe(false);
  });

  it('pages backwards from a point, still filtered', async () => {
    prisma.message.findMany.mockResolvedValue(rows(1));
    const before = new Date('2026-08-21T17:00:00.000Z');

    await repo.findOlderForConversation('conv-1', reader, before, 2);

    const args = prisma.message.findMany.mock.calls[0][0];
    expect(args.where.createdAt).toEqual({ lt: before });
    expect(args.where.AND).toEqual([repo.visibilityFilter(reader)]);
  });
});
