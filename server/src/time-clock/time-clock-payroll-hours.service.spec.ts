import { TimeClockService } from './time-clock.service';

/**
 * Unit tests for the read-only payroll hours calculation.
 *
 * The guarantee under test is the one that makes pay stub pre-fill safe:
 * reading an employee's hours must never mark their time entries as processed.
 * processPayroll() does stamp them, and both paths share one calculation, so
 * these tests pin down which behaviour belongs to which entry point.
 */
describe('TimeClockService payroll hours', () => {
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

  // Two approved 8-hour entries, one already put through payroll.
  const entries = [
    {
      id: 'te-1',
      employeeId: 'emp-1',
      clockInAt: new Date('2026-01-05T17:00:00.000Z'),
      clockOutAt: new Date('2026-01-06T01:00:00.000Z'),
      status: 'APPROVED',
      payrollProcessedAt: null,
      breaks: [],
      employee,
    },
    {
      id: 'te-2',
      employeeId: 'emp-1',
      clockInAt: new Date('2026-01-06T17:00:00.000Z'),
      clockOutAt: new Date('2026-01-07T01:00:00.000Z'),
      status: 'PROCESSED',
      payrollProcessedAt: new Date('2026-01-08T00:00:00.000Z'),
      breaks: [],
      employee,
    },
  ];

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(employee),
        findMany: jest.fn().mockResolvedValue([employee]),
      },
      timeEntry: {
        findMany: jest.fn(({ where }: any) =>
          Promise.resolve(
            where.payrollProcessedAt === null
              ? entries.filter((entry) => !entry.payrollProcessedAt)
              : entries
          )
        ),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn((args: any) => ({ ...entries[0], ...args.data })),
        delete: jest.fn(),
      },
      employeeCompensation: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ payType: 'HOURLY', hourlyRate: 24 }),
      },
    };
    auditRepository = { create: jest.fn() };

    service = new TimeClockService(prisma, auditRepository);
  });

  describe('getPayrollHours', () => {
    it('never stamps entries as processed', async () => {
      await service.getPayrollHours(
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.000Z',
        'emp-1'
      );

      expect(prisma.timeEntry.updateMany).not.toHaveBeenCalled();
      expect(auditRepository.create).not.toHaveBeenCalled();
    });

    it('counts approved entries whether or not payroll has processed them', async () => {
      const [row] = await service.getPayrollHours(
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.000Z',
        'emp-1'
      );

      // A stub describes the period, so it must not collapse to the unprocessed
      // subset just because payroll happened to run first.
      expect(row.hours).toBe(16);
      expect(row.processedHours).toBe(8);
      expect(row.grossPay).toBe(384);
    });

    it('carries the employee summary so callers need no access to the user list', async () => {
      const [row] = await service.getPayrollHours(
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.000Z',
        'emp-1'
      );

      expect(row.employee).toEqual(
        expect.objectContaining({ id: 'emp-1', firstName: 'Rohit' })
      );
    });

    it('prorates an annual salary instead of reporting $0 gross for salaried staff', async () => {
      prisma.employeeCompensation.findFirst.mockResolvedValue({
        payType: 'SALARIED',
        annualSalary: 73000,
      });

      const [row] = await service.getPayrollHours(
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T00:00:00.000Z',
        'emp-1'
      );

      expect(row.hourlyRate).toBe(0);
      expect(row.salaryPay).toBeGreaterThan(0);
      expect(row.grossPay).toBe(row.salaryPay);
    });

    it('reports when an employee has no active compensation record', async () => {
      prisma.employeeCompensation.findFirst.mockResolvedValue(null);

      const [row] = await service.getPayrollHours(
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.000Z',
        'emp-1'
      );

      expect(row.hasCompensation).toBe(false);
      expect(row.grossPay).toBe(0);
    });
  });

  describe('processPayroll', () => {
    it('consumes only unprocessed entries and stamps them', async () => {
      const result = await service.processPayroll(
        {
          employeeId: 'emp-1',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-01-31T23:59:59.000Z',
        } as any,
        'admin-1'
      );

      // Only te-1 is unprocessed, so payroll must not pay te-2 a second time.
      expect(result.processedHours).toBe(8);
      expect(prisma.timeEntry.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['te-1'] } },
        })
      );
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PROCESS_PAYROLL_HOURS' })
      );
    });

    it('moves processed entries onto the terminal status', async () => {
      await service.processPayroll(
        {
          employeeId: 'emp-1',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-01-31T23:59:59.000Z',
        } as any,
        'admin-1'
      );

      // A paid entry should not still read as merely approved.
      const [[{ data }]] = prisma.timeEntry.updateMany.mock.calls;
      expect(data.status).toBe('PROCESSED');
      expect(data.payrollProcessedAt).toBeInstanceOf(Date);
      expect(data.payrollProcessedBy).toBe('admin-1');
    });
  });

  describe('a processed entry is final', () => {
    // The record behind money that has already left the business.
    const processed = {
      id: 'te-2',
      employeeId: 'emp-1',
      clockInAt: new Date('2026-01-06T17:00:00.000Z'),
      clockOutAt: new Date('2026-01-07T01:00:00.000Z'),
      status: 'PROCESSED',
      payrollProcessedAt: new Date('2026-01-08T00:00:00.000Z'),
      breaks: [],
      employee,
    };

    beforeEach(() => {
      prisma.timeEntry.findUnique.mockResolvedValue(processed);
    });

    const rejected = async (run: () => Promise<unknown>) => {
      await expect(run()).rejects.toThrow(/already been processed for payroll/);
      expect(prisma.timeEntry.update).not.toHaveBeenCalled();
      expect(prisma.timeEntry.delete).not.toHaveBeenCalled();
    };

    it('cannot be edited', async () => {
      await rejected(() =>
        service.updateEntry(
          'te-2',
          {
            clockOutAt: '2026-01-07T02:00:00.000Z',
            adjustmentReason: 'fix',
          } as any,
          'admin-1'
        )
      );
    });

    it('cannot be voided', async () => {
      await rejected(() => service.voidEntry('te-2', 'admin-1', 'mistake'));
    });

    it('cannot be deleted', async () => {
      await rejected(() => service.deleteEntry('te-2', 'admin-1'));
    });

    it('cannot be unapproved', async () => {
      await rejected(() => service.unapproveEntry('te-2', 'admin-1'));
    });

    it('cannot be re-approved', async () => {
      await rejected(() => service.approveEntry('te-2', 'admin-1'));
    });
  });
});
