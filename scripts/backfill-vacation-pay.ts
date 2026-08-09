#!/usr/bin/env tsx

/**
 * Backfill vacation pay onto pay stubs raised before GA-62.
 *
 * Those stubs recorded no vacation, so the 4% owed under BC employment
 * standards is missing from the record entirely. This writes it in as earned
 * and held — the same accrual GA-62 applies going forward — so the vacation the
 * business owes its staff is visible rather than absent.
 *
 * ## The one rule this script will not break
 *
 * **Net pay never changes.** Whatever was actually paid on that date was paid,
 * and a wage statement that shows a different figure is worse than one missing
 * a line. So the statutory deductions are left exactly as they were withheld
 * rather than recalculated on the new, higher gross. The vacation held absorbs
 * the whole of the vacation earned, and net comes out identical:
 *
 *     gross       = regular + vacation
 *     withholding = (statutory + other, as withheld) + vacationHeld
 *     net         = gross - withholding = regular - statutory - other   ← unchanged
 *
 * Every stub is checked against its stored net before anything is written, and
 * the whole run aborts if any one of them would move by a cent.
 *
 * ## What this does NOT fix
 *
 * The backfilled stubs will show insurable and pensionable earnings including
 * vacation, while CRA was remitted on the lower figure at the time. That is a
 * T4 reconciliation for your accountant, and no script can resolve it — it is a
 * question of what was reported, not of what is stored here.
 *
 * It also does not pay anyone. It records a liability. Settling it is a
 * separate, deliberate act (see GA-64).
 *
 * ## Running it
 *
 *   # Report only — writes nothing. This is the default.
 *   DATABASE_URL=... npx tsx scripts/backfill-vacation-pay.ts
 *
 *   # Commit the change.
 *   DATABASE_URL=... npx tsx scripts/backfill-vacation-pay.ts --apply
 *
 * Requires GA-62's migration to be deployed first — the columns must exist.
 * Idempotent: a stub that already carries vacation is skipped, so a second run
 * cannot double-accrue.
 */

import { PrismaClient, Prisma } from '@prisma/client';
// The same functions the live accrual uses, so a one-off script cannot
// disagree with the feature about what 4% of a paycheque is — and the net-pay
// guard below would not catch it if it did, because a wrong vacation figure
// still balances against itself.
//
// Imported from the module rather than the package barrel: the barrel pulls in
// DTOs whose class-validator decorators need a metadata runtime this script has
// no reason to load. These two functions are pure arithmetic.
import {
  calculateVacationPay,
  resolveVacationPayRate,
} from '../libs/data/src/lib/utils/vacation-pay';

const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
const num = (value: unknown) => Number(value ?? 0);
const money = (value: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value);

interface PlannedChange {
  id: string;
  employeeId: string;
  employeeName: string;
  payDate: Date;
  regularAmount: number;
  vacationPayRate: number;
  vacationPayAmount: number;
  grossPay: number;
  totalWithholding: number;
  netPay: number;
  /** The net currently stored, which the new one must equal. */
  existingNetPay: number;
}

async function plan(): Promise<PlannedChange[]> {
  // Only stubs with nothing recorded. Anything already carrying vacation was
  // either raised after GA-62 or backfilled by an earlier run.
  const stubs = await prisma.payStub.findMany({
    where: { vacationPayAmount: 0, vacationPayHeld: 0 },
    orderBy: [{ payDate: 'asc' }, { createdAt: 'asc' }],
  });

  // The employee's own entitlement where one is recorded — 6% after five
  // years — rather than the statutory floor for everyone.
  const compensations = await prisma.employeeCompensation.findMany({
    where: { isActive: true },
    orderBy: { effectiveFrom: 'desc' },
  });
  const rateByEmployee = new Map<string, number>();
  for (const compensation of compensations) {
    if (rateByEmployee.has(compensation.employeeId)) continue;
    rateByEmployee.set(
      compensation.employeeId,
      resolveVacationPayRate(compensation.vacationPayRate)
    );
  }

  return stubs.map((stub) => {
    const regularAmount = num(stub.regularAmount);
    const rate =
      rateByEmployee.get(stub.employeeId) ?? resolveVacationPayRate();
    const vacationPayAmount = calculateVacationPay(regularAmount, rate);

    // Deliberately NOT recalculated. These are what was actually withheld and
    // remitted; changing them would put a net on the stub that nobody received.
    const statutory =
      num(stub.eiAmount) + num(stub.cppAmount) + num(stub.incomeTaxAmount);
    const other = num(stub.otherDeductions);

    const grossPay = round2(regularAmount + vacationPayAmount);
    const totalWithholding = round2(statutory + other + vacationPayAmount);
    const netPay = round2(grossPay - totalWithholding);

    return {
      id: stub.id,
      employeeId: stub.employeeId,
      employeeName: stub.employeeName,
      payDate: stub.payDate,
      regularAmount,
      vacationPayRate: rate,
      vacationPayAmount,
      grossPay,
      totalWithholding,
      netPay,
      existingNetPay: num(stub.netPay),
    };
  });
}

