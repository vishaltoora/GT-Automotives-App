import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';

/**
 * Unit tests for CustomersService.
 * The service is instantiated directly with mocked collaborators (no Nest DI).
 */
describe('CustomersService', () => {
  let service: CustomersService;
  let customerRepository: any;
  let auditRepository: any;
  let prisma: any;

  beforeEach(() => {
    customerRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findOneWithDetails: jest.fn(),
      findAllWithDetails: jest.fn(),
      getAllCustomerStats: jest.fn(),
      getCustomerStats: jest.fn(),
      search: jest.fn(),
    };
    auditRepository = { create: jest.fn().mockResolvedValue({}) };
    prisma = {
      customer: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      smsPreference: {
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
      },
      invoice: { count: jest.fn() },
      appointment: { count: jest.fn() },
    };

    service = new CustomersService(
      customerRepository as any,
      auditRepository as any,
      prisma as any
    );
  });

  describe('create', () => {
    it('throws BadRequestException when a customer with the same email exists', async () => {
      customerRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create(
          { firstName: 'A', lastName: 'B', email: 'a@b.com' } as any,
          'user-1'
        )
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('creates a customer and logs the action', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);
      const created = {
        id: 'cust-1',
        firstName: 'A',
        lastName: 'B',
        phone: null,
      };
      prisma.customer.create.mockResolvedValue(created);

      const result = await service.create(
        { firstName: 'A', lastName: 'B', email: 'a@b.com' } as any,
        'user-1'
      );

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
        }),
      });
      // No phone -> no SMS preference created
      expect(prisma.smsPreference.create).not.toHaveBeenCalled();
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE_CUSTOMER',
          entityId: 'cust-1',
        })
      );
      expect(result).toBe(created);
    });

    it('creates SMS preferences when the customer has a phone number', async () => {
      customerRepository.findByEmail.mockResolvedValue(null);
      prisma.customer.create.mockResolvedValue({
        id: 'cust-2',
        phone: '5551234567',
      });

      await service.create(
        { firstName: 'A', lastName: 'B', phone: '5551234567' } as any,
        'user-1'
      );

      expect(prisma.smsPreference.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customer: { connect: { id: 'cust-2' } },
            optedIn: true,
            promotional: false,
          }),
        })
      );
    });

    it('does not check email when none is provided', async () => {
      prisma.customer.create.mockResolvedValue({ id: 'cust-3', phone: null });

      await service.create({ firstName: 'A', lastName: 'B' } as any, 'user-1');

      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('merges per-customer stats from the stats map', async () => {
      customerRepository.findAllWithDetails.mockResolvedValue([
        { id: 'c1' },
        { id: 'c2' },
      ]);
      const statsMap = new Map([['c1', { totalSpent: 100, vehicleCount: 2 }]]);
      customerRepository.getAllCustomerStats.mockResolvedValue(statsMap);

      const result = await service.findAll('user-1', 'ADMIN');

      expect(result[0].stats).toEqual({ totalSpent: 100, vehicleCount: 2 });
      // c2 falls back to default stats
      expect(result[1].stats).toEqual(
        expect.objectContaining({
          totalSpent: 0,
          vehicleCount: 0,
          lastVisitDate: null,
        })
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the customer does not exist', async () => {
      customerRepository.findOneWithDetails.mockResolvedValue(null);

      await expect(
        service.findOne('missing', 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the customer with its stats', async () => {
      customerRepository.findOneWithDetails.mockResolvedValue({
        id: 'c1',
        firstName: 'A',
      });
      customerRepository.getCustomerStats.mockResolvedValue({ totalSpent: 50 });

      const result = await service.findOne('c1', 'user-1', 'ADMIN');

      expect(result).toEqual({
        id: 'c1',
        firstName: 'A',
        stats: { totalSpent: 50 },
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the customer does not exist', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { firstName: 'X' } as any, 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates the customer and logs the change', async () => {
      customerRepository.findById.mockResolvedValue({
        id: 'c1',
        firstName: 'Old',
      });
      prisma.customer.update.mockResolvedValue({
        id: 'c1',
        firstName: 'New',
        phone: null,
      });

      const result = await service.update(
        'c1',
        { firstName: 'New' } as any,
        'user-1',
        'ADMIN'
      );

      expect(prisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'c1' } })
      );
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE_CUSTOMER', entityId: 'c1' })
      );
      expect(result.firstName).toBe('New');
    });

    it('updates existing SMS preferences when present and a phone exists', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      prisma.customer.update.mockResolvedValue({
        id: 'c1',
        phone: '5551234567',
      });
      prisma.smsPreference.findUnique.mockResolvedValue({ customerId: 'c1' });

      await service.update(
        'c1',
        { smsOptedIn: false } as any,
        'user-1',
        'ADMIN'
      );

      expect(prisma.smsPreference.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 'c1' },
          data: expect.objectContaining({ optedIn: false }),
        })
      );
    });

    it('creates SMS preferences when none exist yet and a phone exists', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      prisma.customer.update.mockResolvedValue({
        id: 'c1',
        phone: '5551234567',
      });
      prisma.smsPreference.findUnique.mockResolvedValue(null);

      await service.update(
        'c1',
        { smsServiceUpdates: false } as any,
        'user-1',
        'ADMIN'
      );

      expect(prisma.smsPreference.create).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the customer does not exist', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequestException when the customer has invoices', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      prisma.invoice.count.mockResolvedValue(2);
      prisma.appointment.count.mockResolvedValue(0);

      await expect(service.remove('c1', 'user-1')).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(prisma.customer.delete).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the customer has appointments', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      prisma.invoice.count.mockResolvedValue(0);
      prisma.appointment.count.mockResolvedValue(1);

      await expect(service.remove('c1', 'user-1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('deletes the customer and logs the action when no dependents exist', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      prisma.invoice.count.mockResolvedValue(0);
      prisma.appointment.count.mockResolvedValue(0);
      prisma.customer.delete.mockResolvedValue({});

      const result = await service.remove('c1', 'user-1');

      expect(prisma.customer.delete).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE_CUSTOMER' })
      );
      expect(result).toEqual({ message: 'Customer deleted successfully' });
    });
  });

  describe('search', () => {
    it('delegates to the repository', async () => {
      customerRepository.search.mockResolvedValue([{ id: 'c1' }]);

      const result = await service.search('term', 'user-1', 'ADMIN');

      expect(customerRepository.search).toHaveBeenCalledWith('term');
      expect(result).toEqual([{ id: 'c1' }]);
    });
  });

  describe('findAllSimple', () => {
    it('queries customers with the lightweight projection', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: 'c1' }]);

      const result = await service.findAllSimple();

      expect(prisma.customer.findMany).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'c1' }]);
    });
  });
});
