import { BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

/**
 * Unit tests for InvoicesService totals calculation.
 *
 * The service is instantiated directly with mocked collaborators (no Nest DI)
 * so the test focuses purely on the subtotal/tax/total math, including the
 * TIPS-not-taxed and DISCOUNT rules.
 */
describe('InvoicesService.create — totals calculation', () => {
  let service: InvoicesService;
  let createWithItems: jest.Mock;

  beforeEach(() => {
    createWithItems = jest.fn(async (data: any, items: any[]) => ({
      id: 'invoice-1',
      ...data,
      items,
    }));

    const invoiceRepository = {
      generateInvoiceNumber: jest.fn().mockResolvedValue('INV-0001'),
      createWithItems,
    };
    const auditRepository = { create: jest.fn().mockResolvedValue({}) };
    const customerRepository = { create: jest.fn() };
    const serviceRepository = {};
    const pdfService = {};
    const emailService = {};

    service = new InvoicesService(
      invoiceRepository as any,
      auditRepository as any,
      customerRepository as any,
      serviceRepository as any,
      pdfService as any,
      emailService as any
    );
  });

  function capturedTotals() {
    const [data] = createWithItems.mock.calls[0];
    return {
      subtotal: Number(data.subtotal),
      taxRate: Number(data.taxRate),
      taxAmount: Number(data.taxAmount),
      total: Number(data.total),
      gstAmount:
        data.gstAmount !== undefined ? Number(data.gstAmount) : undefined,
      pstAmount:
        data.pstAmount !== undefined ? Number(data.pstAmount) : undefined,
    };
  }

  it('applies separate GST and PST rates to the taxable subtotal', async () => {
    await service.create(
      {
        customerId: 'cust-1',
        companyId: 'comp-1',
        gstRate: 0.05,
        pstRate: 0.07,
        items: [{ quantity: 2, unitPrice: 100, itemType: 'SERVICE' }],
      } as any,
      'user-1'
    );

    const totals = capturedTotals();
    expect(totals.subtotal).toBe(200);
    expect(totals.gstAmount).toBeCloseTo(10);
    expect(totals.pstAmount).toBeCloseTo(14);
    expect(totals.taxAmount).toBeCloseTo(24);
    expect(totals.total).toBeCloseTo(224);
  });

  it('excludes TIPS from the taxable subtotal but includes them in the total', async () => {
    await service.create(
      {
        customerId: 'cust-1',
        companyId: 'comp-1',
        gstRate: 0.05,
        items: [
          { quantity: 1, unitPrice: 100, itemType: 'SERVICE' },
          { quantity: 1, unitPrice: 20, itemType: 'TIPS' },
        ],
      } as any,
      'user-1'
    );

    const totals = capturedTotals();
    expect(totals.subtotal).toBe(120);
    // tax only on the $100 service, not the $20 tip
    expect(totals.taxAmount).toBeCloseTo(5);
    expect(totals.total).toBeCloseTo(125);
  });

  it('treats DISCOUNT items as negative and falls back to the default tax rate', async () => {
    await service.create(
      {
        customerId: 'cust-1',
        companyId: 'comp-1',
        items: [
          { quantity: 1, unitPrice: 100, itemType: 'SERVICE' },
          { quantity: 1, unitPrice: 30, itemType: 'DISCOUNT' },
        ],
      } as any,
      'user-1'
    );

    const totals = capturedTotals();
    expect(totals.subtotal).toBe(70);
    expect(totals.taxRate).toBeCloseTo(0.0825);
    expect(totals.taxAmount).toBeCloseTo(5.775);
    expect(totals.total).toBeCloseTo(75.775);
  });

  it('throws when neither customerId nor customerData is provided', async () => {
    await expect(
      service.create(
        {
          companyId: 'comp-1',
          items: [{ quantity: 1, unitPrice: 100, itemType: 'SERVICE' }],
        } as any,
        'user-1'
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
