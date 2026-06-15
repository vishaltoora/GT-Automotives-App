import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuotationsService } from './quotations.service';

/**
 * Unit tests for QuotationsService. Service is instantiated directly with mocked
 * collaborators. Focus: totals/tax math on create & update, not-found branches,
 * convertToInvoice validation, and the email validation branches.
 *
 * The full PDF generation / SMTP path of sendQuotationEmail is exercised only
 * for its validation branches (no real PDF/email).
 */
describe('QuotationsService', () => {
  let service: QuotationsService;
  let quotationRepository: any;
  let prisma: any;
  let pdfService: any;
  let emailService: any;

  beforeEach(() => {
    quotationRepository = {
      create: jest.fn(async (data: any) => ({ id: 'quote-1', ...data })),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(async (id: string, data: any) => ({ id, ...data })),
      delete: jest.fn(),
      deleteItems: jest.fn(),
      createItems: jest.fn(),
      search: jest.fn(),
      convertToInvoice: jest.fn(),
    };
    prisma = {
      company: { findFirst: jest.fn() },
      invoice: { create: jest.fn() },
    };
    pdfService = { generateQuotationPdf: jest.fn() };
    emailService = { sendQuotationEmail: jest.fn() };

    service = new QuotationsService(
      quotationRepository as any,
      prisma as any,
      pdfService as any,
      emailService as any
    );
  });

  describe('create — totals', () => {
    it('computes subtotal, default GST/PST and total', async () => {
      await service.create(
        {
          customerName: 'Bob',
          items: [
            { quantity: 2, unitPrice: 100 },
            { quantity: 1, unitPrice: 50 },
          ],
        } as any,
        'u1'
      );

      const data = quotationRepository.create.mock.calls[0][0];
      expect(data.subtotal).toBe(250);
      expect(data.gstRate).toBe(0.05);
      expect(data.pstRate).toBe(0.07);
      expect(data.gstAmount).toBeCloseTo(12.5);
      expect(data.pstAmount).toBeCloseTo(17.5);
      expect(data.taxRate).toBeCloseTo(0.12);
      expect(data.taxAmount).toBeCloseTo(30);
      expect(data.total).toBeCloseTo(280);
      // per-item totals populated
      expect(data.items.create[0].total).toBe(200);
      expect(data.items.create[1].total).toBe(50);
    });

    it('honours supplied gstRate/pstRate', async () => {
      await service.create(
        {
          customerName: 'Bob',
          gstRate: 0.1,
          pstRate: 0,
          items: [{ quantity: 1, unitPrice: 100 }],
        } as any,
        'u1'
      );
      const data = quotationRepository.create.mock.calls[0][0];
      expect(data.gstAmount).toBeCloseTo(10);
      expect(data.pstAmount).toBe(0);
      expect(data.total).toBeCloseTo(110);
    });

    it('defaults status to DRAFT and sets validUntil', async () => {
      await service.create(
        { customerName: 'Bob', items: [{ quantity: 1, unitPrice: 10 }] } as any,
        'u1'
      );
      const data = quotationRepository.create.mock.calls[0][0];
      expect(data.status).toBe('DRAFT');
      expect(data.validUntil).toBeInstanceOf(Date);
      expect(data.createdBy).toBe('u1');
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      quotationRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns the quotation when found', async () => {
      quotationRepository.findOne.mockResolvedValue({ id: 'q1' });
      expect(await service.findOne('q1')).toEqual({ id: 'q1' });
    });
  });

  describe('update', () => {
    it('recalculates totals when items are provided', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        gstRate: 0.05,
        pstRate: 0.07,
      });

      await service.update('q1', {
        items: [{ quantity: 3, unitPrice: 100, itemType: 'TIRE' }],
      } as any);

      expect(quotationRepository.deleteItems).toHaveBeenCalledWith('q1');
      expect(quotationRepository.createItems).toHaveBeenCalled();
      const itemsArg = quotationRepository.createItems.mock.calls[0][0];
      expect(itemsArg[0].total).toBe(300);
      expect(itemsArg[0].quotationId).toBe('q1');

      const updateArg = quotationRepository.update.mock.calls[0][1];
      expect(updateArg.subtotal).toBe(300);
      expect(updateArg.taxAmount).toBeCloseTo(36); // 300*0.12
      expect(updateArg.total).toBeCloseTo(336);
    });

    it('uses existing rates when not overridden', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        gstRate: 0.1,
        pstRate: 0.05,
      });
      await service.update('q1', {
        items: [{ quantity: 1, unitPrice: 200 }],
      } as any);
      const updateArg = quotationRepository.update.mock.calls[0][1];
      expect(updateArg.gstAmount).toBeCloseTo(20);
      expect(updateArg.pstAmount).toBeCloseTo(10);
      expect(updateArg.total).toBeCloseTo(230);
    });

    it('updates quote data only when no items provided', async () => {
      quotationRepository.findOne.mockResolvedValue({ id: 'q1' });
      await service.update('q1', { notes: 'hello' } as any);
      expect(quotationRepository.deleteItems).not.toHaveBeenCalled();
      expect(quotationRepository.update).toHaveBeenCalledWith('q1', {
        notes: 'hello',
      });
    });

    it('throws NotFoundException when the quote does not exist', async () => {
      quotationRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('x', { notes: 'a' } as any)
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('checks existence then deletes', async () => {
      quotationRepository.findOne.mockResolvedValue({ id: 'q1' });
      await service.remove('q1');
      expect(quotationRepository.delete).toHaveBeenCalledWith('q1');
    });

    it('throws NotFoundException when missing', async () => {
      quotationRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });

  describe('convertToInvoice', () => {
    it('throws when already converted', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        status: 'CONVERTED',
      });
      await expect(service.convertToInvoice('q1', 'c1')).rejects.toThrow(
        'Quotation has already been converted to an invoice'
      );
    });

    it('throws when no default company is configured', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        status: 'DRAFT',
        items: [],
      });
      prisma.company.findFirst.mockResolvedValue(null);
      await expect(service.convertToInvoice('q1', 'c1')).rejects.toThrow(
        'No default company found'
      );
    });

    it('creates an invoice and marks the quotation converted', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        status: 'DRAFT',
        subtotal: 100,
        taxRate: 0.12,
        taxAmount: 12,
        total: 112,
        createdBy: 'u1',
        items: [
          {
            tireId: 't1',
            itemType: 'TIRE',
            description: 'd',
            quantity: 1,
            unitPrice: 100,
            total: 100,
          },
        ],
      });
      prisma.company.findFirst.mockResolvedValue({ id: 'comp-1' });
      prisma.invoice.create.mockResolvedValue({ id: 'inv-1' });

      const result = await service.convertToInvoice('q1', 'c1', 'veh-1');
      expect(result).toEqual({ id: 'inv-1' });
      const invoiceArg = prisma.invoice.create.mock.calls[0][0];
      expect(invoiceArg.data.companyId).toBe('comp-1');
      expect(invoiceArg.data.customerId).toBe('c1');
      expect(invoiceArg.data.vehicleId).toBe('veh-1');
      expect(invoiceArg.data.items.create[0].tireId).toBe('t1');
      expect(quotationRepository.convertToInvoice).toHaveBeenCalledWith(
        'q1',
        'inv-1'
      );
    });
  });

  describe('sendQuotationEmail', () => {
    it('throws NotFoundException when quotation missing', async () => {
      quotationRepository.findOne.mockResolvedValue(null);
      await expect(
        service.sendQuotationEmail('x', 'u1')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when no email available', async () => {
      quotationRepository.findOne.mockResolvedValue({ id: 'q1', email: null });
      await expect(
        service.sendQuotationEmail('q1', 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sends successfully and returns the email used', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        email: 'q@x.com',
        quotationNumber: 'Q1',
      });
      pdfService.generateQuotationPdf.mockResolvedValue('base64pdf');
      emailService.sendQuotationEmail.mockResolvedValue({ success: true });

      const result = await service.sendQuotationEmail('q1', 'u1');
      expect(result).toEqual({
        success: true,
        message: 'Quotation email sent successfully',
        emailUsed: 'q@x.com',
      });
    });

    it('saves an override email to the quote when requested and none stored', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        email: null,
        quotationNumber: 'Q1',
      });
      pdfService.generateQuotationPdf.mockResolvedValue('base64pdf');
      emailService.sendQuotationEmail.mockResolvedValue({ success: true });

      await service.sendQuotationEmail('q1', 'u1', 'override@x.com', true);
      expect(quotationRepository.update).toHaveBeenCalledWith('q1', {
        email: 'override@x.com',
      });
    });

    it('wraps email-service failure in BadRequestException', async () => {
      quotationRepository.findOne.mockResolvedValue({
        id: 'q1',
        email: 'q@x.com',
        quotationNumber: 'Q1',
      });
      pdfService.generateQuotationPdf.mockResolvedValue('base64pdf');
      emailService.sendQuotationEmail.mockResolvedValue({ success: false });

      await expect(
        service.sendQuotationEmail('q1', 'u1')
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
