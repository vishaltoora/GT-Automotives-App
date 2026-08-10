import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PayStubsService } from './pay-stubs.service';

/**
 * Unit tests for PayStubsService.
 *
 * The two things worth guarding here are the ones a pay record cannot get
 * wrong: the derived totals must be computed server-side rather than trusted
 * from the client, and year-to-date must accumulate across the calendar year.
 */
describe('PayStubsService', () => {
  let service: PayStubsService;
  let prisma: any;
  let pdfService: any;
  let auditRepository: any;
  let timeClockService: any;

  const employee = {
    id: 'emp-1',
    firstName: 'Rohit',
    lastName: 'Toora',
    email: 'rohit@example.com',
    role: { name: 'STAFF' },
  };

  const accountant = { id: 'acc-1', role: { name: 'ACCOUNTANT' } };

  const baseDto = {
    employeeId: 'emp-1',
    periodStart: '2026-01-05',
    periodEnd: '2026-01-31',
    payDate: '2026-01-31',
    position: 'Business Manager',
    payRate: 24,
    regularHours: 128,
    regularAmount: 3072,
    eiAmount: 50.08,
    cppAmount: 166.96,
  };

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(employee) },
      company: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'co-1',
          name: 'GT Automotive',
          address: '2983 Nicole Ave, Prince George, BC',
          isDefault: true,
        }),
      },
      employeeCompensation: {
        findFirst: jest.fn().mockResolvedValue({
          payType: 'HOURLY',
          hourlyRate: 24,
          position: 'Tire Technician',
        }),
      },
      payStub: {
        create: jest.fn((args: any) => ({
          id: 'stub-1',
          createdAt: new Date('2026-01-31T00:00:00.000Z'),
          employee,
          ...args.data,
        })),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        // create() rewrites the year in pay-date order once the row exists, so
        // the mock has to accept those writes even in tests that ignore them.
        update: jest.fn(({ where, data }: any) => ({
          id: where.id,
          createdAt: new Date('2026-01-31T00:00:00.000Z'),
          employee,
          ...data,
        })),
      },
    };
    pdfService = {
      generatePayStubHtml: jest.fn().mockReturnValue('<html></html>'),
      generatePdfFromHtml: jest.fn().mockResolvedValue(Buffer.from('pdf')),
    };
    auditRepository = { create: jest.fn() };

    timeClockService = {
      isPayrollRole: jest.fn((role: string) =>
        ['ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF'].includes(role)
      ),
      processPayroll: jest.fn().mockResolvedValue({ processedEntries: 1 }),
      // What the period holds. baseDto pays for exactly this, so the default
      // case is the matching one.
      calculatePayrollHours: jest
        .fn()
        .mockResolvedValue({ hours: 128, entries: [{ id: 'te-1' }] }),
    };

    service = new PayStubsService(
      prisma,
      pdfService,
      auditRepository,
      timeClockService
    );
  });

  describe('create', () => {
    it('derives withholding total and net pay rather than trusting the client', async () => {
      const result = await service.create(baseDto as any, accountant.id);

      // Gross carries the 4% vacation accrual, and withholding carries the
      // matching held line, so net comes out exactly where it would have
      // without either.
      expect(result.grossPay).toBe(3194.88);
      expect(result.totalWithholding).toBe(339.92);
      expect(result.netPay).toBe(2854.96);
    });

    it('snapshots the company header and employee name onto the stub', async () => {
      const result = await service.create(baseDto as any, accountant.id);

      expect(result.companyName).toBe('GT Automotive');
      expect(result.companyAddress).toBe('2983 Nicole Ave, Prince George, BC');
      expect(result.employeeName).toBe('Rohit Toora');
      expect(result.position).toBe('Business Manager');
    });

    it('takes the job title from the compensation record when none is sent', async () => {
      const { position, ...withoutPosition } = baseDto;

      const result = await service.create(
        withoutPosition as any,
        accountant.id
      );

      expect(result.position).toBe('Tire Technician');
    });

    it('prefers an explicit job title over the compensation record', async () => {
      // A stub can be raised for a role someone held only for that period.
      const result = await service.create(
        { ...baseDto, position: 'Shop Foreman' } as any,
        accountant.id
      );

      expect(result.position).toBe('Shop Foreman');
    });

    it('accumulates year-to-date across earlier stubs in the same year', async () => {
      // January's stub already exists; February's must carry the running total.
      prisma.payStub.findMany.mockResolvedValue([
        {
          regularHours: 128,
          regularAmount: 3072,
          grossPay: 3194.88,
          vacationPayAmount: 122.88,
          vacationPayHeld: 122.88,
          eiAmount: 50.08,
          cppAmount: 166.96,
          incomeTaxAmount: 0,
          otherDeductions: 0,
          totalWithholding: 339.92,
          netPay: 2854.96,
        },
      ]);

      const result = await service.create(
        {
          ...baseDto,
          periodStart: '2026-02-01',
          periodEnd: '2026-02-28',
          payDate: '2026-02-28',
        } as any,
        accountant.id
      );

      expect(result.ytdHours).toBe(256);
      expect(result.ytdGrossPay).toBe(6389.76);
      expect(result.ytdVacationPayAmount).toBe(245.76);
      expect(result.ytdVacationPayHeld).toBe(245.76);
      expect(result.ytdEiAmount).toBe(100.16);
      expect(result.ytdCppAmount).toBe(333.92);
      expect(result.ytdWithholding).toBe(679.84);
      expect(result.ytdNetPay).toBe(5709.92);
    });

    it('sums only stubs up to this pay date, within its calendar year', async () => {
      await service.create(baseDto as any, accountant.id);

      // Unbounded above, a stub backfilled for an earlier period would count a
      // later one as prior — overstating its year-to-date and understating the
      // CPP and EI room left when deductions are estimated.
      expect(prisma.payStub.findMany).toHaveBeenCalledWith({
        where: {
          employeeId: 'emp-1',
          payDate: {
            gte: new Date(Date.UTC(2026, 0, 1)),
            lte: new Date(Date.UTC(2026, 0, 31)),
          },
        },
      });
    });

    /**
     * Stubs are not always raised in pay-date order — a missed period gets
     * backfilled, and running payroll after a period closes is a case this
     * feature exists for. A stub landing mid-chain must leave the year
     * reconciling, not just itself.
     */
    describe('raised out of pay-date order', () => {
      /** A tiny in-memory payStub table, so the chain can actually be walked. */
      const useStore = () => {
        const rows: any[] = [];
        let seq = 0;
        prisma.payStub.create = jest.fn((args: any) => {
          const row = {
            id: `stub-${++seq}`,
            createdAt: new Date(Date.UTC(2026, 5, seq)),
            employee,
            ...args.data,
          };
          rows.push(row);
          return row;
        });
        prisma.payStub.findMany = jest.fn(({ where, orderBy }: any) => {
          // The service queries this table three different ways: a calendar
          // year for the ytd chain, everything before a date for the vacation
          // balance, and the whole record for the balance rewrite. Each clause
          // is optional so one mock serves all three.
          const inRange = (row: any) => {
            const range = where.payDate;
            if (!range) return true;
            if (range.gte && row.payDate < range.gte) return false;
            if (range.lte && row.payDate > range.lte) return false;
            if (range.lt && row.payDate >= range.lt) return false;
            return true;
          };
          let out = rows.filter(
            (row) =>
              row.employeeId === where.employeeId &&
              (where.id?.not ? row.id !== where.id.not : true) &&
              inRange(row)
          );
          if (orderBy) {
            out = [...out].sort(
              (a, b) =>
                a.payDate.getTime() - b.payDate.getTime() ||
                a.createdAt.getTime() - b.createdAt.getTime()
            );
          }
          return out;
        });
        prisma.payStub.update = jest.fn(({ where, data }: any) => {
          const row = rows.find((candidate) => candidate.id === where.id);
          Object.assign(row, data);
          return row;
        });
        prisma.payStub.findUnique = jest.fn(({ where }: any) =>
          rows.find((row) => row.id === where.id)
        );
        return rows;
      };

      /**
       * $1,000 gross, no deductions and no vacation accrual, so the running
       * totals are easy to read. These tests are about the chain, not the
       * arithmetic within a stub.
       */
      const stubFor = (payDate: string) => ({
        ...baseDto,
        payDate,
        periodStart: payDate,
        periodEnd: payDate,
        regularHours: 40,
        regularAmount: 1000,
        vacationPayRate: 0,
        eiAmount: 0,
        cppAmount: 0,
      });

      it('does not count a later stub as prior to it', async () => {
        useStore();
        await service.create(stubFor('2026-02-28') as any, accountant.id);

        const january = await service.create(
          stubFor('2026-01-31') as any,
          accountant.id
        );

        // January is first in the year, so its running total is its own gross —
        // not February's added on top of it.
        expect(january.ytdGrossPay).toBe(1000);
      });

      it('rewrites the stubs that come after it', async () => {
        const rows = useStore();
        await service.create(stubFor('2026-02-28') as any, accountant.id);
        await service.create(stubFor('2026-01-31') as any, accountant.id);

        // February was issued believing it was the year's first stub. Once
        // January exists it has to carry both, or the year never reconciles.
        const february = rows.find((row) => row.id === 'stub-1');
        expect(Number(february.ytdGrossPay)).toBe(2000);
      });

      it('leaves the whole year summing to the stubs in it', async () => {
        const rows = useStore();
        await service.create(stubFor('2026-03-31') as any, accountant.id);
        await service.create(stubFor('2026-01-31') as any, accountant.id);
        await service.create(stubFor('2026-02-28') as any, accountant.id);

        const chain = [...rows]
          .sort((a, b) => a.payDate.getTime() - b.payDate.getTime())
          .map((row) => Number(row.ytdGrossPay));
        expect(chain).toEqual([1000, 2000, 3000]);
      });

      it('does not touch a neighbouring year', async () => {
        const rows = useStore();
        await service.create(stubFor('2025-12-31') as any, accountant.id);
        await service.create(stubFor('2026-01-31') as any, accountant.id);

        // Year-to-date restarts each calendar year; the rewrite must respect
        // that boundary rather than running a total across it.
        expect(rows.map((row) => Number(row.ytdGrossPay))).toEqual([
          1000, 1000,
        ]);
      });
    });

    it('rejects a stub whose withholdings exceed gross pay', async () => {
      await expect(
        service.create({ ...baseDto, eiAmount: 4000 } as any, accountant.id)
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a period that ends before it starts', async () => {
      await expect(
        service.create(
          {
            ...baseDto,
            periodStart: '2026-01-31',
            periodEnd: '2026-01-05',
          } as any,
          accountant.id
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects creation when no default company is configured', async () => {
      prisma.company.findFirst.mockResolvedValue(null);

      await expect(
        service.create(baseDto as any, accountant.id)
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('writes an audit record', async () => {
      await service.create(baseDto as any, accountant.id);

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE_PAY_STUB',
          resource: 'PayStub',
        })
      );
    });
  });

  /**
   * Raising the stub is the payment, so the hours behind it stop being
   * available to any other stub at that moment.
   */
  describe('create processes the hours it pays for', () => {
    it('processes the covered period for the employee', async () => {
      await service.create(baseDto as any, accountant.id);

      expect(timeClockService.processPayroll).toHaveBeenCalledWith(
        expect.objectContaining({ employeeId: 'emp-1' }),
        accountant.id
      );
    });

    it('covers the whole of the last day of the period', async () => {
      await service.create(baseDto as any, accountant.id);

      const [{ startDate, endDate }] =
        timeClockService.processPayroll.mock.calls[0];

      // The period ends on Jan 31. A shift worked at 9am that day is a later
      // instant than the calendar date naming it, so an end bound of "Jan 31
      // midnight" would leave the last day's work unpaid and re-offer it to the
      // next stub.
      expect(new Date(startDate).getTime()).toBeLessThan(
        new Date('2026-01-05T23:00:00.000Z').getTime()
      );
      expect(new Date(endDate).getTime()).toBeGreaterThan(
        new Date('2026-02-01T00:00:00.000Z').getTime()
      );
    });

    it('lets the accountant process by raising a stub', async () => {
      // Processing from the time clock is admin-only, but issuing pay is the
      // accountant's job and the stub is the instrument that does it.
      await service.create(baseDto as any, accountant.id);

      expect(timeClockService.processPayroll).toHaveBeenCalled();
    });

    it('processes after the stub row exists', async () => {
      const order: string[] = [];
      prisma.payStub.create.mockImplementation((args: any) => {
        order.push('stub');
        return {
          id: 'stub-1',
          createdAt: new Date('2026-01-31T00:00:00.000Z'),
          employee,
          ...args.data,
        };
      });
      timeClockService.processPayroll.mockImplementation(async () => {
        order.push('process');
      });

      await service.create(baseDto as any, accountant.id);

      // Hours stamped as paid with no stub paying them is the worse failure of
      // the two, so the stub is written first.
      expect(order).toEqual(['stub', 'process']);
    });

    it('leaves someone outside payroll time tracking alone', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...employee,
        role: { name: 'ACCOUNTANT' },
      });

      await service.create(baseDto as any, accountant.id);

      // They have no time entries; processPayroll would refuse the role and
      // take the whole stub down with it.
      expect(timeClockService.processPayroll).not.toHaveBeenCalled();
    });

    it('reports back that the hours were settled', async () => {
      const result = await service.create(baseDto as any, accountant.id);

      expect(result.hoursProcessed).toBe(true);
    });
  });

  /**
   * A stub carries an hours *figure*, not a set of entries, and that figure is
   * only pre-filled — the accountant may overwrite it. Processing is addressed
   * by date range, so stamping regardless would mark hours paid that the stub
   * does not pay, with no way back: nothing un-processes an entry.
   */
  describe('create refuses to stamp hours the stub does not pay', () => {
    it('leaves the entries alone when the stub pays less than the period holds', async () => {
      // 80 approved hours available, a 40-hour stub raised against them.
      timeClockService.calculatePayrollHours.mockResolvedValue({
        hours: 80,
        entries: [{ id: 'te-1' }, { id: 'te-2' }],
      });

      const result = await service.create(
        { ...baseDto, regularHours: 40, regularAmount: 960 } as any,
        accountant.id
      );

      expect(timeClockService.processPayroll).not.toHaveBeenCalled();
      expect(result.hoursProcessed).toBe(false);
    });

    it('still raises the stub when the figures disagree', async () => {
      timeClockService.calculatePayrollHours.mockResolvedValue({
        hours: 80,
        entries: [{ id: 'te-1' }],
      });

      const result = await service.create(
        { ...baseDto, regularHours: 40, regularAmount: 960 } as any,
        accountant.id
      );

      // Refusing the stub would block paying an advance; the hours simply stay
      // available, which is visible and recoverable.
      expect(result.id).toBe('stub-1');
      expect(result.regularHours).toBe(40);
    });

    it('catches a shift approved while the form was open', async () => {
      // The form pre-filled 128, then a foreman approved another 8.
      timeClockService.calculatePayrollHours.mockResolvedValue({
        hours: 136,
        entries: [{ id: 'te-1' }],
      });

      const result = await service.create(baseDto as any, accountant.id);

      // Recomputed at save time, not trusted from what the form last saw.
      expect(timeClockService.processPayroll).not.toHaveBeenCalled();
      expect(result.hoursProcessed).toBe(false);
    });

    it('processes when the figures agree to the cent', async () => {
      timeClockService.calculatePayrollHours.mockResolvedValue({
        hours: 128.004,
        entries: [{ id: 'te-1' }],
      });

      const result = await service.create(baseDto as any, accountant.id);

      // Both sides round to 128.00, so this is a match, not a discrepancy.
      expect(result.hoursProcessed).toBe(true);
    });

    it('does not process a period with nothing in it', async () => {
      timeClockService.calculatePayrollHours.mockResolvedValue({
        hours: 0,
        entries: [],
      });

      const result = await service.create(
        {
          ...baseDto,
          regularHours: 0,
          regularAmount: 0,
          eiAmount: 0,
          cppAmount: 0,
        } as any,
        accountant.id
      );

      // A salaried stub, or a period with no approved time. Nothing to stamp.
      expect(timeClockService.processPayroll).not.toHaveBeenCalled();
      expect(result.hoursProcessed).toBe(false);
    });
  });

  describe('access control', () => {
    it('lets an employee read their own stubs', async () => {
      await expect(
        service.findForEmployee('emp-1', {
          id: 'emp-1',
          role: { name: 'STAFF' },
        })
      ).resolves.toEqual([]);
    });

    it("refuses an employee another person's stubs", async () => {
      await expect(
        service.findForEmployee('emp-2', {
          id: 'emp-1',
          role: { name: 'STAFF' },
        })
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('refuses a supervisor another person’s stubs — pay is not a supervision concern', async () => {
      await expect(
        service.findForEmployee('emp-2', {
          id: 'sup-1',
          role: { name: 'SUPERVISOR' },
        })
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets an accountant read anyone’s stubs', async () => {
      await expect(
        service.findForEmployee('emp-2', accountant)
      ).resolves.toEqual([]);
    });

    it('refuses a non-payroll role the full list', async () => {
      await expect(
        service.findAll({ id: 'emp-1', role: { name: 'STAFF' } })
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('refuses a PDF for a stub belonging to someone else', async () => {
      prisma.payStub.findUnique.mockResolvedValue({
        id: 'stub-1',
        employeeId: 'emp-2',
        employee,
      });

      await expect(
        service.generatePdf('stub-1', { id: 'emp-1', role: { name: 'STAFF' } })
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(pdfService.generatePdfFromHtml).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    /** A stub as stored: Decimal-ish numbers and real Dates, like Prisma returns. */
    const storedStub = (overrides: any = {}) => ({
      id: 'stub-1',
      employeeId: 'emp-1',
      periodStart: new Date(Date.UTC(2026, 0, 5)),
      periodEnd: new Date(Date.UTC(2026, 0, 31)),
      payDate: new Date(Date.UTC(2026, 0, 31)),
      createdAt: new Date(Date.UTC(2026, 0, 31)),
      companyName: 'GT Automotive',
      employeeName: 'Rohit Toora',
      position: 'Business Manager',
      payRate: 24,
      payType: 'HOURLY',
      regularHours: 128,
      regularAmount: 3072,
      grossPay: 3072,
      eiAmount: 50.08,
      cppAmount: 166.96,
      incomeTaxAmount: 0,
      otherDeductions: 0,
      totalWithholding: 217.04,
      netPay: 2854.96,
      ytdHours: 128,
      ytdRegularAmount: 3072,
      ytdGrossPay: 3072,
      ytdEiAmount: 50.08,
      ytdCppAmount: 166.96,
      ytdIncomeTaxAmount: 0,
      ytdOtherDeductions: 0,
      ytdWithholding: 217.04,
      ytdNetPay: 2854.96,
      employee,
      ...overrides,
    });

    beforeEach(() => {
      prisma.payStub.update = jest.fn(({ where, data }: any) => ({
        ...storedStub(),
        id: where.id,
        ...data,
      }));
    });

    it('does not re-process the time entries', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());
      prisma.payStub.findMany.mockResolvedValue([]);

      await service.update(
        'stub-1',
        { regularHours: 130 } as any,
        accountant.id
      );

      // The entries were processed when the stub was raised and are terminal
      // now; an amendment corrects the document, not the time record.
      expect(timeClockService.processPayroll).not.toHaveBeenCalled();
    });

    it('recomputes the totals rather than trusting the client', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());
      prisma.payStub.findMany.mockResolvedValue([]);

      await service.update('stub-1', { regularAmount: 3500 } as any, 'acc-1');

      const [[{ data }]] = prisma.payStub.update.mock.calls;
      expect(data.grossPay).toBe(3500);
      expect(data.totalWithholding).toBe(217.04);
      expect(data.netPay).toBe(3282.96);
    });

    it('leaves untouched fields as they were', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());
      prisma.payStub.findMany.mockResolvedValue([]);

      await service.update('stub-1', { eiAmount: 60 } as any, 'acc-1');

      const [[{ data }]] = prisma.payStub.update.mock.calls;
      expect(data.regularAmount).toBe(3072);
      expect(data.cppAmount).toBe(166.96);
      // The one changed figure flows through to the derived totals.
      expect(data.totalWithholding).toBe(226.96);
      expect(data.netPay).toBe(2845.04);
    });

    it('rewrites the year-to-date chain so later stubs still reconcile', async () => {
      // February's stub carries January's running total. Correcting January
      // must push the correction through February as well.
      const january = storedStub({ id: 'stub-1' });
      const february = storedStub({
        id: 'stub-2',
        payDate: new Date(Date.UTC(2026, 1, 28)),
        createdAt: new Date(Date.UTC(2026, 1, 28)),
      });

      prisma.payStub.findUnique.mockResolvedValue(january);
      prisma.payStub.findMany.mockResolvedValue([
        { ...january, grossPay: 4000, regularAmount: 4000, netPay: 3782.96 },
        february,
      ]);

      await service.update('stub-1', { regularAmount: 4000 } as any, 'acc-1');

      const ytdWrites = prisma.payStub.update.mock.calls
        .map(([args]: any) => args)
        .filter((args: any) => args.data.ytdGrossPay !== undefined);

      expect(ytdWrites).toHaveLength(2);
      expect(ytdWrites[0].where.id).toBe('stub-1');
      expect(ytdWrites[0].data.ytdGrossPay).toBe(4000);
      // February's YTD now includes the corrected January figure.
      expect(ytdWrites[1].where.id).toBe('stub-2');
      expect(ytdWrites[1].data.ytdGrossPay).toBe(7072);
      expect(ytdWrites[1].data.ytdNetPay).toBe(6637.92);
    });

    it('walks the year in pay date order, not insertion order', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());
      prisma.payStub.findMany.mockResolvedValue([]);

      await service.update('stub-1', { regularAmount: 3072 } as any, 'acc-1');

      expect(prisma.payStub.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ payDate: 'asc' }, { createdAt: 'asc' }],
        })
      );
    });

    it('rewrites both years when a stub moves across new year', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());
      prisma.payStub.findMany.mockResolvedValue([]);

      await service.update('stub-1', { payDate: '2025-12-31' } as any, 'acc-1');

      // Only the year-scoped reads. The vacation balance queries the same
      // table without a year bound, deliberately — it runs across years.
      const years = prisma.payStub.findMany.mock.calls
        .map(([args]: any) => args.where?.payDate?.gte)
        .filter(Boolean)
        .map((gte: Date) => gte.getUTCFullYear());
      expect(new Set(years)).toEqual(new Set([2025, 2026]));
    });

    it('refuses an amendment that would make net pay negative', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());

      await expect(
        service.update('stub-1', { eiAmount: 4000 } as any, 'acc-1')
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payStub.update).not.toHaveBeenCalled();
    });

    it('refuses a period that would end before it starts', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());

      await expect(
        service.update('stub-1', { periodEnd: '2026-01-01' } as any, 'acc-1')
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payStub.update).not.toHaveBeenCalled();
    });

    it('refuses to amend a stub that does not exist', async () => {
      prisma.payStub.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nope', { eiAmount: 1 } as any, 'acc-1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('audits the amendment with the figures before and after', async () => {
      prisma.payStub.findUnique.mockResolvedValue(storedStub());
      prisma.payStub.findMany.mockResolvedValue([]);

      await service.update('stub-1', { regularAmount: 3500 } as any, 'acc-1');

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_PAY_STUB',
          resource: 'PayStub',
          resourceId: 'stub-1',
          oldValue: expect.objectContaining({ grossPay: 3072 }),
          newValue: expect.objectContaining({ grossPay: 3500 }),
        })
      );
    });
  });

  /**
   * Vacation pay is accrued and banked rather than paid out: it is added to
   * gross as an earning and taken straight back out as a deduction, so the
   * cheque is unchanged while the stub records what the employee has earned and
   * what the business owes them.
   */
  describe('vacation pay', () => {
    const dataOf = (mock: any) => mock.mock.calls[0][0].data;

    it('accrues 4% of the period earnings and holds it back', async () => {
      const result = await service.create(baseDto as any, accountant.id);

      expect(result.vacationPayRate).toBe(4);
      expect(result.vacationPayAmount).toBe(122.88);
      expect(result.vacationPayHeld).toBe(122.88);
    });

    it('leaves net pay exactly where it would be without the accrual', async () => {
      const withVacation = await service.create(baseDto as any, accountant.id);
      const without = await service.create(
        { ...baseDto, vacationPayRate: 0 } as any,
        accountant.id
      );

      expect(withVacation.netPay).toBe(without.netPay);
    });

    it('accrues on the earnings, not on the gross it produces', async () => {
      // 4% of 3072, never 4% of 3194.88 — vacation does not compound on
      // vacation, which it would if the base were taken after the accrual.
      const result = await service.create(baseDto as any, accountant.id);

      expect(result.vacationPayAmount).toBe(3072 * 0.04);
    });

    it("uses the employee's own rate when one is recorded", async () => {
      // 6% after five years of service.
      prisma.employeeCompensation.findFirst.mockResolvedValue({
        payType: 'HOURLY',
        hourlyRate: 24,
        vacationPayRate: 6,
      });

      const result = await service.create(baseDto as any, accountant.id);

      expect(result.vacationPayRate).toBe(6);
      expect(result.vacationPayAmount).toBe(184.32);
    });

    it('falls back to the statutory minimum when no rate is recorded', async () => {
      prisma.employeeCompensation.findFirst.mockResolvedValue({
        payType: 'HOURLY',
        hourlyRate: 24,
        vacationPayRate: null,
      });

      const result = await service.create(baseDto as any, accountant.id);

      expect(result.vacationPayRate).toBe(4);
    });

    it('honours a rate of zero rather than treating it as unset', async () => {
      // Someone paid their vacation another way still gets a stub that says so.
      prisma.employeeCompensation.findFirst.mockResolvedValue({
        payType: 'HOURLY',
        hourlyRate: 24,
        vacationPayRate: 0,
      });

      const result = await service.create(baseDto as any, accountant.id);

      expect(result.vacationPayAmount).toBe(0);
      expect(result.grossPay).toBe(3072);
    });

    it('stores an amount the accountant typed over', async () => {
      const result = await service.create(
        { ...baseDto, vacationPayAmount: 150 } as any,
        accountant.id
      );

      expect(result.vacationPayAmount).toBe(150);
      expect(result.vacationPayHeld).toBe(150);
      expect(result.grossPay).toBe(3222);
    });

    it('refuses to hold back more vacation than was earned', async () => {
      // A typo of 1228.80 for 122.88 clears the net-pay check, short-pays the
      // employee by a thousand dollars and inflates the vacation owed to them.
      await expect(
        service.create(
          { ...baseDto, vacationPayHeld: 1228.8 } as any,
          accountant.id
        )
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payStub.create).not.toHaveBeenCalled();
    });

    it('pays some of the accrual out when less is held than earned', async () => {
      const result = await service.create(
        { ...baseDto, vacationPayHeld: 22.88 } as any,
        accountant.id
      );

      // $100 of the accrual reaches the employee, so net is $100 higher.
      expect(result.vacationPayAmount).toBe(122.88);
      expect(result.vacationPayHeld).toBe(22.88);
      expect(result.netPay).toBe(2954.96);
    });

    it('freezes the rate on the stub, so a later change cannot rewrite it', async () => {
      await service.create(baseDto as any, accountant.id);

      expect(dataOf(prisma.payStub.create).vacationPayRate).toBe(4);
    });

    describe('amendments', () => {
      const storedStub = (overrides: any = {}) => ({
        id: 'stub-1',
        employeeId: 'emp-1',
        periodStart: new Date(Date.UTC(2026, 0, 5)),
        periodEnd: new Date(Date.UTC(2026, 0, 31)),
        payDate: new Date(Date.UTC(2026, 0, 31)),
        createdAt: new Date(Date.UTC(2026, 0, 31)),
        companyName: 'GT Automotive',
        employeeName: 'Rohit Toora',
        payType: 'HOURLY',
        regularHours: 128,
        regularAmount: 3072,
        grossPay: 3194.88,
        vacationPayRate: 4,
        vacationPayAmount: 122.88,
        vacationPayHeld: 122.88,
        eiAmount: 50.08,
        cppAmount: 166.96,
        incomeTaxAmount: 0,
        otherDeductions: 0,
        totalWithholding: 339.92,
        netPay: 2854.96,
        employee,
        ...overrides,
      });

      beforeEach(() => {
        prisma.payStub.findUnique.mockResolvedValue(storedStub());
        prisma.payStub.findMany.mockResolvedValue([]);
        prisma.payStub.update = jest.fn(({ where, data }: any) => ({
          ...storedStub(),
          id: where.id,
          ...data,
        }));
      });

      it('re-accrues when the earnings are corrected', async () => {
        await service.update(
          'stub-1',
          { regularAmount: 4000 } as any,
          accountant.id
        );

        // Leaving the old $122.88 would quietly break the 4% the stub still
        // claims to apply.
        const { data } = prisma.payStub.update.mock.calls[0][0];
        expect(data.vacationPayAmount).toBe(160);
        expect(data.vacationPayHeld).toBe(160);
        expect(data.grossPay).toBe(4160);
      });

      it('re-accrues when the rate is corrected', async () => {
        await service.update(
          'stub-1',
          { vacationPayRate: 6 } as any,
          accountant.id
        );

        const { data } = prisma.payStub.update.mock.calls[0][0];
        expect(data.vacationPayAmount).toBe(184.32);
      });

      it('refuses an amendment that holds back more than was earned', async () => {
        await expect(
          service.update(
            'stub-1',
            { vacationPayHeld: 500 } as any,
            accountant.id
          )
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.payStub.update).not.toHaveBeenCalled();
      });

      it('leaves the accrual alone when neither changed', async () => {
        await service.update('stub-1', { eiAmount: 60 } as any, accountant.id);

        const { data } = prisma.payStub.update.mock.calls[0][0];
        expect(data.vacationPayAmount).toBe(122.88);
      });

      it('keeps a deliberate part-payout when the earnings change', async () => {
        prisma.payStub.findUnique.mockResolvedValue(
          storedStub({ vacationPayHeld: 22.88 })
        );

        await service.update(
          'stub-1',
          { regularAmount: 4000 } as any,
          accountant.id
        );

        // The accrual follows the new earnings; the amount actually paid out
        // was a decision, not a formula, so it stands until someone changes it.
        const { data } = prisma.payStub.update.mock.calls[0][0];
        expect(data.vacationPayAmount).toBe(160);
        expect(data.vacationPayHeld).toBe(22.88);
      });

      it('carries the correction into the year-to-date chain', async () => {
        prisma.payStub.findMany.mockResolvedValue([
          storedStub({ vacationPayAmount: 160, vacationPayHeld: 160 }),
          storedStub({
            id: 'stub-2',
            payDate: new Date(Date.UTC(2026, 1, 28)),
            createdAt: new Date(Date.UTC(2026, 1, 28)),
          }),
        ]);

        await service.update(
          'stub-1',
          { regularAmount: 4000 } as any,
          accountant.id
        );

        const ytdWrites = prisma.payStub.update.mock.calls
          .map(([args]: any) => args)
          .filter((args: any) => args.data.ytdVacationPayAmount !== undefined);

        expect(ytdWrites).toHaveLength(2);
        expect(ytdWrites[0].data.ytdVacationPayAmount).toBe(160);
        expect(ytdWrites[1].data.ytdVacationPayAmount).toBe(282.88);
      });
    });

    it('leaves stubs raised before vacation was tracked showing nothing', async () => {
      // The columns default to zero on existing rows, and zero prints no lines.
      const legacy = await service.create(
        { ...baseDto, vacationPayRate: 0 } as any,
        accountant.id
      );

      expect(legacy.vacationPayAmount).toBe(0);
      expect(legacy.ytdVacationPayAmount).toBe(0);
      expect(legacy.grossPay).toBe(3072);
      expect(legacy.netPay).toBe(2854.96);
    });
  });
  /**
   * Paying banked vacation out (GA-64).
   *
   * The bank was write-only before this: every stub added to what the business
   * owed and nothing ever subtracted, so the moment an employee actually took
   * paid vacation the figure started drifting from the truth.
   */
  describe('paying vacation out', () => {
    /** The employee already has vacation banked from earlier stubs. */
    const withBank = (banked: number) => {
      prisma.payStub.findMany.mockImplementation(({ select }: any) =>
        select?.vacationPayHeld
          ? [{ vacationPayHeld: banked, vacationPayPaidOut: 0 }]
          : []
      );
    };

    const dataOf = () => prisma.payStub.create.mock.calls[0][0].data;

    it('hands the money over without taxing it again', async () => {
      withBank(500);

      const result = await service.create(
        { ...baseDto, vacationPayPaidOut: 200 } as any,
        accountant.id
      );

      // Vacation was taxed when earned. Net rises by the full payout, and the
      // statutory deductions do not move.
      expect(result.netPay).toBe(3054.96);
      expect(result.totalWithholding).toBe(339.92);
    });

    it('keeps the payout out of gross, so the year is not counted twice', async () => {
      withBank(500);

      const result = await service.create(
        { ...baseDto, vacationPayPaidOut: 200 } as any,
        accountant.id
      );

      // Gross is earnings plus this period's accrual — the payout was already
      // counted as gross in the period it was earned.
      expect(result.grossPay).toBe(3194.88);
    });

    it('does not accrue vacation on a vacation payout', async () => {
      withBank(500);

      const result = await service.create(
        { ...baseDto, vacationPayPaidOut: 200 } as any,
        accountant.id
      );

      // 4% of the regular earnings only. Accruing on the payout would pay
      // vacation on vacation.
      expect(result.vacationPayAmount).toBe(122.88);
    });

    it('draws the balance down by what was paid', async () => {
      withBank(500);

      await service.create(
        { ...baseDto, vacationPayPaidOut: 200 } as any,
        accountant.id
      );

      // 500 banked + 122.88 accrued this period - 200 paid out.
      expect(Number(dataOf().vacationPayBalance)).toBe(422.88);
    });

    it('banks the accrual when nothing is paid out', async () => {
      withBank(500);

      await service.create(baseDto as any, accountant.id);

      expect(Number(dataOf().vacationPayBalance)).toBe(622.88);
    });

    // Paying out vacation nobody earned is not a rounding problem.
    it('refuses a payout larger than the bank', async () => {
      withBank(100);

      await expect(
        service.create(
          { ...baseDto, vacationPayPaidOut: 250 } as any,
          accountant.id
        )
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payStub.create).not.toHaveBeenCalled();
    });

    it('allows paying the bank down to exactly nothing', async () => {
      withBank(200);

      await service.create(
        { ...baseDto, vacationPayPaidOut: 200 } as any,
        accountant.id
      );

      expect(Number(dataOf().vacationPayBalance)).toBe(122.88);
    });

    /**
     * The main design decision in GA-64.
     *
     * Year-to-date figures reset every January because that is how earnings
     * are reported. A vacation bank does not: vacation earned in December is
     * usually taken the following spring. Resetting it would either erase the
     * liability or pay it out twice.
     */
    describe('across the year boundary', () => {
      const useStore = () => {
        const rows: any[] = [];
        let seq = 0;
        prisma.payStub.create = jest.fn((args: any) => {
          const row = {
            id: `stub-${++seq}`,
            createdAt: new Date(Date.UTC(2026, 5, seq)),
            employee,
            ...args.data,
          };
          rows.push(row);
          return row;
        });
        prisma.payStub.findMany = jest.fn(({ where }: any) =>
          rows.filter((row) => {
            if (row.employeeId !== where.employeeId) return false;
            const range = where.payDate;
            if (!range) return true;
            if (range.gte && row.payDate < range.gte) return false;
            if (range.lte && row.payDate > range.lte) return false;
            if (range.lt && row.payDate >= range.lt) return false;
            return true;
          })
        );
        prisma.payStub.update = jest.fn(({ where, data }: any) => {
          const row = rows.find((r) => r.id === where.id);
          Object.assign(row, data);
          return row;
        });
        prisma.payStub.findUnique = jest.fn(({ where }: any) =>
          rows.find((row) => row.id === where.id)
        );
        return rows;
      };

      const stubOn = (payDate: string, extra: any = {}) => ({
        ...baseDto,
        payDate,
        periodStart: payDate,
        periodEnd: payDate,
        regularAmount: 1000,
        eiAmount: 0,
        cppAmount: 0,
        ...extra,
      });

      it('carries December vacation into a February payout', async () => {
        const rows = useStore();

        // Earned in December, banked: 4% of 1000.
        await service.create(stubOn('2025-12-31') as any, accountant.id);
        // Taken the following February, out of last year's bank.
        await service.create(
          stubOn('2026-02-15', { vacationPayPaidOut: 40 }) as any,
          accountant.id
        );

        const february = rows.find((row) => row.id === 'stub-2');
        // 40 banked in December + 40 accrued in February - 40 paid out.
        expect(Number(february.vacationPayBalance)).toBe(40);
      });

      it('refuses to pay out more than last year left behind', async () => {
        useStore();
        await service.create(stubOn('2025-12-31') as any, accountant.id);

        await expect(
          service.create(
            stubOn('2026-02-15', { vacationPayPaidOut: 100 }) as any,
            accountant.id
          )
        ).rejects.toBeInstanceOf(BadRequestException);
      });

      it('keeps the year-to-date column resetting even though the bank does not', async () => {
        const rows = useStore();
        await service.create(stubOn('2025-12-31') as any, accountant.id);
        await service.create(stubOn('2026-02-15') as any, accountant.id);

        const february = rows.find((row) => row.id === 'stub-2');
        // YTD restarts in January; the bank carries on.
        expect(Number(february.ytdVacationPayAmount)).toBe(40);
        expect(Number(february.vacationPayBalance)).toBe(80);
      });
    });

    it('leaves stubs with no payout completely unchanged', async () => {
      withBank(0);

      const result = await service.create(baseDto as any, accountant.id);

      expect(result.vacationPayPaidOut).toBe(0);
      expect(result.netPay).toBe(2854.96);
    });
  });
});
