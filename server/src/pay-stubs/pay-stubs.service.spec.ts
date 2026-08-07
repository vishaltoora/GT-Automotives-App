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

    service = new PayStubsService(prisma, pdfService, auditRepository);
  });

  describe('create', () => {
    it('derives withholding total and net pay rather than trusting the client', async () => {
      const result = await service.create(baseDto as any, accountant.id);

      expect(result.grossPay).toBe(3072);
      expect(result.totalWithholding).toBe(217.04);
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
          grossPay: 3072,
          eiAmount: 50.08,
          cppAmount: 166.96,
          incomeTaxAmount: 0,
          otherDeductions: 0,
          totalWithholding: 217.04,
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
      expect(result.ytdGrossPay).toBe(6144);
      expect(result.ytdEiAmount).toBe(100.16);
      expect(result.ytdCppAmount).toBe(333.92);
      expect(result.ytdWithholding).toBe(434.08);
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
          let out = rows.filter(
            (row) =>
              row.employeeId === where.employeeId &&
              row.payDate >= where.payDate.gte &&
              (where.payDate.lte
                ? row.payDate <= where.payDate.lte
                : row.payDate < where.payDate.lt)
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

      /** $1,000 gross, no deductions, so the running totals are easy to read. */
      const stubFor = (payDate: string) => ({
        ...baseDto,
        payDate,
        periodStart: payDate,
        periodEnd: payDate,
        regularHours: 40,
        regularAmount: 1000,
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

      const years = prisma.payStub.findMany.mock.calls.map(([args]: any) =>
        args.where.payDate.gte.getUTCFullYear()
      );
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
});
