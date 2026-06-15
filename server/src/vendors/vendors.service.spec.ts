import { ConflictException, NotFoundException } from '@nestjs/common';
import { VendorsService } from './vendors.service';

/**
 * Unit tests for VendorsService.
 * The service is instantiated directly with a mocked repository (no Nest DI).
 */
describe('VendorsService', () => {
  let service: VendorsService;
  let vendorRepository: any;

  const sampleVendor = {
    id: 'v1',
    name: 'Acme',
    contactPerson: 'John',
    email: 'a@b.com',
    phone: '555',
    address: 'Street',
    taxId: 'TAX',
    paymentTerms: 'NET30',
    isActive: true,
    notes: 'note',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    _count: { purchaseInvoices: 3 },
  };

  beforeEach(() => {
    vendorRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findActive: jest.fn(),
      count: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new VendorsService(vendorRepository as any);
  });

  describe('create', () => {
    it('throws ConflictException when a vendor with the same name exists', async () => {
      vendorRepository.findByName.mockResolvedValue(sampleVendor);

      await expect(
        service.create({ name: 'Acme' } as any)
      ).rejects.toBeInstanceOf(ConflictException);
      expect(vendorRepository.create).not.toHaveBeenCalled();
    });

    it('creates and maps the vendor to a response DTO', async () => {
      vendorRepository.findByName.mockResolvedValue(null);
      vendorRepository.create.mockResolvedValue(sampleVendor);

      const result = await service.create({ name: 'Acme' } as any);

      expect(vendorRepository.create).toHaveBeenCalledWith({ name: 'Acme' });
      expect(result).toEqual(
        expect.objectContaining({
          id: 'v1',
          name: 'Acme',
          _count: { purchaseInvoices: 3 },
        })
      );
    });
  });

  describe('findAll', () => {
    it('paginates using skip/limit and returns total', async () => {
      vendorRepository.findAll.mockResolvedValue([sampleVendor]);
      vendorRepository.count.mockResolvedValue(25);

      const result = await service.findAll(3, 10);

      // skip = (3 - 1) * 10 = 20
      expect(vendorRepository.findAll).toHaveBeenCalledWith(20, 10);
      expect(result.total).toBe(25);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('v1');
    });

    it('defaults page=1 and limit=100', async () => {
      vendorRepository.findAll.mockResolvedValue([]);
      vendorRepository.count.mockResolvedValue(0);

      await service.findAll();

      expect(vendorRepository.findAll).toHaveBeenCalledWith(0, 100);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the vendor does not exist', async () => {
      vendorRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns the mapped vendor', async () => {
      vendorRepository.findById.mockResolvedValue(sampleVendor);

      const result = await service.findOne('v1');

      expect(result.id).toBe('v1');
    });
  });

  describe('search', () => {
    it('delegates to the repository and maps results', async () => {
      vendorRepository.search.mockResolvedValue([sampleVendor]);

      const result = await service.search('acme', 5);

      expect(vendorRepository.search).toHaveBeenCalledWith('acme', 5);
      expect(result[0].id).toBe('v1');
    });
  });

  describe('findActive', () => {
    it('returns mapped active vendors', async () => {
      vendorRepository.findActive.mockResolvedValue([sampleVendor]);

      const result = await service.findActive();

      expect(result[0].isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the vendor does not exist', async () => {
      vendorRepository.findById.mockResolvedValue(null);

      await expect(service.update('missing', {} as any)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws ConflictException when renaming to an existing name', async () => {
      vendorRepository.findById.mockResolvedValue(sampleVendor);
      vendorRepository.findByName.mockResolvedValue({
        id: 'other',
        name: 'NewName',
      });

      await expect(
        service.update('v1', { name: 'NewName' } as any)
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('does not check name conflict when name is unchanged', async () => {
      vendorRepository.findById.mockResolvedValue(sampleVendor);
      vendorRepository.update.mockResolvedValue(sampleVendor);

      await service.update('v1', { name: 'Acme' } as any);

      expect(vendorRepository.findByName).not.toHaveBeenCalled();
      expect(vendorRepository.update).toHaveBeenCalledWith('v1', {
        name: 'Acme',
      });
    });

    it('updates and maps the vendor', async () => {
      vendorRepository.findById.mockResolvedValue(sampleVendor);
      vendorRepository.update.mockResolvedValue({
        ...sampleVendor,
        phone: '999',
      });

      const result = await service.update('v1', { phone: '999' } as any);

      expect(result.phone).toBe('999');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the vendor does not exist', async () => {
      vendorRepository.findById.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('deletes and returns the mapped vendor', async () => {
      vendorRepository.findById.mockResolvedValue(sampleVendor);
      vendorRepository.delete.mockResolvedValue(sampleVendor);

      const result = await service.remove('v1');

      expect(vendorRepository.delete).toHaveBeenCalledWith('v1');
      expect(result.id).toBe('v1');
    });
  });
});
