import {
  getInvoiceAmountPaid,
  getInvoiceBalanceDue,
  isInvoicePartiallyPaid,
  roundToCents,
} from './invoice-balance';

describe('invoice balance', () => {
  describe('getInvoiceBalanceDue', () => {
    it('is the full total when nothing has been paid', () => {
      expect(getInvoiceBalanceDue({ total: 105 })).toBe(105);
      expect(getInvoiceBalanceDue({ total: 105, amountPaid: 0 })).toBe(105);
    });

    it('subtracts what has been paid', () => {
      expect(getInvoiceBalanceDue({ total: 100, amountPaid: 80 })).toBe(20);
    });

    it('is zero once the invoice is settled', () => {
      expect(getInvoiceBalanceDue({ total: 100, amountPaid: 100 })).toBe(0);
    });

    it('is exact to the cent on values that drift in binary floating point', () => {
      // 105.10 - 80.00 is 25.099999999999994 in raw JS.
      expect(getInvoiceBalanceDue({ total: 105.1, amountPaid: 80 })).toBe(25.1);
      expect(getInvoiceBalanceDue({ total: 0.3, amountPaid: 0.1 })).toBe(0.2);
      expect(getInvoiceBalanceDue({ total: 1000.05, amountPaid: 999.9 })).toBe(
        0.15
      );
    });

    it('never reports a negative balance when overpaid', () => {
      // A credit must not subsidise another invoice when these are summed.
      expect(getInvoiceBalanceDue({ total: 100, amountPaid: 120 })).toBe(0);
    });

    it('handles Decimal-like string amounts from the database', () => {
      expect(
        getInvoiceBalanceDue({ total: '105.00', amountPaid: '80.00' })
      ).toBe(25);
    });

    it('treats a missing invoice as nothing owing', () => {
      expect(getInvoiceBalanceDue(null)).toBe(0);
      expect(getInvoiceBalanceDue(undefined)).toBe(0);
    });
  });

  describe('isInvoicePartiallyPaid', () => {
    it('is false when nothing has been paid', () => {
      expect(isInvoicePartiallyPaid({ total: 100, amountPaid: 0 })).toBe(false);
      expect(isInvoicePartiallyPaid({ total: 100 })).toBe(false);
    });

    it('is false when the invoice is settled in full', () => {
      expect(isInvoicePartiallyPaid({ total: 100, amountPaid: 100 })).toBe(
        false
      );
    });

    it('is false when overpaid', () => {
      expect(isInvoicePartiallyPaid({ total: 100, amountPaid: 110 })).toBe(
        false
      );
    });

    it('is true only when part-paid', () => {
      expect(isInvoicePartiallyPaid({ total: 100, amountPaid: 80 })).toBe(true);
    });

    it('ignores sub-cent residue rather than reporting a partial payment', () => {
      // $100 paid as 80 + 20 must land fully settled, not "$0.001 owing".
      expect(isInvoicePartiallyPaid({ total: 100, amountPaid: 80 + 20 })).toBe(
        false
      );
    });
  });

  describe('getInvoiceAmountPaid', () => {
    it('defaults to zero', () => {
      expect(getInvoiceAmountPaid({})).toBe(0);
      expect(getInvoiceAmountPaid(null)).toBe(0);
    });

    it('rounds to cents', () => {
      expect(getInvoiceAmountPaid({ amountPaid: 0.1 + 0.2 })).toBe(0.3);
    });
  });

  describe('roundToCents', () => {
    it('rounds half up and removes binary drift', () => {
      expect(roundToCents(0.1 + 0.2)).toBe(0.3);
      expect(roundToCents(1.005)).toBe(1.01);
      expect(roundToCents(2.675)).toBe(2.68);
    });
  });
});
