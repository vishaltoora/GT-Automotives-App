import { NotFoundException } from '@nestjs/common';
import { PurchaseInvoicesService } from './purchase-invoices.service';

/**
 * Unit tests for PurchaseInvoicesService.
 *
 * The service is instantiated directly with mocked collaborators (no Nest DI).
 * Focus is on findAll pagination/filter mapping, mapToResponse number coercion,
 * NotFound error paths, and the mock-URL branching in getImageUrl.
 */
describe('PurchaseInvoicesService', () => {
  let service: PurchaseInvoicesService;
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
    service = new PurchaseInvoicesService(repo as any, blob as any);
  });

  const sampleInvoice = (overrides: any = {}) => ({
    id: 'pi-1',
    invoiceNumber: 'PI-001',
    vendorId: 'v-1',
    vendorName: 'Acme',
    description: 'Parts',
    invoiceDate: new Date('2025-01-01'),
    dueDate: new Date('2025-02-01'),
    amount: '100.50',
    taxAmount: '5.00',
    totalAmount: '105.50',
    category: 'PARTS',
    status: 'PENDING',
    imageUrl: null,
    imageName: null,
    imageSize: null,
    ...overrides,
  });

  describe('create', () => {
    it('persists and maps the created invoice', async () => {
      repo.create.mockResolvedValue(sampleInvoice());
      const result = await service.create({ vendorId: 'v-1' } as any);
      expect(repo.create).toHaveBeenCalledWith({ vendorId: 'v-1' });
      expect(result.amount).toBe(100.5);
      expect(result.taxAmount).toBe(5);
      expect(result.totalAmount).toBe(105.5);
    });
  });

  describe('findAll', () => {
    it('defaults to page 1 / limit 100 and computes skip 0', async () => {
      repo.findAll.mockResolvedValue([sampleInvoice()]);
      repo.count.mockResolvedValue(1);

      const result = await service.findAll({} as any);

      expect(repo.findAll).toHaveBeenCalledWith(0, 100, {});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(100);
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('parses string page/limit and builds filters with parsed dates', async () => {
      repo.findAll.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);

      await service.findAll({
        page: '3',
        limit: '20',
        vendorId: 'v-9',
        category: 'PARTS',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
      } as any);

      const [skip, limit, filters] = repo.findAll.mock.calls[0];
      expect(skip).toBe(40); // (3-1)*20
      expect(limit).toBe(20);
      expect(filters.vendorId).toBe('v-9');
      expect(filters.category).toBe('PARTS');
      expect(filters.startDate).toBeInstanceOf(Date);
      expect(filters.endDate).toBeInstanceOf(Date);
    });
  });

  describe('findOne', () => {
    it('returns mapped invoice when found', async () => {
      repo.findById.mockResolvedValue(sampleInvoice());
      const result = await service.findOne('pi-1');
      expect(result.id).toBe('pi-1');
    });

    it('throws NotFound when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });

  describe('update', () => {
    it('throws NotFound when invoice does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('x', {} as any)).rejects.toBeInstanceOf(
        NotFoundException
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('updates and maps when found', async () => {
      repo.findById.mockResolvedValue(sampleInvoice());
      repo.update.mockResolvedValue(sampleInvoice({ status: 'PAID' }));
      const result = await service.update('pi-1', { status: 'PAID' } as any);
      expect(repo.update).toHaveBeenCalledWith('pi-1', { status: 'PAID' });
      expect(result.status).toBe('PAID');
    });
  });

  describe('uploadImage', () => {
    it('deletes old image then uploads and stores new info', async () => {
      repo.findById.mockResolvedValue(
        sampleInvoice({ imageUrl: 'http://old', imageName: 'old.pdf' })
      );
      blob.uploadInvoiceImage.mockResolvedValue({
        blobUrl: 'http://new',
        blobName: 'new.pdf',
        size: 999,
      });
      repo.updateImageInfo.mockResolvedValue(
        sampleInvoice({
          imageUrl: 'http://new',
          imageName: 'new.pdf',
          imageSize: 999,
        })
      );

      const result = await service.uploadImage(
        'pi-1',
        Buffer.from('x'),
        'new.pdf',
        'application/pdf'
      );

      expect(blob.deleteInvoiceImage).toHaveBeenCalledWith(
        'purchase-invoices',
        'old.pdf'
      );
      expect(blob.uploadInvoiceImage).toHaveBeenCalledWith(
        expect.any(Buffer),
        'new.pdf',
        'purchase',
        'application/pdf'
      );
      expect(repo.updateImageInfo).toHaveBeenCalledWith(
        'pi-1',
        'http://new',
        'new.pdf',
        999
      );
      expect(result.imageSize).toBe(999);
    });

    it('throws NotFound when invoice missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.uploadImage('x', Buffer.from('x'), 'a.pdf')
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getImageUrl', () => {
    it('throws NotFound when no image present', async () => {
      repo.findById.mockResolvedValue(
        sampleInvoice({ imageUrl: null, imageName: null })
      );
      await expect(service.getImageUrl('pi-1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns mock url as-is in development', async () => {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      repo.findById.mockResolvedValue(
        sampleInvoice({
          imageUrl: 'http://localhost/uploads/mock/x.pdf',
          imageName: 'x.pdf',
        })
      );
      const url = await service.getImageUrl('pi-1');
      expect(url).toBe('http://localhost/uploads/mock/x.pdf');
      expect(blob.generateSasUrl).not.toHaveBeenCalled();
      process.env.NODE_ENV = prev;
    });

    it('throws NotFound for mock url in production', async () => {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      repo.findById.mockResolvedValue(
        sampleInvoice({
          imageUrl: 'http://localhost/uploads/mock/x.pdf',
          imageName: 'x.pdf',
        })
      );
      await expect(service.getImageUrl('pi-1')).rejects.toBeInstanceOf(
        NotFoundException
      );
      process.env.NODE_ENV = prev;
    });

    it('generates a SAS url for real blob storage', async () => {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      repo.findById.mockResolvedValue(
        sampleInvoice({
          imageUrl: 'https://acct.blob.core.windows.net/x.pdf',
          imageName: 'x.pdf',
        })
      );
      blob.generateSasUrl.mockResolvedValue('https://sas');
      const url = await service.getImageUrl('pi-1');
      expect(blob.generateSasUrl).toHaveBeenCalledWith(
        'purchase-invoices',
        'x.pdf',
        60
      );
      expect(url).toBe('https://sas');
      process.env.NODE_ENV = prev;
    });
  });

  describe('remove', () => {
    it('deletes blob when present then deletes record', async () => {
      repo.findById.mockResolvedValue(
        sampleInvoice({ imageUrl: 'http://old', imageName: 'old.pdf' })
      );
      repo.delete.mockResolvedValue(sampleInvoice());
      await service.remove('pi-1');
      expect(blob.deleteInvoiceImage).toHaveBeenCalledWith(
        'purchase-invoices',
        'old.pdf'
      );
      expect(repo.delete).toHaveBeenCalledWith('pi-1');
    });

    it('throws NotFound when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });
});
