import { BUSINESS_TIMEZONE } from './dateUtils';

/**
 * Semi-monthly pay periods: the 1st–15th, and the 16th to the end of the month.
 *
 * The shop pays twice a month, which is why the pay stub form defaults to 24
 * pay periods per year. Hours are reviewed against the same boundaries so the
 * total an admin chases mid-period is the total that ends up on a stub — a
 * calendar month view would have straddled two payments.
 *
 * A period is a pair of *calendar dates*, and its boundaries are midnight in
 * the shop's timezone — not the viewer's. Getting that wrong would put a shift
 * clocked in late on the last day of one period onto the card for the next,
 * while the server, which pays by real business-day bounds, put it on the
 * other. The reviewed total and the paid total have to agree; that agreement is
 * the whole point of reviewing by pay period.
 */
export interface PayPeriod {
  /** First calendar date of the period, `yyyy-MM-dd`. */
  startDate: string;
  /** Last calendar date of the period, `yyyy-MM-dd`. */
  endDate: string;
  /** The instant the period opens: midnight in the shop's timezone. */
  start: Date;
  /** The last instant of the period, in the shop's timezone. */
  end: Date;
}

/** The day the second half of a month begins. */
const SECOND_HALF_START_DAY = 16;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, '0');

const toDateString = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

/**
 * Minutes the shop's timezone is offset from UTC on a given calendar day.
 * Negative for Pacific time (UTC-8 PST / UTC-7 PDT). Sampled at noon UTC so the
 * result is never taken at a DST transition boundary.
 *
 * Mirrors `businessTimezoneOffsetMinutes` in the server's timezone.config, so
 * the bounds a card is drawn from and the bounds a stub pays over are the same
 * instants.
 */
const businessOffsetMinutes = (year: number, month: number, day: number) => {
  const reference = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(reference);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  // Hour can come back as "24" for midnight in some environments.
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') % 24,
    get('minute'),
    get('second')
  );
  return (asUtc - reference.getTime()) / 60000;
};

/** The instant a business calendar date begins. */
const businessDayStart = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) -
      businessOffsetMinutes(year, month, day) * 60000
  );
};

/** Today's calendar date in the shop's timezone. */
export const businessToday = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  // en-CA formats as yyyy-MM-dd.
  return parts;
};

const buildPeriod = (startDate: string, endDate: string): PayPeriod => ({
  startDate,
  endDate,
  start: businessDayStart(startDate),
  // The period runs to the last instant before the next business day opens, so
  // a shift clocked in at 11pm on the final day still falls inside it.
  end: new Date(businessDayStart(endDate).getTime() + MS_PER_DAY - 1),
});

/** Days in a month, by calendar year and 1-based month. */
const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** The pay period containing a business calendar date (`yyyy-MM-dd`). */
export const payPeriodForDate = (dateStr: string): PayPeriod => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return day < SECOND_HALF_START_DAY
    ? buildPeriod(
        toDateString(year, month, 1),
        toDateString(year, month, SECOND_HALF_START_DAY - 1)
      )
    : buildPeriod(
        toDateString(year, month, SECOND_HALF_START_DAY),
        toDateString(year, month, daysInMonth(year, month))
      );
};

/** The pay period containing today, in the shop's timezone. */
export const currentPayPeriod = (): PayPeriod =>
  payPeriodForDate(businessToday());

/** The pay period immediately before `period`. */
export const previousPayPeriod = (period: PayPeriod): PayPeriod => {
  const [year, month, day] = period.startDate.split('-').map(Number);
  if (day === SECOND_HALF_START_DAY) {
    return payPeriodForDate(toDateString(year, month, 1));
  }
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return payPeriodForDate(
    toDateString(prevYear, prevMonth, SECOND_HALF_START_DAY)
  );
};

/** The pay period immediately after `period`. */
export const nextPayPeriod = (period: PayPeriod): PayPeriod => {
  const [year, month, day] = period.startDate.split('-').map(Number);
  if (day === 1) {
    return payPeriodForDate(toDateString(year, month, SECOND_HALF_START_DAY));
  }
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return payPeriodForDate(toDateString(nextYear, nextMonth, 1));
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * How the period is labelled above the entries. Both halves of a month share a
 * month name, so the label leads with the dates that distinguish them.
 *
 * Formatted from the calendar date strings rather than the instants, so the
 * label reads the same wherever it is viewed from.
 */
export const payPeriodLabel = (period: PayPeriod): string => {
  const [, startMonth, startDay] = period.startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = period.endDate.split('-').map(Number);
  return `${MONTHS[startMonth - 1]} ${startDay} – ${
    MONTHS[endMonth - 1]
  } ${endDay}, ${endYear}`;
};

/** Whether this is the period we are currently being paid for. */
export const isCurrentPayPeriod = (period: PayPeriod): boolean =>
  period.startDate === currentPayPeriod().startDate;
