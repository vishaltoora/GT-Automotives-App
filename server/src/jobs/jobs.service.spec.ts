import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { JobsService } from './jobs.service';

/**
 * Unit tests for JobsService. Service is instantiated directly with mocked
 * repositories. The job repository exposes a `prisma` property accessed via
 * bracket notation in create(), so we mock that too.
 */
describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: any;
  let auditRepository: any;
  let userFindUnique: jest.Mock;

  beforeEach(() => {
    userFindUnique = jest.fn();
    jobRepository = {
      prisma: { user: { findUnique: userFindUnique } },
      create: jest.fn(),
      findWithFilters: jest.fn(),
      findById: jest.fn(),
      findByEmployee: jest.fn(),
      findPendingJobs: jest.fn(),
      findReadyForPayment: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      getJobSummary: jest.fn(),
    };
    auditRepository = { create: jest.fn().mockResolvedValue({}) };
    service = new JobsService(jobRepository as any, auditRepository as any);
  });

  describe('create', () => {
    it('throws NotFoundException when the employee does not exist', async () => {
      userFindUnique.mockResolvedValue(null);
      await expect(
        service.create({ employeeId: 'e1' } as any, 'u1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when employee role is not allowed', async () => {
      userFindUnique.mockResolvedValue({
        id: 'e1',
        role: { name: 'CUSTOMER' },
      });
      await expect(
        service.create({ employeeId: 'e1' } as any, 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a job for a STAFF employee and writes an audit log', async () => {
      userFindUnique.mockResolvedValue({ id: 'e1', role: { name: 'STAFF' } });
      jobRepository.create.mockResolvedValue({ id: 'job-1' });

      const result = await service.create(
        {
          employeeId: 'e1',
          title: 'Oil change',
          payAmount: 100,
          dueDate: '2025-01-01',
        } as any,
        'u1'
      );

      expect(result).toEqual({ id: 'job-1' });
      const createArg = jobRepository.create.mock.calls[0][0];
      expect(createArg.employee).toEqual({ connect: { id: 'e1' } });
      expect(createArg.dueDate).toBeInstanceOf(Date);
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          resource: 'Job',
          resourceId: 'job-1',
        })
      );
    });

    it('connects an appointment when appointmentId provided', async () => {
      userFindUnique.mockResolvedValue({ id: 'e1', role: { name: 'ADMIN' } });
      jobRepository.create.mockResolvedValue({ id: 'job-2' });

      await service.create(
        { employeeId: 'e1', appointmentId: 'a1' } as any,
        'u1'
      );
      const createArg = jobRepository.create.mock.calls[0][0];
      expect(createArg.appointment).toEqual({ connect: { id: 'a1' } });
    });

    it('wraps unexpected repository errors in BadRequestException', async () => {
      userFindUnique.mockResolvedValue({ id: 'e1', role: { name: 'STAFF' } });
      jobRepository.create.mockRejectedValue(new Error('db down'));
      await expect(
        service.create({ employeeId: 'e1' } as any, 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      jobRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('transforms payAmount to a number and maps relations', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        jobNumber: 'J-1',
        employeeId: 'e1',
        appointmentId: null,
        title: 't',
        description: 'd',
        payAmount: { toString: () => '99.5' },
        status: JobStatus.PENDING,
        jobType: 'GENERAL',
        employee: { id: 'e1', firstName: 'A', lastName: 'B', email: 'x@y.z' },
        payments: [
          {
            id: 'p1',
            amount: { toString: () => '10' },
            status: 'PAID',
            paidAt: null,
            paymentMethod: 'CASH',
          },
        ],
      });

      const result = await service.findOne('job-1');
      expect(result.payAmount).toBe(99.5);
      expect(result.appointmentId).toBeUndefined();
      expect(result.employee).toEqual({
        id: 'e1',
        firstName: 'A',
        lastName: 'B',
        email: 'x@y.z',
      });
      expect(result.payments?.[0].amount).toBe(10);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when job missing', async () => {
      jobRepository.findById.mockResolvedValue(null);
      await expect(service.update('x', {} as any, 'u1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('only sets provided fields and converts date strings', async () => {
      jobRepository.findById.mockResolvedValue({ id: 'job-1' });
      jobRepository.update.mockResolvedValue({ id: 'job-1' });

      await service.update(
        'job-1',
        { title: 'new', dueDate: '2025-06-01' } as any,
        'u1'
      );
      const updateArg = jobRepository.update.mock.calls[0][1];
      expect(updateArg.title).toBe('new');
      expect(updateArg.dueDate).toBeInstanceOf(Date);
      expect(updateArg).not.toHaveProperty('payAmount');
    });
  });

  describe('markAsComplete', () => {
    it('throws NotFoundException when missing', async () => {
      jobRepository.findById.mockResolvedValue(null);
      await expect(service.markAsComplete('x', 'u1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequestException when job is PAID', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PAID,
      });
      await expect(
        service.markAsComplete('job-1', 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sets status to READY with a completedAt date', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PENDING,
      });
      jobRepository.updateStatus.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.READY,
      });

      await service.markAsComplete('job-1', 'u1');
      const [id, status, date] = jobRepository.updateStatus.mock.calls[0];
      expect(id).toBe('job-1');
      expect(status).toBe(JobStatus.READY);
      expect(date).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when missing', async () => {
      jobRepository.findById.mockResolvedValue(null);
      await expect(service.remove('x', 'u1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequestException when job is PAID', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PAID,
      });
      await expect(service.remove('job-1', 'u1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('deletes a non-paid job and logs audit', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PENDING,
      });
      jobRepository.delete.mockResolvedValue(undefined);
      await service.remove('job-1', 'u1');
      expect(jobRepository.delete).toHaveBeenCalledWith('job-1');
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', resource: 'Job' })
      );
    });
  });

  describe('thin pass-throughs', () => {
    it('getJobSummary delegates to the repository', async () => {
      jobRepository.getJobSummary.mockResolvedValue({ total: 3 });
      const result = await service.getJobSummary('e1');
      expect(jobRepository.getJobSummary).toHaveBeenCalledWith('e1');
      expect(result).toEqual({ total: 3 });
    });
  });
});
