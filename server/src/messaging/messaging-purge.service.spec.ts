import { MessagingPurgeService } from './messaging-purge.service';

/**
 * The shop does not retain messages once a job is done, so this job deletes
 * them. That makes over-deleting the expensive failure: there is nothing to
 * restore. Most of what follows is about what it must leave alone.
 */
describe('MessagingPurgeService', () => {
  let service: MessagingPurgeService;
  let prisma: any;

  const DAY = 24 * 60 * 60 * 1000;

  beforeEach(() => {
    prisma = {
      repairOrder: { findMany: jest.fn().mockResolvedValue([]) },
      conversation: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    service = new MessagingPurgeService(prisma);
  });

  afterEach(() => {
    delete process.env.MESSAGING_RETENTION_DAYS;
  });

  const cutoffUsed = () =>
    prisma.repairOrder.findMany.mock.calls.at(-1)[0].where.closedAt.lt as Date;

  it('looks only at closed and invoiced repair orders', async () => {
    await service.purgeClosedRepairOrderConversations();

    const where = prisma.repairOrder.findMany.mock.calls.at(-1)[0].where;
    expect(where.status.in).toEqual(['CLOSED', 'INVOICED']);
  });

  it('defaults to a thirty day window', async () => {
    const before = Date.now();
    await service.purgeClosedRepairOrderConversations();

    const cutoff = cutoffUsed().getTime();
    expect(before - cutoff).toBeGreaterThanOrEqual(30 * DAY - 1000);
    expect(before - cutoff).toBeLessThanOrEqual(30 * DAY + 5000);
  });

  it('honours MESSAGING_RETENTION_DAYS', async () => {
    process.env.MESSAGING_RETENTION_DAYS = '7';
    const before = Date.now();

    await service.purgeClosedRepairOrderConversations();

    const cutoff = cutoffUsed().getTime();
    expect(before - cutoff).toBeGreaterThanOrEqual(7 * DAY - 1000);
    expect(before - cutoff).toBeLessThanOrEqual(7 * DAY + 5000);
  });

  it.each([['nonsense'], ['0'], ['-5'], ['']])(
    'falls back to thirty days when the setting is %s',
    async (value) => {
      process.env.MESSAGING_RETENTION_DAYS = value;
      const before = Date.now();

      await service.purgeClosedRepairOrderConversations();

      const cutoff = cutoffUsed().getTime();
      expect(before - cutoff).toBeGreaterThanOrEqual(30 * DAY - 1000);
    }
  );

  it('deletes the conversations of repair orders past the window', async () => {
    prisma.repairOrder.findMany.mockResolvedValue([
      { id: 'ro-1' },
      { id: 'ro-2' },
    ]);
    prisma.conversation.deleteMany.mockResolvedValue({ count: 2 });

    const purged = await service.purgeClosedRepairOrderConversations();

    expect(purged).toBe(2);
    expect(prisma.conversation.deleteMany).toHaveBeenCalledWith({
      where: {
        entityType: 'REPAIR_ORDER',
        entityId: { in: ['ro-1', 'ro-2'] },
      },
    });
  });

  it('does not touch the database when nothing is old enough', async () => {
    prisma.repairOrder.findMany.mockResolvedValue([]);

    const purged = await service.purgeClosedRepairOrderConversations();

    expect(purged).toBe(0);
    expect(prisma.conversation.deleteMany).not.toHaveBeenCalled();
  });

  describe('what it must never delete', () => {
    beforeEach(() => {
      prisma.repairOrder.findMany.mockResolvedValue([{ id: 'ro-1' }]);
    });

    // General chat has no repair order to close, so it sits outside the rule.
    it('scopes the delete to repair-order threads only', async () => {
      await service.purgeClosedRepairOrderConversations();

      const where = prisma.conversation.deleteMany.mock.calls.at(-1)[0].where;
      expect(where.entityType).toBe('REPAIR_ORDER');
      expect(where.entityId.in).toEqual(['ro-1']);
    });

    it('deletes conversations, never the repair orders themselves', async () => {
      await service.purgeClosedRepairOrderConversations();

      expect(prisma.repairOrder.deleteMany).toBeUndefined();
      expect(prisma.conversation.deleteMany).toHaveBeenCalledTimes(1);
    });

    // A reopened repair order has status IN_PROGRESS and a null closedAt, so
    // the query excludes it without needing to know it was ever reopened.
    it('cannot select a reopened repair order', async () => {
      await service.purgeClosedRepairOrderConversations();

      const where = prisma.repairOrder.findMany.mock.calls.at(-1)[0].where;
      expect(where.status.in).not.toContain('IN_PROGRESS');
      expect(where.status.in).not.toContain('OPEN');
      expect(where.closedAt.lt).toBeInstanceOf(Date);
    });
  });
});
