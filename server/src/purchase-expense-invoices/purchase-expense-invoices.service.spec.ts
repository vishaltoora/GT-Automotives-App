import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseExpenseInvoicesService } from './purchase-expense-invoices.service';

/**
 * Unit tests for PurchaseExpenseInvoicesService.
 *
 * Direct instantiation with mocked repository + Azure blob service.
 * Focus: findAll pagination/filter mapping, mapToResponse tax-default coercion,
 * NotFound/BadRequest error paths, and image URL extraction branching.
 */
describe('PurchaseExpenseInvoicesService', () => {
  let service: PurchaseExpenseInvoicesService;
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
      extractContainerNameFromUrl: jest.fn(),
      extractBlobNameFromUrl: jest.fn(),
    };
    service = new PurchaseExpenseInvoicesService(repo as any, blob as any);
  });

  const sample = (overrides: any = {}) => ({
    id: 'pe-1',
    type: 'PURCHASE',
    vendorName: 'Acme',
    amount: '100',
    totalAmount: '112',
    category: 'PARTS',
    imageUrl: null,
    ...overrides,
  });

  describe('create', () => {
    it('passes userId through and maps response', async () => {
      repo.create.mockResolvedValue(sample());
      const result = await service.create(
        { type: 'PURCHASE' } as any,
        'user-1'
      );
      expect(repo.create).toHaveBeenCalledWith({ type: 'PURCHASE' }, 'user-1');
      expect(result.amount).toBe(100);
    });
  });

  describe('mapToResponse via findOne', () => {
    it('applies default tax rates when missing and zero amount fallback', async () => {
      repo.findById.mockResolvedValue(
        sample({ amount: null, gstRate: null, pstRate: null, hstRate: null })
      );
      const result = await service.findOne('pe-1');
      expect(result.amount).toBe(0);
      expect(result.gstRate).toBe(5);
      expect(result.pstRate).toBe(7);
      expect(result.hstRate).toBe(0);
      expect(result.gstAmount).toBeNull();
    });

    it('coerces provided tax amounts to numbers', async () => {
      repo.findById.mockResolvedValue(
        sample({ gstAmount: '5', pstAmount: '7', taxAmount: '12' })
      );
      const result = await service.findOne('pe-1');
      expect(result.gstAmount).toBe(5);
      expect(result.pstAmount).toBe(7);
      expect(result.taxAmount).toBe(12);
    });
  });

  describe('findAll', () => {
    it('defaults to page 1 / limit 20', async () => {
      repo.findAll.mockResolvedValue([sample()]);
      repo.count.mockResolvedValue(1);
      const result = await service.findAll({} as any);
      expect(repo.findAll).toHaveBeenCalledWith(0, 20, {});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('uses numeric page/limit and builds filters', async () => {
      repo.findAll.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);
      await service.findAll({
        page: 2,
        limit: 50,
        type: 'EXPENSE',
        vendorId: 'v-1',
        search: 'hydro',
        category: 'UTILITIES',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      } as any);
      const [skip, limit, filters] = repo.findAll.mock.calls[0];
      expect(skip).toBe(50); // (2-1)*50
      expect(limit).toBe(50);
      expect(filters.type).toBe('EXPENSE');
      expect(filters.vendorId).toBe('v-1');
      expect(filters.search).toBe('hydro');
      expect(filters.category).toBe('UTILITIES');
      expect(filters.startDate).toBeInstanceOf(Date);
      expect(filters.endDate).toBeInstanceOf(Date);
    });
  });

  describe('findOne / update / remove NotFound', () => {
    it('findOne throws NotFound', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('update throws NotFound', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', {} as any)).rejects.toBeInstanceOf(
        NotFoundException
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('remove throws NotFound', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('deletes blob when imageUrl present, then deletes record', async () => {
      repo.findById.mockResolvedValue(
        sample({ imageUrl: 'https://acct/c/blob.pdf' })
      );
      blob.extractContainerNameFromUrl.mockReturnValue('c');
      blob.extractBlobNameFromUrl.mockReturnValue('blob.pdf');
      repo.delete.mockResolvedValue(sample());
      await service.remove('pe-1');
      expect(blob.deleteInvoiceImage).toHaveBeenCalledWith('c', 'blob.pdf');
      expect(repo.delete).toHaveBeenCalledWith('pe-1');
    });

    it('still deletes record when blob deletion throws', async () => {
      repo.findById.mockResolvedValue(
        sample({ imageUrl: 'https://acct/c/blob.pdf' })
      );
      blob.extractContainerNameFromUrl.mockReturnValue('c');
      blob.extractBlobNameFromUrl.mockReturnValue('blob.pdf');
      blob.deleteInvoiceImage.mockRejectedValue(new Error('boom'));
      repo.delete.mockResolvedValue(sample());
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      await service.remove('pe-1');
      expect(repo.delete).toHaveBeenCalledWith('pe-1');
      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('uploadImage', () => {
    it('uploads with purchase type and stores image info', async () => {
      repo.findById.mockResolvedValue(
        sample({ type: 'PURCHASE', imageUrl: null })
      );
      blob.uploadInvoiceImage.mockResolvedValue({ blobUrl: 'https://new' });
      repo.updateImageInfo.mockResolvedValue(
        sample({ imageUrl: 'https://new' })
      );
      const buf = Buffer.from('abc');
      await service.uploadImage('pe-1', buf, 'doc.pdf', 'application/pdf');
      expect(blob.uploadInvoiceImage).toHaveBeenCalledWith(
        buf,
        'doc.pdf',
        'purchase',
        'application/pdf'
      );
      expect(repo.updateImageInfo).toHaveBeenCalledWith(
        'pe-1',
        'https://new',
        'doc.pdf',
        3
      );
    });

    it('uploads with expense type for EXPENSE invoices', async () => {
      repo.findById.mockResolvedValue(
        sample({ type: 'EXPENSE', imageUrl: null })
      );
      blob.uploadInvoiceImage.mockResolvedValue({ blobUrl: 'https://new' });
      repo.updateImageInfo.mockResolvedValue(sample());
      await service.uploadImage(
        'pe-1',
        Buffer.from('a'),
        'd.pdf',
        'application/pdf'
      );
      expect(blob.uploadInvoiceImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        'd.pdf',
        'expense',
        'application/pdf'
      );
    });

    it('throws NotFound when invoice missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.uploadImage('x', Buffer.from('a'), 'd.pdf', 'application/pdf')
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('deleteImage', () => {
    it('throws BadRequest when no image present', async () => {
      repo.findById.mockResolvedValue(sample({ imageUrl: null }));
      await expect(service.deleteImage('pe-1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('clears image info when image present', async () => {
      repo.findById.mockResolvedValue(
        sample({ imageUrl: 'https://acct/c/b.pdf' })
      );
      blob.extractContainerNameFromUrl.mockReturnValue('c');
      blob.extractBlobNameFromUrl.mockReturnValue('b.pdf');
      repo.updateImageInfo.mockResolvedValue(sample({ imageUrl: null }));
      await service.deleteImage('pe-1');
      expect(repo.updateImageInfo).toHaveBeenCalledWith(
        'pe-1',
        null,
        null,
        null
      );
    });
  });

  describe('getImageUrl', () => {
    it('throws NotFound when invoice missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getImageUrl('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws NotFound when no image', async () => {
      repo.findById.mockResolvedValue(sample({ imageUrl: null }));
      await expect(service.getImageUrl('pe-1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequest for invalid url format', async () => {
      repo.findById.mockResolvedValue(sample({ imageUrl: 'bad' }));
      blob.extractContainerNameFromUrl.mockReturnValue(null);
      blob.extractBlobNameFromUrl.mockReturnValue(null);
      await expect(service.getImageUrl('pe-1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('returns SAS url for valid image url', async () => {
      repo.findById.mockResolvedValue(
        sample({ imageUrl: 'https://acct/c/b.pdf' })
      );
      blob.extractContainerNameFromUrl.mockReturnValue('c');
      blob.extractBlobNameFromUrl.mockReturnValue('b.pdf');
      blob.generateSasUrl.mockResolvedValue('https://sas');
      const url = await service.getImageUrl('pe-1');
      expect(blob.generateSasUrl).toHaveBeenCalledWith('c', 'b.pdf');
      expect(url).toBe('https://sas');
    });
  });
});
