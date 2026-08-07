/**
 * Vacation pay accrual.
 *
 * Shared by the pay stub form and the server that stores the figure, so the
 * amount the accountant is shown before saving is the same one that lands on
 * the stub. Duplicating the arithmetic is how the two quietly drift a cent
 * apart on a legal wage statement.
 */

import { roundToCents } from './invoice-balance';

/**
 * BC's Employment Standards Act minimum: 4% of gross earnings, rising to 6%
 * after five consecutive years of employment. Employees entitled to more carry
 * their own rate on their compensation record.
 */
export const DEFAULT_VACATION_PAY_RATE = 4;

/**
 * Vacation earned on a period's earnings.
 *
 * The base is the period's regular earnings *before* the vacation line itself —
 * vacation does not accrue on vacation, and passing gross pay here would
 * compound it every period.
 */
export function calculateVacationPay(
  baseEarnings: number,
  ratePercent: number = DEFAULT_VACATION_PAY_RATE
): number {
  const base = Number(baseEarnings) || 0;
  const rate = Number(ratePercent) || 0;
  if (base <= 0 || rate <= 0) return 0;
  return roundToCents((base * rate) / 100);
}

/**
 * The rate to apply for an employee: their own if one is recorded, otherwise
 * the statutory minimum.
 *
 * `null`/`undefined` means "not set", which is the common case — only an
 * employee entitled to above the minimum needs a value. An explicit 0 is
 * honoured, so vacation can be switched off for someone paid it another way.
 *
 * Typed loosely because the rate arrives as a Prisma `Decimal` on the server
 * and a plain number in the browser; both coerce correctly, and anything that
 * does not falls back to the minimum rather than producing NaN vacation pay.
 */
export function resolveVacationPayRate(employeeRate?: unknown): number {
  if (employeeRate === null || employeeRate === undefined) {
    return DEFAULT_VACATION_PAY_RATE;
  }
  const rate = Number(employeeRate);
  return Number.isFinite(rate) ? rate : DEFAULT_VACATION_PAY_RATE;
}
