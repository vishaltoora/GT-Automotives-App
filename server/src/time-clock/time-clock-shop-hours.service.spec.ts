import { BadRequestException } from '@nestjs/common';
import { TimeClockService } from './time-clock.service';

/**
 * Unit tests for the shop-hours window as the service applies it.
 *
 * shop-hours.spec.ts pins the arithmetic; these pin the decisions built on it —
 * who the window applies to, which entries the closing sweep is allowed to
 * touch, and what state it leaves them in.
 */
describe('TimeClockService shop hours', () => {
  let service: TimeClockService;
  let prisma: any;
  let auditRepository: any;

  const employee = {
    id: 'emp-1',
    firstName: 'Rohit',
    lastName: 'Toora',
    email: 'rohit@example.com',
    role: { name: 'STAFF' },
  };

  /** 13:00 Pacific on 15 January — mid-shift, inside the window. */
  const DURING_HOURS = new Date('2026-01-15T21:00:00.000Z');
  /** 03:00 Pacific on 16 January — long shut. */
  const OVERNIGHT = new Date('2026-01-16T11:00:00.000Z');
  /** 07:30 Pacific on 15 January — before opening. */
  const BEFORE_OPENING = new Date('2026-01-15T15:30:00.000Z');
  /** 20:00 Pacific on 15 January, the closing instant that day. */
  const CLOSING_INSTANT = new Date('2026-01-16T04:00:00.000Z');
  /** 20:30 Pacific on 15 January — just after closing. */
  const AFTER_CLOSING = new Date('2026-01-16T04:30:00.000Z');

  const openEntry = (overrides: any = {}) => ({
    id: 'te-1',
    employeeId: 'emp-1',
    // Clocked in 09:00 Pacific.
    clockInAt: new Date('2026-01-15T17:00:00.000Z'),
    clockOutAt: null,
    status: 'OPEN',
    source: 'EMPLOYEE',
    breaks: [],
    employee,
    ...overrides,
  });

  /** Put the clock at a given instant, so "now" is the shop's time, not the runner's. */
  const at = (instant: Date) => {
    jest.useFakeTimers({
      now: instant,
      doNotFake: ['nextTick', 'queueMicrotask'],
    });
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(employee) },
      company: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'co-1',
          isDefault: true,
          timeClockWindowEnabled: true,
          timeClockOpensAt: '08:00',
          timeClockClosesAt: '20:00',
        }),
      },
      timeEntry: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn((args: any) => ({
          id: 'te-new',
          breaks: [],
          employee,
          ...args.data,
        })),
        update: jest.fn(({ where, data }: any) => ({
          ...openEntry(),
          id: where.id,
          ...data,
        })),
      },
      breakEntry: { updateMany: jest.fn() },
      $transaction: jest.fn((fn: any) => fn(prisma)),
    };
    auditRepository = { create: jest.fn() };
    service = new TimeClockService(prisma, auditRepository);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('clocking in', () => {
    it('is allowed during shop hours', async () => {
      at(DURING_HOURS);

      await expect(service.clockIn('emp-1', {} as any)).resolves.toBeDefined();
    });

    it('is refused before opening, and says when the clock opens', async () => {
      at(BEFORE_OPENING);

      await expect(service.clockIn('emp-1', {} as any)).rejects.toThrow(
        /opens at 8:00 AM/
      );
      expect(prisma.timeEntry.create).not.toHaveBeenCalled();
    });

    it('is refused after closing', async () => {
      at(OVERNIGHT);

      await expect(service.clockIn('emp-1', {} as any)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    // Genuine late work still has to be recordable, or the window just loses
    // hours people actually worked.
    it('is allowed at any hour when an admin does it on their behalf', async () => {
      at(OVERNIGHT);

      await expect(
        service.clockIn('emp-1', {} as any, false)
      ).resolves.toBeDefined();
    });

    it('is allowed at any hour when the window is switched off', async () => {
      prisma.company.findFirst.mockResolvedValue({
        isDefault: true,
        timeClockWindowEnabled: false,
        timeClockOpensAt: '08:00',
        timeClockClosesAt: '20:00',
      });
      at(OVERNIGHT);

      await expect(service.clockIn('emp-1', {} as any)).resolves.toBeDefined();
    });

    it('respects a window the shop widened', async () => {
      prisma.company.findFirst.mockResolvedValue({
        isDefault: true,
        timeClockWindowEnabled: true,
        timeClockOpensAt: '07:00',
        timeClockClosesAt: '21:00',
      });
      at(BEFORE_OPENING);

      await expect(service.clockIn('emp-1', {} as any)).resolves.toBeDefined();
    });
  });

  describe('closing shifts left open', () => {
    it('closes an open shift at the day closing time, not at now', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([openEntry()]);
      at(OVERNIGHT);

      const closed = await service.autoClockOutStaleEntries();

      expect(closed).toBe(1);
      const [[{ data }]] = prisma.timeEntry.update.mock.calls;
      expect(data.clockOutAt).toEqual(CLOSING_INSTANT);
      expect(data.status).toBe('CLOCKED_OUT');
    });

    it('marks the entry as system-closed and says why', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([openEntry()]);
      at(OVERNIGHT);

      await service.autoClockOutStaleEntries();

      const [[{ data }]] = prisma.timeEntry.update.mock.calls;
      expect(data.source).toBe('SYSTEM');
      expect(data.autoClockedOut).toBe(true);
      expect(data.adjustmentReason).toContain('8:00 PM');
    });

    // An auto clock-out is a guess about when someone left. It must be looked
    // at before it is paid, so it stays in the review queue.
    it('leaves the entry unapproved', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([openEntry()]);
      at(OVERNIGHT);

      await service.autoClockOutStaleEntries();

      const [[{ data }]] = prisma.timeEntry.update.mock.calls;
      expect(data.approvedAt).toBeUndefined();
      expect(data.approvedBy).toBeUndefined();
    });

    it('ends an open break at the same instant', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([
        openEntry({ status: 'ON_BREAK' }),
      ]);
      at(OVERNIGHT);

      await service.autoClockOutStaleEntries();

      expect(prisma.breakEntry.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { timeEntryId: 'te-1', endAt: null },
          data: expect.objectContaining({ endAt: CLOSING_INSTANT }),
        })
      );
    });

    it('leaves a shift alone while it is still within its day', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([openEntry()]);
      at(DURING_HOURS);

      const closed = await service.autoClockOutStaleEntries();

      expect(closed).toBe(0);
      expect(prisma.timeEntry.update).not.toHaveBeenCalled();
    });

    it('only ever looks at open and on-break shifts', async () => {
      at(OVERNIGHT);

      await service.autoClockOutStaleEntries();

      // Approved, voided and payroll-processed entries are terminal; the query
      // must not reach them at all.
      const [[{ where }]] = prisma.timeEntry.findMany.mock.calls;
      expect(where.status.in).toEqual(['OPEN', 'ON_BREAK']);
    });

    it('does nothing when the window is switched off', async () => {
      prisma.company.findFirst.mockResolvedValue({
        isDefault: true,
        timeClockWindowEnabled: false,
      });
      prisma.timeEntry.findMany.mockResolvedValue([openEntry()]);
      at(OVERNIGHT);

      expect(await service.autoClockOutStaleEntries()).toBe(0);
      expect(prisma.timeEntry.update).not.toHaveBeenCalled();
    });

    it('closes a shift left open for days at the closing time it ran past', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([
        // Clocked in 09:00 Pacific on 12 January.
        openEntry({ clockInAt: new Date('2026-01-12T17:00:00.000Z') }),
      ]);
      at(OVERNIGHT);

      await service.autoClockOutStaleEntries();

      const [[{ data }]] = prisma.timeEntry.update.mock.calls;
      expect(data.clockOutAt).toEqual(new Date('2026-01-13T04:00:00.000Z'));
    });

    // The admin exemption exists to record work that genuinely ran late. A
    // sweep that zeroed those entries would destroy the escape hatch within
    // five minutes of it being used.
    it('does not zero out a shift an admin started after closing time', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([
        // 22:00 Pacific on 15 January — only an admin could have made this.
        openEntry({ clockInAt: new Date('2026-01-16T06:00:00.000Z') }),
      ]);
      at(OVERNIGHT);

      const closed = await service.autoClockOutStaleEntries();

      // Its own day's closing time is already behind it, so it is left running
      // until the next one rather than stamped at the instant it began.
      expect(closed).toBe(0);
      expect(prisma.timeEntry.update).not.toHaveBeenCalled();
    });

    it('closes a late admin shift at the next closing time', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([
        openEntry({ clockInAt: new Date('2026-01-16T06:00:00.000Z') }),
      ]);
      // 21:00 Pacific on 16 January — past the next closing time.
      at(new Date('2026-01-17T05:00:00.000Z'));

      await service.autoClockOutStaleEntries();

      const [[{ data }]] = prisma.timeEntry.update.mock.calls;
      expect(data.clockOutAt).toEqual(new Date('2026-01-17T04:00:00.000Z'));
    });

    // Nothing else mutates a time entry without an audit trail, and this one
    // changes paid hours with no user behind it.
    it('audits the automatic clock-out', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([openEntry()]);
      at(OVERNIGHT);

      await service.autoClockOutStaleEntries();

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'AUTO_CLOCK_OUT',
          resource: 'TimeEntry',
          resourceId: 'te-1',
        })
      );
    });

    it('is idempotent — a second sweep finds nothing left open', async () => {
      prisma.timeEntry.findMany.mockResolvedValue([]);
      at(OVERNIGHT);

      expect(await service.autoClockOutStaleEntries()).toBe(0);
    });
  });

  describe('reporting the window to the UI', () => {
    it('says the clock is open during shop hours', async () => {
      at(DURING_HOURS);

      const status = await service.getShopHoursStatus();

      expect(status.isOpen).toBe(true);
      expect(status.closedReason).toBeUndefined();
      expect(status.opensAt).toBe('08:00');
      expect(status.closesAt).toBe('20:00');
    });

    it('says the clock has closed for the day if the shift ran late', async () => {
      at(AFTER_CLOSING);

      const status = await service.getShopHoursStatus();

      expect(status.isOpen).toBe(false);
      expect(status.closedReason).toContain('closed at 8:00 PM');
    });

    // At 3 AM the useful answer is when it opens, not when it shut.
    it('says when the clock next opens if it is the small hours', async () => {
      at(OVERNIGHT);

      const status = await service.getShopHoursStatus();

      expect(status.isOpen).toBe(false);
      expect(status.closedReason).toContain('opens at 8:00 AM');
    });
  });
});
