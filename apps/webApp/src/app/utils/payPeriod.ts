import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';

/**
 * Semi-monthly pay periods: the 1st–15th, and the 16th to the end of the month.
 *
 * The shop pays twice a month, which is why the pay stub form defaults to 24
 * pay periods per year. Hours are reviewed against the same boundaries so the
 * total an admin chases mid-period is the total that ends up on a stub — a
 * calendar month view would have straddled two payments.
 *
 * Dates are handled in local time throughout, matching the rest of the time
 * clock: entries are stamped and displayed in the shop's own timezone, and a
 * period boundary means midnight there, not midnight UTC.
 */
export interface PayPeriod {
  /** Local midnight on the first day of the period. */
  start: Date;
  /** Local 23:59:59.999 on the last day of the period. */
  end: Date;
}

/** The day the second half of a month begins. */
const SECOND_HALF_START_DAY = 16;

const atStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

const atEndOfDay = (date: Date) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );

/** The pay period containing `date`. */
export const payPeriodFor = (date: Date): PayPeriod => {
  const firstHalf = date.getDate() < SECOND_HALF_START_DAY;
  const start = firstHalf
    ? startOfMonth(date)
    : new Date(date.getFullYear(), date.getMonth(), SECOND_HALF_START_DAY);
  const end = firstHalf
    ? new Date(date.getFullYear(), date.getMonth(), SECOND_HALF_START_DAY - 1)
    : endOfMonth(date);
  return { start: atStartOfDay(start), end: atEndOfDay(end) };
};

/** The pay period immediately before `period`. */
export const previousPayPeriod = (period: PayPeriod): PayPeriod =>
  payPeriodFor(addDays(period.start, -1));

/** The pay period immediately after `period`. */
export const nextPayPeriod = (period: PayPeriod): PayPeriod =>
  payPeriodFor(addDays(period.end, 1));

/**
 * How the period is labelled above the entries. Both halves of a month share a
 * month name, so the label leads with the dates that distinguish them.
 */
export const payPeriodLabel = (period: PayPeriod): string =>
  `${format(period.start, 'MMM d')} – ${format(period.end, 'MMM d, yyyy')}`;

/** Whether `date` falls inside `period`. */
export const isWithinPayPeriod = (period: PayPeriod, date: Date): boolean =>
  date >= period.start && date <= period.end;

/** Whether this is the period we are currently being paid for. */
export const isCurrentPayPeriod = (period: PayPeriod): boolean =>
  isWithinPayPeriod(period, new Date());
