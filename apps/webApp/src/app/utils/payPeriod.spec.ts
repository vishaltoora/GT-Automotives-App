import {
  currentPayPeriod,
  isCurrentPayPeriod,
  nextPayPeriod,
  payPeriodForDate,
  payPeriodLabel,
  previousPayPeriod,
} from './payPeriod';

describe('payPeriodForDate', () => {
  it('puts the 1st through the 15th in the first half', () => {
    const period = payPeriodForDate('2026-03-07');
    expect(period.startDate).toBe('2026-03-01');
    expect(period.endDate).toBe('2026-03-15');
  });

  it('puts the 16th onwards in the second half', () => {
    const period = payPeriodForDate('2026-03-20');
    expect(period.startDate).toBe('2026-03-16');
    expect(period.endDate).toBe('2026-03-31');
  });

  // The boundary days are the ones a wrong comparison lands on.
  it('places the 15th in the first half and the 16th in the second', () => {
    expect(payPeriodForDate('2026-03-15').startDate).toBe('2026-03-01');
    expect(payPeriodForDate('2026-03-16').startDate).toBe('2026-03-16');
  });

  it('ends the second half on the real last day of a short month', () => {
    expect(payPeriodForDate('2026-02-20').endDate).toBe('2026-02-28');
    // 2028 is a leap year.
    expect(payPeriodForDate('2028-02-20').endDate).toBe('2028-02-29');
    expect(payPeriodForDate('2026-04-20').endDate).toBe('2026-04-30');
  });

  it('covers the whole month with no gap or overlap between the halves', () => {
    const first = payPeriodForDate('2026-03-05');
    const second = payPeriodForDate('2026-03-25');
    expect(second.start.getTime() - first.end.getTime()).toBe(1);
  });
});

/**
 * The bounds sent to the server must be midnight in the shop's timezone, not
 * the viewer's. A card drawn from one set of instants and a stub paid over
 * another would disagree about which period a late shift belongs to.
 */
describe('boundaries are in the shop timezone', () => {
  it('opens a winter period at 08:00 UTC (PST is UTC-8)', () => {
    expect(payPeriodForDate('2026-01-05').start.toISOString()).toBe(
      '2026-01-01T08:00:00.000Z'
    );
  });

  it('opens a summer period at 07:00 UTC (PDT is UTC-7)', () => {
    expect(payPeriodForDate('2026-07-05').start.toISOString()).toBe(
      '2026-07-01T07:00:00.000Z'
    );
  });

  it('closes a period one millisecond before the next day opens', () => {
    const period = payPeriodForDate('2026-01-05');
    expect(period.end.toISOString()).toBe('2026-01-16T07:59:59.999Z');
  });

  it('spans a spring-forward transition without losing or gaining a day', () => {
    // DST starts Mar 8 2026: the period opens in PST and closes in PDT.
    const period = payPeriodForDate('2026-03-05');
    expect(period.start.toISOString()).toBe('2026-03-01T08:00:00.000Z');
    expect(period.end.toISOString()).toBe('2026-03-16T06:59:59.999Z');
  });

  it('does not depend on the viewer being on Pacific time', () => {
    // The instants are derived from America/Vancouver via Intl, not from the
    // host offset, so a device in Fort St John (UTC-7 year round) or anywhere
    // else resolves the same boundary.
    const period = payPeriodForDate('2026-01-05');
    expect(period.start.getTime()).toBe(Date.parse('2026-01-01T08:00:00.000Z'));
  });
});

describe('stepping between periods', () => {
  it('steps back from the second half to the first half of the same month', () => {
    const period = previousPayPeriod(payPeriodForDate('2026-03-20'));
    expect(period.startDate).toBe('2026-03-01');
    expect(period.endDate).toBe('2026-03-15');
  });

  it('steps back from the first half into the previous month', () => {
    const period = previousPayPeriod(payPeriodForDate('2026-03-05'));
    expect(period.startDate).toBe('2026-02-16');
    expect(period.endDate).toBe('2026-02-28');
  });

  it('steps back across new year', () => {
    const period = previousPayPeriod(payPeriodForDate('2026-01-05'));
    expect(period.startDate).toBe('2025-12-16');
    expect(period.endDate).toBe('2025-12-31');
  });

  it('steps forward from the second half into the next month', () => {
    const period = nextPayPeriod(payPeriodForDate('2026-12-20'));
    expect(period.startDate).toBe('2027-01-01');
  });

  it('returns to where it started after a step back and forward', () => {
    const start = payPeriodForDate('2026-03-20');
    expect(nextPayPeriod(previousPayPeriod(start))).toEqual(start);
  });
});

describe('payPeriodLabel', () => {
  it('distinguishes the two halves of a month', () => {
    expect(payPeriodLabel(payPeriodForDate('2026-03-05'))).toBe(
      'Mar 1 – Mar 15, 2026'
    );
    expect(payPeriodLabel(payPeriodForDate('2026-03-25'))).toBe(
      'Mar 16 – Mar 31, 2026'
    );
  });
});

describe('the current period', () => {
  it('recognises the period containing today', () => {
    expect(isCurrentPayPeriod(currentPayPeriod())).toBe(true);
    expect(isCurrentPayPeriod(previousPayPeriod(currentPayPeriod()))).toBe(
      false
    );
  });
});
