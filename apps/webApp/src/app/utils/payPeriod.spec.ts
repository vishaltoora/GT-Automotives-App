import {
  isCurrentPayPeriod,
  isWithinPayPeriod,
  nextPayPeriod,
  payPeriodFor,
  payPeriodLabel,
  previousPayPeriod,
} from './payPeriod';

/** Local-time constructor, so the tests read as shop dates rather than UTC. */
const local = (year: number, month: number, day: number, hour = 12) =>
  new Date(year, month - 1, day, hour);

describe('payPeriodFor', () => {
  it('puts the 1st through the 15th in the first half', () => {
    const period = payPeriodFor(local(2026, 3, 7));
    expect(period.start).toEqual(local(2026, 3, 1, 0));
    expect(period.end.getDate()).toBe(15);
    expect(period.end.getHours()).toBe(23);
  });

  it('puts the 16th onwards in the second half', () => {
    const period = payPeriodFor(local(2026, 3, 20));
    expect(period.start).toEqual(local(2026, 3, 16, 0));
    expect(period.end.getDate()).toBe(31);
  });

  // The boundary days are the ones a wrong comparison lands on.
  it('places the 15th in the first half and the 16th in the second', () => {
    expect(payPeriodFor(local(2026, 3, 15)).start.getDate()).toBe(1);
    expect(payPeriodFor(local(2026, 3, 16)).start.getDate()).toBe(16);
  });

  it('ends the second half on the real last day of a short month', () => {
    expect(payPeriodFor(local(2026, 2, 20)).end.getDate()).toBe(28);
    // 2028 is a leap year.
    expect(payPeriodFor(local(2028, 2, 20)).end.getDate()).toBe(29);
    expect(payPeriodFor(local(2026, 4, 20)).end.getDate()).toBe(30);
  });

  it('covers the whole month with no gap or overlap between the halves', () => {
    const first = payPeriodFor(local(2026, 3, 5));
    const second = payPeriodFor(local(2026, 3, 25));
    expect(second.start.getTime() - first.end.getTime()).toBe(1);
  });
});

describe('stepping between periods', () => {
  it('steps back from the second half to the first half of the same month', () => {
    const period = previousPayPeriod(payPeriodFor(local(2026, 3, 20)));
    expect(period.start).toEqual(local(2026, 3, 1, 0));
    expect(period.end.getDate()).toBe(15);
  });

  it('steps back from the first half into the previous month', () => {
    const period = previousPayPeriod(payPeriodFor(local(2026, 3, 5)));
    expect(period.start).toEqual(local(2026, 2, 16, 0));
    expect(period.end.getDate()).toBe(28);
  });

  it('steps forward from the second half into the next month', () => {
    const period = nextPayPeriod(payPeriodFor(local(2026, 12, 20)));
    expect(period.start).toEqual(local(2027, 1, 1, 0));
  });

  it('returns to where it started after a step back and forward', () => {
    const start = payPeriodFor(local(2026, 3, 20));
    const round = nextPayPeriod(previousPayPeriod(start));
    expect(round).toEqual(start);
  });
});

describe('payPeriodLabel', () => {
  it('distinguishes the two halves of a month', () => {
    expect(payPeriodLabel(payPeriodFor(local(2026, 3, 5)))).toBe(
      'Mar 1 – Mar 15, 2026'
    );
    expect(payPeriodLabel(payPeriodFor(local(2026, 3, 25)))).toBe(
      'Mar 16 – Mar 31, 2026'
    );
  });
});

describe('membership', () => {
  it('includes an entry stamped in the last second of the period', () => {
    const period = payPeriodFor(local(2026, 3, 5));
    expect(isWithinPayPeriod(period, local(2026, 3, 15, 23))).toBe(true);
    expect(isWithinPayPeriod(period, local(2026, 3, 16, 0))).toBe(false);
  });

  it('recognises the period containing today', () => {
    expect(isCurrentPayPeriod(payPeriodFor(new Date()))).toBe(true);
    expect(
      isCurrentPayPeriod(previousPayPeriod(payPeriodFor(new Date())))
    ).toBe(false);
  });
});
