import { NotFoundException } from '@nestjs/common';
import { ExpenseInvoicesService } from './expense-invoices.service';

/**
 * Unit tests for ExpenseInvoicesService.
 *
 * Direct instantiation with mocked repository + Azure blob service.
 * Focus: findAll pagination/filter mapping (incl. isRecurring boolean coercion),
 * mapToResponse number coercion, NotFound paths, and getImageUrl mock-URL branching.
 */
describe('ExpenseInvoicesService', () => {
  let service: ExpenseInvoicesService;
  let repo: any;
  let blob: any;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateImageInfo: jest.fn(),
      delete: jest.fn(),
    };
    blob = {
      deleteInvoiceImage: jest.fn().mockResolvedValue(undefined),
      uploadInvoiceImage: jest.fn(),
      generateSasUrl: jest.fn(),
    };
    service = new ExpenseInvoicesService(repo as any, blob as any);
  });

  const sample = (overrides: any = {}) => ({
    id: 'ei-1',
    invoiceNumber: 'EI-001',
    vendorName: 'Hydro',
    amount: '50.25',
    taxAmount: '2.50',
    totalAmount: '52.75',
    category: 'UTILITIES',
    status: 'PENDING',
    isRecurring: true,
    imageUrl: null,
    imageName: null,
    imageSize: null,
    ...overrides,
  });

  describe('findAll', () => {
    it('defaults to page 1 / limit 100', async () => {
      repo.findAll.mockResolvedValue([sample()]);
      repo.count.mockResolvedValue(1);
      const result = await service.findAll({} as any);
      expect(repo.findAll).toHaveBeenCalledWith(0, 100, {});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
      expect(result.data[0].amount).toBe(50.25);
    });

    it('coerces isRecurring=true filter and maps category/status', async () => {
      repo.findAll.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);
      await service.findAll({
        page: '2',
        limit: '10',
        category: 'RENT',
        status: 'PAID',
        isRecurring: true,
        startDate: '2025-01-01',
        endDate: '2025-03-01',
      } as any);
      const [skip, limit, filters] = repo.findAll.mock.calls[0];
      expect(skip).toBe(10);
      expect(limit).toBe(10);
      expect(filters.category).toBe('RENT');
      expect(filters.status).toBe('PAID');
      expect(filters.isRecurring).toBe(true);
      expect(filters.startDate).toBeInstanceOf(Date);
      expect(filters.endDate).toBeInstanceOf(Date);
    });

    it('coerces isRecurring=false to boolean false', async () => {
      repo.findAll.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);
      await service.findAll({ isRecurring: false } as any);
      const [, , filters] = repo.findAll.mock.calls[0];
      expect(filters.isRecurring).toBe(false);
    });
  });

  describe('findOne', () => {
    it('returns mapped invoice when found', async () => {
      repo.findById.mockResolvedValue(sample());
      const result = await service.findOne('ei-1');
      expect(result.id).toBe('ei-1');
      expect(result.isRecurring).toBe(true);
    });

    it('throws NotFound when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('throws NotFound when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', {} as any)).rejects.toBeInstanceOf(
        NotFoundException
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('updates when found', async () => {
      repo.findById.mockResolvedValue(sample());
      repo.update.mockResolvedValue(sample({ status: 'PAID' }));
      const result = await service.update('ei-1', { status: 'PAID' } as any);
      expect(repo.update).toHaveBeenCalledWith('ei-1', { status: 'PAID' });
      expect(result.status).toBe('PAID');
    });
  });

  describe('getImageUrl', () => {
    it('throws NotFound when no image present', async () => {
      repo.findById.mockResolvedValue(
        sample({ imageUrl: null, imageName: null })
      );
      await expect(service.getImageUrl('ei-1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns mock url as-is in development', async () => {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      repo.findById.mockResolvedValue(
        sample({
          imageUrl: 'http://localhost/uploads/mock/x.pdf',
          imageName: 'x.pdf',
        })
      );
      const url = await service.getImageUrl('ei-1');
      expect(url).toBe('http://localhost/uploads/mock/x.pdf');
      process.env.NODE_ENV = prev;
    });

    it('generates SAS url for real blobs (expense container)', async () => {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      repo.findById.mockResolvedValue(
        sample({
          imageUrl: 'https://acct.blob.core.windows.net/x.pdf',
          imageName: 'x.pdf',
        })
      );
      blob.generateSasUrl.mockResolvedValue('https://sas');
      const url = await service.getImageUrl('ei-1');
      expect(blob.generateSasUrl).toHaveBeenCalledWith(
        'expense-invoices',
        'x.pdf',
        60
      );
      expect(url).toBe('https://sas');
      process.env.NODE_ENV = prev;
    });
  });

  describe('remove', () => {
    it('deletes blob then record', async () => {
      repo.findById.mockResolvedValue(
        sample({ imageUrl: 'http://o', imageName: 'o.pdf' })
      );
      repo.delete.mockResolvedValue(sample());
      await service.remove('ei-1');
      expect(blob.deleteInvoiceImage).toHaveBeenCalledWith(
        'expense-invoices',
        'o.pdf'
      );
      expect(repo.delete).toHaveBeenCalledWith('ei-1');
    });

    it('throws NotFound when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });
});