/**
 * Rewrite one employee's year-to-date vacation columns for a calendar year.
 *
 * Mirrors recomputeYearToDate() in PayStubsService but touches only the two
 * vacation columns — the rest of the chain is already correct and must not be
 * disturbed by a backfill.
 */
async function recomputeVacationYtd(employeeId: string, year: number) {
  const stubs = await prisma.payStub.findMany({
    where: {
      employeeId,
      payDate: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
    orderBy: [{ payDate: 'asc' }, { createdAt: 'asc' }],
  });

  let earned = 0;
  let held = 0;

  for (const stub of stubs) {
    earned += num(stub.vacationPayAmount);
    held += num(stub.vacationPayHeld);
    await prisma.payStub.update({
      where: { id: stub.id },
      data: {
        ytdVacationPayAmount: new Prisma.Decimal(round2(earned)),
        ytdVacationPayHeld: new Prisma.Decimal(round2(held)),
      },
    });
  }
}

async function main() {
  console.log(
    APPLY
      ? '⚠️  APPLY MODE — this will write to pay stub records.\n'
      : '🔍 DRY RUN — nothing will be written. Pass --apply to commit.\n'
  );

  const changes = await plan();

  if (changes.length === 0) {
    console.log('Nothing to do: every pay stub already carries vacation pay.');
    return;
  }

  // A net that moves means the arithmetic above is wrong for this stub, and a
  // wage statement showing pay nobody received is not a thing to write. One bad
  // row stops the whole run rather than leaving a half-backfilled year.
  const drifted = changes.filter(
    (change) => change.netPay !== change.existingNetPay
  );
  if (drifted.length > 0) {
    console.error(
      `\n❌ ABORTED — ${drifted.length} stub(s) would have their net pay changed:\n`
    );
    for (const change of drifted) {
      console.error(
        `   ${change.employeeName}  ${change.payDate
          .toISOString()
          .slice(0, 10)}  stored ${money(change.existingNetPay)} → ${money(
          change.netPay
        )}`
      );
    }
    console.error('\nNo records were written. Investigate before re-running.');
    process.exitCode = 1;
    return;
  }

  console.log(`${changes.length} pay stub(s) to backfill:\n`);
  for (const change of changes) {
    console.log(
      `  ${change.payDate
        .toISOString()
        .slice(0, 10)}  ${change.employeeName.padEnd(16)}  regular ${money(
        change.regularAmount
      ).padStart(11)}  ` +
        `+${change.vacationPayRate}% vacation ${money(
          change.vacationPayAmount
        ).padStart(10)}  gross ${money(change.grossPay).padStart(11)}  ` +
        `net ${money(change.netPay).padStart(11)} (unchanged)`
    );
  }

  const totalOwed = round2(
    changes.reduce((sum, change) => sum + change.vacationPayAmount, 0)
  );
  console.log(
    `\n  Vacation liability recorded: ${money(totalOwed)} across ${
      new Set(changes.map((c) => c.employeeId)).size
    } employee(s).`
  );

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to write.');
    return;
  }

  console.log('\nWriting…');
  for (const change of changes) {
    await prisma.payStub.update({
      where: { id: change.id },
      data: {
        vacationPayRate: new Prisma.Decimal(change.vacationPayRate),
        vacationPayAmount: new Prisma.Decimal(change.vacationPayAmount),
        vacationPayHeld: new Prisma.Decimal(change.vacationPayAmount),
        grossPay: new Prisma.Decimal(change.grossPay),
        totalWithholding: new Prisma.Decimal(change.totalWithholding),
        // netPay deliberately untouched — it already holds what was paid.
      },
    });

    // These are issued wage statements. Changing one without a trail is not
    // something anyone should be able to do quietly.
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'BACKFILL_VACATION_PAY',
        resource: 'PayStub',
        resourceId: change.id,
        newValue: {
          vacationPayRate: change.vacationPayRate,
          vacationPayAmount: change.vacationPayAmount,
          grossPay: change.grossPay,
          totalWithholding: change.totalWithholding,
          netPayUnchanged: change.netPay,
          reason:
            'Vacation pay owed under BC ESA was not recorded when this stub was issued',
        },
      },
    });
  }

  // Year-to-date has to follow, or the columns disagree with the stubs.
  const chains = new Set(
    changes.map(
      (change) => `${change.employeeId}:${change.payDate.getUTCFullYear()}`
    )
  );
  for (const chain of chains) {
    const [employeeId, year] = chain.split(':');
    await recomputeVacationYtd(employeeId, Number(year));
  }

  console.log(
    `\n✅ Backfilled ${changes.length} stub(s) and rebuilt ${chains.size} year-to-date chain(s).`
  );
  console.log(
    '\n⚠️  T4 reconciliation is still outstanding: these stubs now show insurable\n' +
      '   and pensionable earnings including vacation, while CRA was remitted on the\n' +
      '   lower figure. Take the figures above to your accountant.'
  );
}

main()
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
