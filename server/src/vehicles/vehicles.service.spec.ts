import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

/**
 * Unit tests for VehiclesService.
 * The service is instantiated directly with mocked collaborators (no Nest DI).
 */
describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehicleRepository: any;
  let customerRepository: any;
  let auditRepository: any;
  let prisma: any;

  beforeEach(() => {
    vehicleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByVin: jest.fn(),
      findOneWithDetails: jest.fn(),
      findAllWithDetails: jest.fn(),
      findByCustomer: jest.fn(),
      getVehicleStats: jest.fn(),
      search: jest.fn(),
    };
    customerRepository = { findById: jest.fn() };
    auditRepository = { create: jest.fn().mockResolvedValue({}) };
    prisma = {
      vehicleMake: { findMany: jest.fn() },
      invoice: { count: jest.fn() },
      appointment: { count: jest.fn() },
    };

    service = new VehiclesService(
      vehicleRepository as any,
      customerRepository as any,
      auditRepository as any,
      prisma as any
    );
  });

  describe('getMakesWithModels', () => {
    it('maps makes and their models into flat name/models structures', async () => {
      prisma.vehicleMake.findMany.mockResolvedValue([
        { name: 'Toyota', models: [{ name: 'Corolla' }, { name: 'Camry' }] },
        { name: 'Honda', models: [] },
      ]);

      const result = await service.getMakesWithModels();

      expect(result).toEqual([
        { name: 'Toyota', models: ['Corolla', 'Camry'] },
        { name: 'Honda', models: [] },
      ]);
    });
  });

  describe('create', () => {
    it('throws NotFoundException when the customer does not exist', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({ customerId: 'missing' } as any, 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException for CUSTOMER role', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });

      await expect(
        service.create({ customerId: 'c1' } as any, 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException for a duplicate VIN', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      vehicleRepository.findByVin.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create(
          { customerId: 'c1', vin: 'VIN123' } as any,
          'user-1',
          'ADMIN'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates the vehicle, logs the action and returns details', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      vehicleRepository.findByVin.mockResolvedValue(null);
      vehicleRepository.create.mockResolvedValue({ id: 'v1' });
      vehicleRepository.findOneWithDetails.mockResolvedValue({
        id: 'v1',
        make: 'Toyota',
      });

      const result = await service.create(
        {
          customerId: 'c1',
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
        } as any,
        'user-1',
        'ADMIN'
      );

      expect(vehicleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: { connect: { id: 'c1' } },
          make: 'Toyota',
        })
      );
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE_VEHICLE', entityId: 'v1' })
      );
      expect(result).toEqual({ id: 'v1', make: 'Toyota' });
    });
  });

  describe('findAll', () => {
    it('throws ForbiddenException for CUSTOMER role', async () => {
      await expect(
        service.findAll('user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns all vehicles for staff/admin', async () => {
      vehicleRepository.findAllWithDetails.mockResolvedValue([{ id: 'v1' }]);

      const result = await service.findAll('user-1', 'STAFF');

      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('findByCustomer', () => {
    it('throws NotFoundException when the customer does not exist', async () => {
      customerRepository.findById.mockResolvedValue(null);

      await expect(
        service.findByCustomer('missing', 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException for CUSTOMER role', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });

      await expect(
        service.findByCustomer('c1', 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns vehicles for the customer', async () => {
      customerRepository.findById.mockResolvedValue({ id: 'c1' });
      vehicleRepository.findByCustomer.mockResolvedValue([{ id: 'v1' }]);

      const result = await service.findByCustomer('c1', 'user-1', 'STAFF');

      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the vehicle does not exist', async () => {
      vehicleRepository.findOneWithDetails.mockResolvedValue(null);

      await expect(
        service.findOne('missing', 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException for CUSTOMER role', async () => {
      vehicleRepository.findOneWithDetails.mockResolvedValue({ id: 'v1' });

      await expect(
        service.findOne('v1', 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns the vehicle with stats', async () => {
      vehicleRepository.findOneWithDetails.mockResolvedValue({ id: 'v1' });
      vehicleRepository.getVehicleStats.mockResolvedValue({ invoiceCount: 3 });

      const result = await service.findOne('v1', 'user-1', 'STAFF');

      expect(result).toEqual({ id: 'v1', stats: { invoiceCount: 3 } });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the vehicle does not exist', async () => {
      vehicleRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', {} as any, 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException for CUSTOMER role', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1' });

      await expect(
        service.update('v1', {} as any, 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when changing to a VIN already in use', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1', vin: 'OLD' });
      vehicleRepository.findByVin.mockResolvedValue({ id: 'other' });

      await expect(
        service.update('v1', { vin: 'NEW' } as any, 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates and logs, then returns details', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1', vin: 'OLD' });
      vehicleRepository.update.mockResolvedValue({ id: 'v1', make: 'Honda' });
      vehicleRepository.findOneWithDetails.mockResolvedValue({
        id: 'v1',
        make: 'Honda',
      });

      const result = await service.update(
        'v1',
        { make: 'Honda' } as any,
        'user-1',
        'ADMIN'
      );

      expect(vehicleRepository.update).toHaveBeenCalledWith('v1', {
        make: 'Honda',
      });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE_VEHICLE', resourceId: 'v1' })
      );
      expect(result).toEqual({ id: 'v1', make: 'Honda' });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the vehicle does not exist', async () => {
      vehicleRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove('missing', 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException for CUSTOMER role', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1' });

      await expect(
        service.remove('v1', 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ForbiddenException for non-admin staff', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1' });

      await expect(
        service.remove('v1', 'user-1', 'STAFF')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when the vehicle has service history', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1' });
      prisma.invoice.count.mockResolvedValue(1);
      prisma.appointment.count.mockResolvedValue(0);

      await expect(
        service.remove('v1', 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(vehicleRepository.delete).not.toHaveBeenCalled();
    });

    it('deletes and logs when no service history exists', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1' });
      prisma.invoice.count.mockResolvedValue(0);
      prisma.appointment.count.mockResolvedValue(0);
      vehicleRepository.delete.mockResolvedValue({});

      const result = await service.remove('v1', 'user-1', 'ADMIN');

      expect(vehicleRepository.delete).toHaveBeenCalledWith('v1');
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE_VEHICLE' })
      );
      expect(result).toEqual({ message: 'Vehicle deleted successfully' });
    });
  });

  describe('search', () => {
    it('throws ForbiddenException for CUSTOMER role (after fetching)', async () => {
      vehicleRepository.search.mockResolvedValue([]);

      await expect(
        service.search('term', 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns search results for staff/admin', async () => {
      vehicleRepository.search.mockResolvedValue([{ id: 'v1' }]);

      const result = await service.search('term', 'user-1', 'ADMIN');

      expect(vehicleRepository.search).toHaveBeenCalledWith('term');
      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('updateMileage', () => {
    it('throws NotFoundException when the vehicle does not exist', async () => {
      vehicleRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateMileage('missing', 1000, 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when mileage would decrease', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1', mileage: 5000 });

      await expect(
        service.updateMileage('v1', 4000, 'user-1', 'ADMIN')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws ForbiddenException for CUSTOMER role', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1', mileage: 1000 });

      await expect(
        service.updateMileage('v1', 2000, 'user-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('updates mileage and logs the action', async () => {
      vehicleRepository.findById.mockResolvedValue({ id: 'v1', mileage: 1000 });
      vehicleRepository.update.mockResolvedValue({ id: 'v1', mileage: 2000 });

      const result = await service.updateMileage('v1', 2000, 'user-1', 'ADMIN');

      expect(vehicleRepository.update).toHaveBeenCalledWith('v1', {
        mileage: 2000,
      });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE_VEHICLE_MILEAGE' })
      );
      expect(result).toEqual({ id: 'v1', mileage: 2000 });
    });
  });
});
