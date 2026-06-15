import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JobStatus, PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';

/**
 * Unit tests for PaymentsService. Service is instantiated directly with mocked
 * repositories. Focus: job validation branches, payment-amount-vs-job-amount
 * math, status guards, and the transformToResponseDto mapping.
 *
 * Note: getByPaymentDate is skipped — it issues a raw SQL $queryRaw against
 * paymentRepository['prisma'] and dynamically imports timezone config, which is
 * an external-system concern beyond unit-test scope.
 */
describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: any;
  let jobRepository: any;
  let auditRepository: any;

  beforeEach(() => {
    paymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findWithFilters: jest.fn(),
      findByEmployee: jest.fn(),
      findByJob: jest.fn(),
      findPendingPayments: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getPaymentSummary: jest.fn(),
      getPayrollReport: jest.fn(),
    };
    jobRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    auditRepository = { create: jest.fn().mockResolvedValue({}) };
    service = new PaymentsService(
      paymentRepository as any,
      jobRepository as any,
      auditRepository as any
    );
  });

  describe('create', () => {
    it('throws NotFoundException when job not found', async () => {
      jobRepository.findById.mockResolvedValue(null);
      await expect(
        service.create(
          { jobId: 'j1', employeeId: 'e1', amount: 10 } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when job is cancelled', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.CANCELLED,
        employeeId: 'e1',
        payAmount: 100,
      });
      await expect(
        service.create(
          { jobId: 'j1', employeeId: 'e1', amount: 10 } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when employee does not match the job', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.READY,
        employeeId: 'other',
        payAmount: 100,
      });
      await expect(
        service.create(
          { jobId: 'j1', employeeId: 'e1', amount: 10 } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when amount exceeds the job amount', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.READY,
        employeeId: 'e1',
        payAmount: 50,
      });
      await expect(
        service.create(
          { jobId: 'j1', employeeId: 'e1', amount: 60 } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a PENDING payment and logs audit on the happy path', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.READY,
        employeeId: 'e1',
        payAmount: 100,
      });
      paymentRepository.create.mockResolvedValue({ id: 'pay-1' });

      const result = await service.create(
        {
          jobId: 'j1',
          employeeId: 'e1',
          amount: 40,
          paymentMethod: 'CASH',
        } as any,
        'u1'
      );

      expect(result).toEqual({ id: 'pay-1' });
      const createArg = paymentRepository.create.mock.calls[0][0];
      expect(createArg.status).toBe(PaymentStatus.PENDING);
      expect(createArg.job).toEqual({ connect: { id: 'j1' } });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          resource: 'Payment',
          resourceId: 'pay-1',
        })
      );
    });
  });

  describe('processPayment', () => {
    it('throws NotFoundException when job missing', async () => {
      jobRepository.findById.mockResolvedValue(null);
      await expect(
        service.processPayment(
          { jobId: 'j1', paymentMethod: 'CASH' } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when job is not READY', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.PENDING,
        employeeId: 'e1',
        payAmount: 100,
      });
      await expect(
        service.processPayment(
          { jobId: 'j1', paymentMethod: 'CASH' } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when supplied amount exceeds job amount', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.READY,
        employeeId: 'e1',
        payAmount: 100,
      });
      await expect(
        service.processPayment(
          { jobId: 'j1', paymentMethod: 'CASH', amount: 200 } as any,
          'u1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('marks job PAID when full amount paid and creates a PAID payment', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.READY,
        employeeId: 'e1',
        payAmount: 100,
      });
      paymentRepository.create.mockResolvedValue({ id: 'pay-1' });

      await service.processPayment(
        { jobId: 'j1', paymentMethod: 'CASH' } as any,
        'u1'
      );

      const createArg = paymentRepository.create.mock.calls[0][0];
      expect(createArg.amount).toBe(100); // defaults to full job amount
      expect(createArg.status).toBe(PaymentStatus.PAID);
      expect(createArg.paidAt).toBeDefined();
      expect(jobRepository.updateStatus).toHaveBeenCalledWith(
        'j1',
        JobStatus.PAID
      );
    });

    it('marks job PARTIALLY_PAID when a partial amount is paid', async () => {
      jobRepository.findById.mockResolvedValue({
        status: JobStatus.READY,
        employeeId: 'e1',
        payAmount: 100,
      });
      paymentRepository.create.mockResolvedValue({ id: 'pay-1' });

      await service.processPayment(
        { jobId: 'j1', paymentMethod: 'CASH', amount: 40 } as any,
        'u1'
      );
      expect(jobRepository.updateStatus).toHaveBeenCalledWith(
        'j1',
        JobStatus.PARTIALLY_PAID
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when missing', async () => {
      paymentRepository.findById.mockResolvedValue(null);
      await expect(service.update('x', {} as any, 'u1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequestException when the payment is already PAID', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PAID,
      });
      await expect(
        service.update('p1', { amount: 5 } as any, 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates only provided fields and converts paidAt', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PENDING,
      });
      paymentRepository.update.mockResolvedValue({ id: 'p1' });

      await service.update(
        'p1',
        { amount: 25, paidAt: '2025-01-01T00:00:00Z' } as any,
        'u1'
      );
      const updateArg = paymentRepository.update.mock.calls[0][1];
      expect(updateArg.amount).toBe(25);
      expect(updateArg.paidAt).toBeInstanceOf(Date);
      expect(updateArg).not.toHaveProperty('status');
    });
  });

  describe('revertPaymentStatus', () => {
    it('throws NotFoundException when missing', async () => {
      paymentRepository.findById.mockResolvedValue(null);
      await expect(
        service.revertPaymentStatus('x', 'u1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when payment is not PAID', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PENDING,
      });
      await expect(
        service.revertPaymentStatus('p1', 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reverts to PENDING, clears paidAt and resets the job to READY', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PAID,
        jobId: 'j1',
      });
      paymentRepository.update.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PENDING,
      });

      await service.revertPaymentStatus('p1', 'u1');
      const updateArg = paymentRepository.update.mock.calls[0][1];
      expect(updateArg.status).toBe(PaymentStatus.PENDING);
      expect(updateArg.paidAt).toBeNull();
      expect(jobRepository.updateStatus).toHaveBeenCalledWith(
        'j1',
        JobStatus.READY
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when missing', async () => {
      paymentRepository.findById.mockResolvedValue(null);
      await expect(service.remove('x', 'u1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequestException when payment is PAID', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PAID,
      });
      await expect(service.remove('p1', 'u1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('deletes a non-paid payment and logs audit', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        status: PaymentStatus.PENDING,
      });
      paymentRepository.delete.mockResolvedValue(undefined);
      await service.remove('p1', 'u1');
      expect(paymentRepository.delete).toHaveBeenCalledWith('p1');
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', resource: 'Payment' })
      );
    });
  });

  describe('findOne / transformToResponseDto', () => {
    it('throws NotFoundException when missing', async () => {
      paymentRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('maps amount to a number and includes job/employee relations', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        jobId: 'j1',
        employeeId: 'e1',
        amount: { toString: () => '12.5' },
        paymentMethod: 'CASH',
        status: PaymentStatus.PAID,
        paidAt: null,
        job: { id: 'j1', jobNumber: 'J-1', title: 't', status: JobStatus.PAID },
        employee: { id: 'e1', firstName: 'A', lastName: 'B', email: 'a@b.c' },
      });

      const result = await service.findOne('p1');
      expect(result.amount).toBe(12.5);
      expect(result.job).toEqual({
        id: 'j1',
        jobNumber: 'J-1',
        title: 't',
        status: JobStatus.PAID,
      });
      expect(result.employee?.firstName).toBe('A');
    });

    it('leaves job/employee undefined when relations absent', async () => {
      paymentRepository.findById.mockResolvedValue({
        id: 'p1',
        amount: { toString: () => '5' },
        paymentMethod: 'CASH',
        status: PaymentStatus.PENDING,
      });
      const result = await service.findOne('p1');
      expect(result.job).toBeUndefined();
      expect(result.employee).toBeUndefined();
    });
  });

  describe('thin pass-throughs', () => {
    it('getPaymentSummary delegates to the repository', async () => {
      paymentRepository.getPaymentSummary.mockResolvedValue({ total: 1 });
      const result = await service.getPaymentSummary('e1');
      expect(paymentRepository.getPaymentSummary).toHaveBeenCalledWith('e1');
      expect(result).toEqual({ total: 1 });
    });

    it('getPayrollReport converts dates and delegates', async () => {
      paymentRepository.getPayrollReport.mockResolvedValue({ rows: [] });
      await service.getPayrollReport('2025-01-01', '2025-01-31', 'e1');
      const [start, end, emp] =
        paymentRepository.getPayrollReport.mock.calls[0];
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(emp).toBe('e1');
    });
  });
});
