import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TiresService } from './tires.service';

/**
 * Unit tests for TiresService. Service is instantiated directly with mocked
 * collaborators (tire repository, audit repository, prisma). Focus areas:
 * role/permission guards, stock-adjustment validation, formatSingleTireResponse
 * (cost hiding, isLowStock, Decimal->number), find-or-create + duplicate
 * branches in create, and the brand/size/location delete guards.
 *
 * Skipped: the Clerk/email/PDF-style external concerns are not present here;
 * all branches are covered with mocks.
 */
describe('TiresService', () => {
  let service: TiresService;
  let tireRepository: any;
  let auditRepository: any;
  let prisma: any;

  beforeEach(() => {
    tireRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      adjustStock: jest.fn(),
      findLowStock: jest.fn(),
      getInventoryReport: jest.fn(),
      findByBrandAndModel: jest.fn(),
      findBySizeAndType: jest.fn(),
      getBrands: jest.fn(),
      getModelsForBrand: jest.fn(),
      getSizes: jest.fn(),
    };
    auditRepository = {
      create: jest.fn().mockResolvedValue({}),
      log: jest.fn().mockResolvedValue({}),
    };
    prisma = {
      tireBrand: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      tireSize: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      location: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      tire: { findMany: jest.fn(), count: jest.fn() },
    };
    service = new TiresService(
      tireRepository as any,
      auditRepository as any,
      prisma as any
    );
  });

  function rawTire(overrides: any = {}) {
    return {
      id: 't1',
      brand: { name: 'Michelin', imageUrl: 'logo.png' },
      size: { name: undefined, size: '205/55R16' },
      location: { name: 'Shelf A' },
      price: { toNumber: () => 199.99 },
      cost: { toNumber: () => 120 },
      quantity: 3,
      minStock: 5,
      brandId: 'b1',
      sizeId: 's1',
      locationId: 'l1',
      ...overrides,
    };
  }

  describe('findById / formatting', () => {
    it('throws NotFoundException when tire not found', async () => {
      tireRepository.findById.mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('flattens relations, converts Decimals and sets isLowStock', async () => {
      tireRepository.findById.mockResolvedValue(rawTire());
      const result: any = await service.findById('t1', 'ADMIN');
      expect(result.brand).toBe('Michelin');
      expect(result.size).toBe('205/55R16');
      expect(result.location).toBe('Shelf A');
      expect(result.price).toBe(199.99);
      expect(result.cost).toBe(120); // admin sees cost
      expect(result.isLowStock).toBe(true); // 3 <= 5
      expect(result.brandImageUrl).toBe('logo.png');
      expect(result).not.toHaveProperty('brandId');
    });

    it('hides cost from non-admin users', async () => {
      tireRepository.findById.mockResolvedValue(rawTire());
      const result: any = await service.findById('t1', 'STAFF');
      expect(result.cost).toBeUndefined();
    });

    it('marks not low stock when quantity exceeds minStock', async () => {
      tireRepository.findById.mockResolvedValue(
        rawTire({ quantity: 10, minStock: 5 })
      );
      const result: any = await service.findById('t1', 'ADMIN');
      expect(result.isLowStock).toBe(false);
    });
  });

  describe('create', () => {
    it('throws ForbiddenException for users without permission', async () => {
      await expect(
        service.create({ brand: 'X', size: 'Y' } as any, 'u1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws ConflictException when an identical tire already exists', async () => {
      prisma.tireBrand.findUnique.mockResolvedValue({ id: 'b1' });
      prisma.tireSize.findUnique.mockResolvedValue({ id: 's1' });
      prisma.tire.findMany.mockResolvedValue([{ id: 'dup' }]);

      await expect(
        service.create(
          {
            brand: 'Michelin',
            size: '205/55R16',
            type: 'ALL_SEASON',
            condition: 'NEW',
            price: 100,
          } as any,
          'u1',
          'ADMIN'
        )
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates brand/size when missing and persists the tire with audit log', async () => {
      prisma.tireBrand.findUnique.mockResolvedValue(null);
      prisma.tireBrand.create.mockResolvedValue({ id: 'b1' });
      prisma.tireSize.findUnique.mockResolvedValue(null);
      prisma.tireSize.create.mockResolvedValue({ id: 's1' });
      prisma.tire.findMany.mockResolvedValue([]);
      tireRepository.create.mockResolvedValue(
        rawTire({ quantity: 8, minStock: 5 })
      );

      await service.create(
        {
          brand: 'Michelin',
          size: '205/55R16',
          type: 'ALL_SEASON',
          condition: 'NEW',
          price: 100,
          quantity: 8,
        } as any,
        'u1',
        'STAFF'
      );

      expect(prisma.tireBrand.create).toHaveBeenCalledWith({
        data: { name: 'Michelin' },
      });
      expect(prisma.tireSize.create).toHaveBeenCalledWith({
        data: { size: '205/55R16' },
      });
      const createArg = tireRepository.create.mock.calls[0][0];
      expect(createArg.brand).toEqual({ connect: { id: 'b1' } });
      expect(createArg.minStock).toBe(5); // default
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TIRE_CREATED' })
      );
    });
  });

  describe('adjustStock', () => {
    it('throws ForbiddenException without permission', async () => {
      await expect(
        service.adjustStock(
          't1',
          { type: 'add', quantity: 1 } as any,
          'u1',
          'CUSTOMER'
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException removing more than in stock', async () => {
      tireRepository.findById.mockResolvedValue(rawTire({ quantity: 3 }));
      await expect(
        service.adjustStock(
          't1',
          { type: 'remove', quantity: 5 } as any,
          'u1',
          'ADMIN'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException for negative quantity on add', async () => {
      tireRepository.findById.mockResolvedValue(rawTire({ quantity: 3 }));
      await expect(
        service.adjustStock(
          't1',
          { type: 'add', quantity: -2 } as any,
          'u1',
          'ADMIN'
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('adjusts stock using the absolute quantity and logs the change', async () => {
      tireRepository.findById.mockResolvedValue(rawTire({ quantity: 5 }));
      tireRepository.adjustStock.mockResolvedValue(
        rawTire({
          quantity: 7,
          brand: { name: 'Michelin' },
          size: { size: '205/55R16' },
        })
      );

      await service.adjustStock(
        't1',
        { type: 'add', quantity: 2, reason: 'restock' } as any,
        'u1',
        'ADMIN'
      );
      const adjustArg = tireRepository.adjustStock.mock.calls[0][1];
      expect(adjustArg).toEqual({ quantity: 2, type: 'add' });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'STOCK_ADJUSTED' })
      );
    });
  });

  describe('delete', () => {
    it('throws ForbiddenException for non-admins', async () => {
      await expect(service.delete('t1', 'u1', 'STAFF')).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('throws BadRequestException when repository delete fails', async () => {
      tireRepository.findById.mockResolvedValue(rawTire());
      tireRepository.delete.mockResolvedValue(false);
      await expect(service.delete('t1', 'u1', 'ADMIN')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('deletes successfully and logs audit', async () => {
      tireRepository.findById.mockResolvedValue(rawTire());
      tireRepository.delete.mockResolvedValue(true);
      const result = await service.delete('t1', 'u1', 'ADMIN');
      expect(result).toEqual({ success: true });
      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'TIRE_DELETED' })
      );
    });
  });

  describe('getLowStock / getInventoryReport guards', () => {
    it('getLowStock throws ForbiddenException without permission', async () => {
      await expect(service.getLowStock('CUSTOMER')).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('getInventoryReport throws ForbiddenException for non-admins', async () => {
      await expect(
        service.getInventoryReport({}, 'STAFF')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('getInventoryReport formats lowStockItems for admin', async () => {
      tireRepository.getInventoryReport.mockResolvedValue({
        totalValue: 1000,
        lowStockItems: [rawTire({ quantity: 1, minStock: 5 })],
      });
      const report: any = await service.getInventoryReport({}, 'ADMIN');
      expect(report.totalValue).toBe(1000);
      expect(report.lowStockItems[0].isLowStock).toBe(true);
    });
  });

  describe('tire brand management', () => {
    it('createTireBrand maps a Unique constraint error to ConflictException', async () => {
      prisma.tireBrand.create.mockRejectedValue(
        new Error('Unique constraint failed')
      );
      await expect(
        service.createTireBrand({ name: 'Dup' } as any, 'u1')
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('updateTireBrand throws NotFoundException when brand missing', async () => {
      prisma.tireBrand.findUnique.mockResolvedValue(null);
      await expect(
        service.updateTireBrand('x', { name: 'a' } as any, 'u1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deleteTireBrand throws ConflictException when in use', async () => {
      prisma.tireBrand.findUnique.mockResolvedValue({ id: 'b1' });
      prisma.tire.count.mockResolvedValue(2);
      await expect(service.deleteTireBrand('b1', 'u1')).rejects.toBeInstanceOf(
        ConflictException
      );
    });

    it('deleteTireBrand removes brand when not in use', async () => {
      prisma.tireBrand.findUnique.mockResolvedValue({ id: 'b1' });
      prisma.tire.count.mockResolvedValue(0);
      prisma.tireBrand.delete.mockResolvedValue({});
      const result = await service.deleteTireBrand('b1', 'u1');
      expect(result).toEqual({ success: true });
      expect(prisma.tireBrand.delete).toHaveBeenCalledWith({
        where: { id: 'b1' },
      });
    });
  });

  describe('tire size management', () => {
    it('deleteTireSize throws ConflictException when in use', async () => {
      prisma.tireSize.findUnique.mockResolvedValue({ id: 's1' });
      prisma.tire.count.mockResolvedValue(1);
      await expect(service.deleteTireSize('s1', 'u1')).rejects.toBeInstanceOf(
        ConflictException
      );
    });

    it('getAllTireSizes maps rows to DTOs', async () => {
      prisma.tireSize.findMany.mockResolvedValue([
        {
          id: 's1',
          size: '205/55R16',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]);
      const result = await service.getAllTireSizes();
      expect(result[0]).toEqual(
        expect.objectContaining({ id: 's1', size: '205/55R16' })
      );
    });
  });

  describe('location management', () => {
    it('deleteLocation throws ConflictException when in use', async () => {
      prisma.location.findUnique.mockResolvedValue({ id: 'l1' });
      prisma.tire.count.mockResolvedValue(3);
      await expect(service.deleteLocation('l1', 'u1')).rejects.toBeInstanceOf(
        ConflictException
      );
    });

    it('getLocations returns the list of location names', async () => {
      prisma.location.findMany.mockResolvedValue([
        { name: 'A' },
        { name: 'B' },
      ]);
      const result = await service.getLocations();
      expect(result).toEqual(['A', 'B']);
    });
  });

  describe('thin pass-throughs', () => {
    it('findAll formats responses from the repository', async () => {
      tireRepository.findAll.mockResolvedValue([rawTire()]);
      const result = await service.findAll(undefined, 'ADMIN');
      expect(result).toHaveLength(1);
      expect((result[0] as any).brand).toBe('Michelin');
    });

    it('getBrands delegates to the repository', async () => {
      tireRepository.getBrands.mockResolvedValue(['Michelin']);
      expect(await service.getBrands()).toEqual(['Michelin']);
    });
  });
});
