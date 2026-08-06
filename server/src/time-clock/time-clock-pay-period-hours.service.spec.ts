import { TimeClockService } from './time-clock.service';

/**
 * Unit tests for the employee cards on the time clock.
 *
 * The guarantees under test are the ones the cards are for: approved and
 * unapproved hours are counted separately so the gap is visible, hours already
 * paid do not reappear as outstanding, deactivated staff do not clutter the
 * period, and an employee only ever sees themselves.
 */
describe('TimeClockService pay period hours', () => {
  let service: TimeClockService;
  let prisma: any;

  const rohit = {
    id: 'emp-1',
    firstName: 'Rohit',
    lastName: 'Toora',
    email: 'rohit@example.com',
    role: { name: 'STAFF' },
  };
  const dana = {
    id: 'emp-2',
    firstName: 'Dana',
    lastName: 'Singh',
    email: 'dana@example.com',
    role: { name: 'FOREMAN' },
  };

  const admin = { id: 'admin-1', role: { name: 'ADMIN' } };
  const period = ['2026-03-01T08:00:00.000Z', '2026-03-16T06:59:59.999Z'];

  /** An 8-hour shift with no breaks. */
  const shift = (
    id: string,
    employeeId: string,
    status: string,
    day: number
  ) => ({
    id,
    employeeId,
    status,
    clockInAt: new Date(
      `2026-03-${String(day).padStart(2, '0')}T17:00:00.000Z`
    ),
    clockOutAt: new Date(
      `2026-03-${String(day + 1).padStart(2, '0')}T01:00:00.000Z`
    ),
    payrollProcessedAt: status === 'PROCESSED' ? new Date() : null,
    breaks: [],
  });

  const entries = [
    shift('te-1', 'emp-1', 'APPROVED', 2),
    shift('te-2', 'emp-1', 'PROCESSED', 3),
    shift('te-3', 'emp-1', 'CLOCKED_OUT', 4),
    shift('te-4', 'emp-1', 'ADJUSTED', 5),
    shift('te-5', 'emp-1', 'VOIDED', 6),
    shift('te-6', 'emp-2', 'APPROVED', 2),
    // An unfinished shift: no clock out, so no total to approve yet.
    {
      id: 'te-7',
      employeeId: 'emp-2',
      status: 'OPEN',
      clockInAt: new Date('2026-03-07T17:00:00.000Z'),
      clockOutAt: null,
      payrollProcessedAt: null,
      breaks: [],
    },
  ];

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(({ where }: any) =>
          Promise.resolve(
            where.id
              ? [rohit, dana].filter((u) => u.id === where.id)
              : [rohit, dana]
          )
        ),
      },
      timeEntry: {
        findMany: jest.fn(({ where }: any) =>
          Promise.resolve(
            entries.filter(
              (entry) =>
                where.employeeId.in.includes(entry.employeeId) &&
                entry.status !== 'VOIDED'
            )
          )
        ),
      },
    };

    service = new TimeClockService(prisma, { create: jest.fn() } as any);
  });

  const rowsFor = (user: any) =>
    service.getPayPeriodHours(period[0], period[1], user);

  it('counts approved and unapproved hours separately', async () => {
    const [row] = await rowsFor(admin);

    // Approved (8) + processed (8); the gap to chase is clocked out (8) plus
    // adjusted (8).
    expect(row.approvedHours).toBe(16);
    expect(row.unapprovedHours).toBe(16);
  });

  it('keeps hours already paid on the approved side', async () => {
    const [row] = await rowsFor(admin);

    // The money for these has gone out — presenting them as awaiting approval
    // would send an admin chasing something that is already settled. Processed
    // hours are a subset of approved, never an addition to unapproved.
    expect(row.processedHours).toBe(8);
    expect(row.approvedHours).toBe(16);
    expect(row.unapprovedHours).toBe(16);
  });

  it('leaves voided entries out of both totals', async () => {
    const [row] = await rowsFor(admin);

    // A withdrawn claim is neither payable nor outstanding. Four shifts count,
    // the voided fifth does not.
    expect(row.approvedHours + row.unapprovedHours).toBe(32);
    expect(row.entryCount).toBe(4);
  });

  it('reports a running shift rather than counting it', async () => {
    const [, row] = await rowsFor(admin);

    // An open shift has no settled total, so its hours would change on every
    // refresh. It is surfaced as a count instead.
    expect(row.openEntryCount).toBe(1);
    expect(row.approvedHours).toBe(8);
    expect(row.unapprovedHours).toBe(0);
  });

  it('lists only active employee accounts', async () => {
    await rowsFor(admin);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });

  it('gives an employee their own row only', async () => {
    const rows = await rowsFor({ id: 'emp-1', role: { name: 'STAFF' } });

    expect(rows).toHaveLength(1);
    expect(rows[0].employeeId).toBe('emp-1');
  });

  it('narrows an employee to themselves even though they asked for nobody', async () => {
    await rowsFor({ id: 'emp-1', role: { name: 'STAFF' } });

    // The route guard says who may call; this says what they get back.
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'emp-1' } })
    );
  });

  it('gives the accountant the whole team, read-only', async () => {
    const rows = await rowsFor({ id: 'acct-1', role: { name: 'ACCOUNTANT' } });

    expect(rows.map((row) => row.employeeId)).toEqual(['emp-1', 'emp-2']);
  });

  it('returns a zero row for an employee with no entries in the period', async () => {
    prisma.timeEntry.findMany.mockResolvedValue([]);

    const rows = await rowsFor(admin);

    // The card still has to appear — an employee with nothing logged is exactly
    // the discrepancy the view exists to surface.
    expect(rows).toHaveLength(2);
    expect(rows[0].approvedHours).toBe(0);
    expect(rows[0].unapprovedHours).toBe(0);
  });
});
