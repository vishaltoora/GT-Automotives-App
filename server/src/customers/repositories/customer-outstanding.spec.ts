import { CustomerRepository } from './customer.repository';
import {
  OUTSTANDING_INVOICE_SQL_FILTER,
  outstandingInvoiceWhere,
} from '../../invoices/invoice-outstanding';

/**
 * The customer's outstanding balance is computed in two places that feed
 * different screens — a Prisma query here and a batch raw-SQL query for the
 * customer list. They disagreed in production, so these tests pin down both the
 * arithmetic and the fact that the two filters say the same thing.
 */
describe('customer outstanding balance', () => {
  function buildRepository(
    invoices: Array<{ total: number; amountPaid: number }>
  ) {
    const prisma: any = {
      invoice: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 0 } }),
        findMany: jest.fn().mockResolvedValue(invoices),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      vehicle: { count: jest.fn().mockResolvedValue(0) },
      appointment: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    return { repository: new CustomerRepository(prisma), prisma };
  }

  it('sums what is still owing, not the invoice total', async () => {
    const { repository } = buildRepository([{ total: 100, amountPaid: 80 }]);

    const stats = await repository.getCustomerStats('cust-1');

    expect(stats.outstandingBalance).toBe(20);
  });

  it('clamps each invoice at zero so an overpayment cannot cancel other debt', async () => {
    // The naive SUM(total) - SUM(amountPaid) reports 30 here. The raw-SQL path
    // clamps per row with GREATEST(...,0) and reports 50, so this must too.
    const { repository } = buildRepository([
      { total: 100, amountPaid: 120 },
      { total: 50, amountPaid: 0 },
    ]);

    const stats = await repository.getCustomerStats('cust-1');

    expect(stats.outstandingBalance).toBe(50);
  });

  it('is exact to the cent', async () => {
    const { repository } = buildRepository([
      { total: 105.1, amountPaid: 80 },
      { total: 0.3, amountPaid: 0.1 },
    ]);

    const stats = await repository.getCustomerStats('cust-1');

    expect(stats.outstandingBalance).toBe(25.3);
  });

  it('is zero when every invoice is settled', async () => {
    const { repository } = buildRepository([{ total: 100, amountPaid: 100 }]);

    const stats = await repository.getCustomerStats('cust-1');

    expect(stats.outstandingBalance).toBe(0);
  });

  it('queries only open invoices, excluding consolidated children', async () => {
    const { repository, prisma } = buildRepository([]);

    await repository.getCustomerStats('cust-1');

    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: outstandingInvoiceWhere('cust-1') })
    );
  });

  describe('the two implementations agree on scope', () => {
    it('selects the same statuses', () => {
      const where = outstandingInvoiceWhere() as any;
      for (const status of where.status.in) {
        expect(OUTSTANDING_INVOICE_SQL_FILTER).toContain(`'${status}'`);
      }
      // DRAFT is deliberately excluded: an unissued invoice is not money owed.
      expect(where.status.in).not.toContain('DRAFT');
      expect(OUTSTANDING_INVOICE_SQL_FILTER).not.toContain('DRAFT');
    });

    it('both exclude consolidated children', () => {
      expect((outstandingInvoiceWhere() as any).combinedInvoiceId).toBeNull();
      expect(OUTSTANDING_INVOICE_SQL_FILTER).toContain(
        '"combinedInvoiceId" IS NULL'
      );
    });
  });
});
