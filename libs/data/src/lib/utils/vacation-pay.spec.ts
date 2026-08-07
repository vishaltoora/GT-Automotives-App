import {
  calculateVacationPay,
  DEFAULT_VACATION_PAY_RATE,
  resolveVacationPayRate,
} from './vacation-pay';

describe('calculateVacationPay', () => {
  it('accrues the statutory minimum by default', () => {
    expect(calculateVacationPay(3072)).toBe(122.88);
  });

  it('accrues a higher entitlement when one is given', () => {
    // 6% after five consecutive years of employment.
    expect(calculateVacationPay(3072, 6)).toBe(184.32);
  });

  it('rounds to whole cents', () => {
    // 4% of 1234.56 is 49.3824 — a pay stub cannot print a third of a cent.
    expect(calculateVacationPay(1234.56)).toBe(49.38);
  });

  it('accrues nothing on nothing', () => {
    expect(calculateVacationPay(0)).toBe(0);
  });

  it('accrues nothing at a zero rate', () => {
    // Someone paid their vacation another way.
    expect(calculateVacationPay(3072, 0)).toBe(0);
  });

  it('never returns a negative accrual', () => {
    expect(calculateVacationPay(-100)).toBe(0);
  });

  it('treats unusable input as no accrual rather than NaN', () => {
    expect(calculateVacationPay(Number.NaN)).toBe(0);
    expect(calculateVacationPay(3072, Number.NaN)).toBe(0);
  });
});

describe('resolveVacationPayRate', () => {
  it('falls back to the statutory minimum when no rate is recorded', () => {
    expect(resolveVacationPayRate(null)).toBe(DEFAULT_VACATION_PAY_RATE);
    expect(resolveVacationPayRate(undefined)).toBe(DEFAULT_VACATION_PAY_RATE);
  });

  it("uses the employee's own rate when there is one", () => {
    expect(resolveVacationPayRate(6)).toBe(6);
  });

  // The rate arrives as a Prisma Decimal on the server and a number in the
  // browser; both have to land on the same figure.
  it('accepts a decimal that arrives as a string', () => {
    expect(resolveVacationPayRate('4.50')).toBe(4.5);
  });

  it('honours an explicit zero instead of treating it as unset', () => {
    expect(resolveVacationPayRate(0)).toBe(0);
  });

  it('falls back rather than producing NaN from unusable input', () => {
    expect(resolveVacationPayRate('not a rate')).toBe(
      DEFAULT_VACATION_PAY_RATE
    );
  });
});
