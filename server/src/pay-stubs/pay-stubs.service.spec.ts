import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
        findFirst: jest
          .fn()
          .mockResolvedValue({ payType: 'HOURLY', hourlyRate: 24 }),
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

    it('scopes the year-to-date query to the pay date calendar year', async () => {
      await service.create(baseDto as any, accountant.id);

      expect(prisma.payStub.findMany).toHaveBeenCalledWith({
        where: {
          employeeId: 'emp-1',
          payDate: {
            gte: new Date(Date.UTC(2026, 0, 1)),
            lt: new Date(Date.UTC(2027, 0, 1)),
          },
        },
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
});
