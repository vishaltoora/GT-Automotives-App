import { BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';

/**
 * Unit tests for ReportsService.getSalesReport. Prisma is mocked; the focus is
 * the business-day range bounds, row mapping and the column totals.
 */
describe('ReportsService.getSalesReport', () => {
  let service: ReportsService;
  let findMany: jest.Mock;

  const buildInvoice = (overrides: any = {}) => ({
    id: 'inv-1',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date(Date.UTC(2026, 0, 5)),
    subtotal: 100,
    gstAmount: 5,
    pstAmount: 7,
    total: 112,
    paymentMethod: 'CASH',
    status: 'PAID',
    notes: null,
    items: [{ description: 'Tire mount balance' }],
    ...overrides,
  });

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    service = new ReportsService();
    (service as any).prisma = { invoice: { findMany } };
  });

  it('bounds the range by business calendar dates, end day inclusive', async () => {
    await service.getSalesReport({
      startDate: '2026-01-05',
      endDate: '2026-01-07',
    });

    const { where } = findMany.mock.calls[0][0];
    // invoiceDate is pinned to midnight UTC, so the lower bound is that instant
    // and the upper bound is the following day, exclusive.
    expect(where.invoiceDate.gte).toEqual(new Date(Date.UTC(2026, 0, 5)));
    expect(where.invoiceDate.lt).toEqual(new Date(Date.UTC(2026, 0, 8)));
    expect(where.status).toBeUndefined();
  });

  it('covers a single-day range', async () => {
    await service.getSalesReport({
      startDate: '2026-01-05',
      endDate: '2026-01-05',
    });

    const { where } = findMany.mock.calls[0][0];
    expect(where.invoiceDate.gte).toEqual(new Date(Date.UTC(2026, 0, 5)));
    expect(where.invoiceDate.lt).toEqual(new Date(Date.UTC(2026, 0, 6)));
  });

  it('applies the status filter when one is supplied', async () => {
    await service.getSalesReport({
      startDate: '2026-01-05',
      endDate: '2026-01-07',
      status: 'PAID',
    });

    expect(findMany.mock.calls[0][0].where.status).toBe('PAID');
  });

  it('rejects an end date before the start date', async () => {
    await expect(
      service.getSalesReport({
        startDate: '2026-01-07',
        endDate: '2026-01-05',
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('maps an invoice onto a report row', async () => {
    findMany.mockResolvedValue([buildInvoice()]);

    const report = await service.getSalesReport({
      startDate: '2026-01-05',
      endDate: '2026-01-05',
    });

    expect(report.rows).toEqual([
      {
        invoiceId: 'inv-1',
        invoiceNumber: 'INV-001',
        date: '2026-01-05',
        description: 'Tire mount balance',
        subtotal: 100,
        gst: 5,
        pst: 7,
        netTotal: 112,
        paymentMethod: 'CASH',
        status: 'PAID',
      },
    ]);
    expect(report.invoiceCount).toBe(1);
  });

  it('reports zero tax for legacy invoices with no GST/PST split', async () => {
    findMany.mockResolvedValue([
      buildInvoice({ gstAmount: null, pstAmount: null }),
    ]);

    const report = await service.getSalesReport({
      startDate: '2026-01-05',
      endDate: '2026-01-05',
    });

    expect(report.rows[0].gst).toBe(0);
    expect(report.rows[0].pst).toBe(0);
  });

  describe('description', () => {
    const describeInvoice = async (overrides: any) => {
      findMany.mockResolvedValue([buildInvoice(overrides)]);
      const report = await service.getSalesReport({
        startDate: '2026-01-05',
        endDate: '2026-01-05',
      });
      return report.rows[0].description;
    };

    it('joins every line item', async () => {
      expect(
        await describeInvoice({
          items: [{ description: 'Winter tire' }, { description: 'Disposal' }],
        })
      ).toBe('Winter tire, Disposal');
    });

    it('falls back to the notes when there are no items', async () => {
      expect(
        await describeInvoice({ items: [], notes: 'Roadside callout' })
      ).toBe('Roadside callout');
    });

    it('falls back to a placeholder when there is nothing to show', async () => {
      expect(await describeInvoice({ items: [], notes: '   ' })).toBe(
        'No description'
      );
    });
  });

  describe('totals', () => {
    it('sums each money column across the rows', async () => {
      findMany.mockResolvedValue([
        buildInvoice({ subtotal: 100, gstAmount: 5, pstAmount: 7, total: 112 }),
        buildInvoice({
          id: 'inv-2',
          subtotal: 50.5,
          gstAmount: 2.53,
          pstAmount: 3.54,
          total: 56.57,
        }),
      ]);

      const report = await service.getSalesReport({
        startDate: '2026-01-05',
        endDate: '2026-01-05',
      });

      expect(report.totals).toEqual({
        subtotal: 150.5,
        gst: 7.53,
        pst: 10.54,
        netTotal: 168.57,
      });
    });

    it('rounds away floating-point drift so totals match the rows', async () => {
      // 0.1 + 0.2 sums to 0.30000000000000004 in binary floating point.
      findMany.mockResolvedValue([
        buildInvoice({
          subtotal: 0.1,
          gstAmount: 0.1,
          pstAmount: 0.1,
          total: 0.1,
        }),
        buildInvoice({
          id: 'inv-2',
          subtotal: 0.2,
          gstAmount: 0.2,
          pstAmount: 0.2,
          total: 0.2,
        }),
      ]);

      const report = await service.getSalesReport({
        startDate: '2026-01-05',
        endDate: '2026-01-05',
      });

      expect(report.totals.subtotal).toBe(0.3);
      expect(report.totals.netTotal).toBe(0.3);
    });

    it('returns zeroed totals for an empty range', async () => {
      const report = await service.getSalesReport({
        startDate: '2026-01-05',
        endDate: '2026-01-07',
      });

      expect(report.rows).toEqual([]);
      expect(report.invoiceCount).toBe(0);
      expect(report.totals).toEqual({
        subtotal: 0,
        gst: 0,
        pst: 0,
        netTotal: 0,
      });
    });
  });
});
