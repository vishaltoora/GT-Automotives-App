import {
  calculateDeductions,
  getPayrollRates,
  inferPayPeriodsPerYear,
  payPeriodLabel,
} from './canadian-payroll';

/**
 * These lock the calculator to the CRA's published 2026 figures (T4127, 122nd
 * edition). Where the guide shows its own arithmetic, the expected values below
 * are the guide's, not this implementation's — so a wrong refactor fails
 * against the CRA rather than against itself.
 */
describe('canadian payroll deductions', () => {
  const base = {
    payPeriodsPerYear: 52,
    ytdCpp: 0,
    ytdEi: 0,
    ytdGrossPay: 0,
    province: 'BC' as const,
    taxYear: 2026,
  };

  describe('rate tables', () => {
    it('has the 2026 CRA figures for BC', () => {
      const rates = getPayrollRates('BC', 2026);
      expect(rates?.cpp.ympe).toBe(74600);
      expect(rates?.cpp.yampe).toBe(85000);
      expect(rates?.cpp.employeeRate).toBe(0.0595);
      expect(rates?.cpp.maxEmployeeContribution).toBe(4230.45);
      expect(rates?.cpp.maxCpp2Contribution).toBe(416);
      expect(rates?.ei.employeeRate).toBe(0.0163);
      expect(rates?.ei.maxInsurableEarnings).toBe(68900);
      expect(rates?.ei.maxAnnualPremium).toBe(1123.07);
      expect(rates?.federal.lowestRate).toBe(0.14);
      expect(rates?.federal.basicPersonalAmount.max).toBe(16452);
      expect(rates?.provincial.basicPersonalAmount).toBe(13216);
    });

    it('refuses to guess a year it has no table for', () => {
      expect(getPayrollRates('BC', 2027)).toBeUndefined();
      expect(
        calculateDeductions({ ...base, grossPay: 1000, taxYear: 2027 })
      ).toBeUndefined();
    });
  });

  describe('CPP (T4127 factor C)', () => {
    // T4127 worked example: C = 0.0595 × ($3,500 − ($3,500/52)) = $204.25.
    it('matches the CRA worked example for weekly pensionable income of $3,500', () => {
      const result = calculateDeductions({ ...base, grossPay: 3500 });
      expect(result?.cpp).toBe(204.25);
    });

    // Second T4127 worked example: 0.0595 × ($3,600 − $67.30) = $210.20.
    it('matches the CRA worked example for weekly pensionable income of $3,600', () => {
      const result = calculateDeductions({ ...base, grossPay: 3600 });
      expect(result?.cpp).toBe(210.2);
    });

    it('applies the per-period basic exemption', () => {
      // $1,000 weekly: 0.0595 × (1000 − 67.30) = $55.50, as in the guide.
      expect(calculateDeductions({ ...base, grossPay: 1000 })?.cpp).toBe(55.5);
    });

    it('stops at the annual maximum once reached', () => {
      const result = calculateDeductions({
        ...base,
        grossPay: 2000,
        ytdCpp: 4200,
        ytdGrossPay: 70000,
      });
      // Only $30.45 of room left in the $4,230.45 annual maximum.
      expect(result?.cpp).toBe(30.45);
      expect(result?.cppMaxedOut).toBe(true);
    });

    it('charges CPP2 on earnings above the YMPE', () => {
      const result = calculateDeductions({
        ...base,
        grossPay: 2000,
        ytdCpp: 4230.45,
        ytdGrossPay: 75000,
      });
      // All $2,000 sits above the $74,600 ceiling, so CPP2 takes 4% of it.
      expect(result?.cpp2).toBe(80);
      // The recorded YTD is a single figure, so the $16 of CPP2 implied by
      // $75,000 of earnings is carved out of it, leaving $16 of base room.
      expect(result?.cpp).toBe(96);
    });

    it('caps CPP2 at its own annual maximum', () => {
      const result = calculateDeductions({
        ...base,
        grossPay: 5000,
        ytdCpp: 4630.45,
        ytdGrossPay: 84000,
      });
      // $84,000 of earnings implies $376 of CPP2 already taken, so only $40 of
      // the $416 maximum is left — less than 4% of the $1,000 of band remaining.
      expect(result?.cpp2).toBe(40);
    });
  });

  describe('EI (T4127 Chapter 7)', () => {
    it('is the employee rate on the period’s earnings', () => {
      expect(calculateDeductions({ ...base, grossPay: 1000 })?.ei).toBe(16.3);
    });

    it('takes only the remainder of the annual maximum in the final period', () => {
      const result = calculateDeductions({
        ...base,
        grossPay: 1000,
        ytdEi: 1113.07,
      });
      expect(result?.ei).toBe(10);
      expect(result?.eiMaxedOut).toBe(true);
    });

    it('never exceeds the annual maximum', () => {
      const result = calculateDeductions({
        ...base,
        grossPay: 1000,
        ytdEi: 1123.07,
      });
      expect(result?.ei).toBe(0);
    });
  });

  describe('income tax', () => {
    it('splits a full year of federal and BC tax across the pay periods', () => {
      const result = calculateDeductions({ ...base, grossPay: 1000 });

      // Annualized: 52 × ($1,000 − $9.33 enhanced CPP) = $51,514.84.
      expect(result?.annualTaxableIncome).toBeCloseTo(51514.84, 2);
      expect(result?.federalTax).toBeCloseTo(81.61, 2);
      expect(result?.provincialTax).toBeCloseTo(34.69, 2);
      expect(result?.incomeTax).toBeCloseTo(116.3, 2);
    });

    it('reports a breakdown that adds up to the total withheld', () => {
      for (const grossPay of [850, 1000, 1234.56, 2500, 4000]) {
        const result = calculateDeductions({ ...base, grossPay });
        expect(
          (result?.federalTax ?? 0) + (result?.provincialTax ?? 0)
        ).toBeCloseTo(result?.incomeTax ?? 0, 10);
      }
    });

    it('deducts no tax when annual income is under the personal amounts', () => {
      // $300 weekly is $15,600 a year — below both basic personal amounts.
      const result = calculateDeductions({ ...base, grossPay: 300 });
      expect(result?.incomeTax).toBe(0);
    });

    it('applies the BC tax reduction inside its phase-out band', () => {
      // $600 weekly annualizes to ~$30,900 — inside the factor-S band, so BC
      // tax is cut by $575 − 3.56% of the excess over $25,570 (a $384 credit
      // on $801 of BC tax, leaving $8.01 a week).
      const reduced = calculateDeductions({ ...base, grossPay: 600 });
      expect(reduced?.provincialTax).toBeCloseTo(8.01, 2);

      // Past the $41,722 cut-off the credit is gone: BC tax is then the plain
      // bracket calculation less the personal-amount credits.
      const above = calculateDeductions({ ...base, grossPay: 830 });
      expect(above?.annualTaxableIncome).toBeGreaterThan(41722);
      expect(above?.provincialTax).toBeCloseTo(26.15, 2);
    });

    it('reaches the higher federal brackets on large salaries', () => {
      const monthly = calculateDeductions({
        ...base,
        payPeriodsPerYear: 12,
        grossPay: 20000,
      });
      expect(monthly?.annualTaxableIncome).toBeGreaterThan(200000);
      // Well into the 29% federal bracket, so the average rate is high.
      expect((monthly?.incomeTax ?? 0) / 20000).toBeGreaterThan(0.3);
    });

    it('tapers the federal basic personal amount on high incomes', () => {
      const rates = getPayrollRates('BC', 2026);
      const low = calculateDeductions({
        ...base,
        payPeriodsPerYear: 12,
        grossPay: 15000,
      });
      const high = calculateDeductions({
        ...base,
        payPeriodsPerYear: 12,
        grossPay: 25000,
      });
      // Both above the phase-out start; the higher earner gets the smaller BPA,
      // so the extra tax exceeds the plain bracket difference.
      expect(rates?.federal.basicPersonalAmount.min).toBe(14829);
      expect(high?.incomeTax ?? 0).toBeGreaterThan(low?.incomeTax ?? 0);
    });
  });

  describe('guards', () => {
    it('returns zeros for a zero gross', () => {
      const result = calculateDeductions({ ...base, grossPay: 0 });
      expect(result).toEqual({
        ei: 0,
        cpp: 0,
        cpp2: 0,
        incomeTax: 0,
        federalTax: 0,
        provincialTax: 0,
        annualTaxableIncome: 0,
        cppMaxedOut: false,
        eiMaxedOut: false,
      });
    });

    it('never returns a negative deduction', () => {
      const result = calculateDeductions({
        ...base,
        grossPay: 50,
        ytdCpp: 4230.45,
        ytdEi: 1123.07,
      });
      expect(result?.cpp).toBe(0);
      expect(result?.ei).toBe(0);
      expect(result?.incomeTax).toBe(0);
    });
  });

  describe('pay period inference', () => {
    const infer = (start: string, end: string) =>
      inferPayPeriodsPerYear(new Date(start), new Date(end));

    it('reads a week as weekly', () => {
      expect(infer('2026-01-05', '2026-01-11')).toBe(52);
    });

    it('reads a fortnight as biweekly', () => {
      expect(infer('2026-01-05', '2026-01-18')).toBe(26);
    });

    it('reads a half month as semi-monthly', () => {
      expect(infer('2026-01-01', '2026-01-15')).toBe(24);
      expect(infer('2026-01-16', '2026-01-31')).toBe(24);
    });

    it('reads a calendar month as monthly', () => {
      expect(infer('2026-01-01', '2026-01-31')).toBe(12);
      expect(infer('2026-02-01', '2026-02-28')).toBe(12);
    });

    it('labels each frequency', () => {
      expect(payPeriodLabel(52)).toBe('Weekly');
      expect(payPeriodLabel(26)).toBe('Biweekly');
      expect(payPeriodLabel(24)).toBe('Semi-monthly');
      expect(payPeriodLabel(12)).toBe('Monthly');
    });
  });
});
