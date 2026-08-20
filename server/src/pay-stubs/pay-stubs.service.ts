import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import {
  calculateVacationPay,
  CreatePayStubDto,
  PayStubDeductionEstimateDto,
  PayStubDeductionEstimateRequestDto,
  PayStubDto,
  PayType,
  resolveVacationPayRate,
  UpdatePayStubDto,
} from '@gt-automotive/data';
import {
  calculateDeductions,
  getPayrollRates,
  payPeriodLabel,
  SupportedProvince,
} from './canadian-payroll';
import { PdfService } from '../pdf/pdf.service';
import { TimeClockService } from '../time-clock/time-clock.service';
import { AuditRepository } from '../audit/repositories/audit.repository';
import {
  businessDayUtcRange,
  extractBusinessDate,
  toBusinessCalendarDate,
} from '../config/timezone.config';

/** Roles allowed to raise and read every employee's pay stubs. */
const PAYROLL_ADMIN_ROLES = ['ADMIN', 'ACCOUNTANT'];

/** The shop's province of employment, which fixes the provincial tax table. */
const PROVINCE_OF_EMPLOYMENT: SupportedProvince = 'BC';

const round2 = (value: number) => Math.round(value * 100) / 100;
const num = (value: unknown) => Number(value ?? 0);

@Injectable()
export class PayStubsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly auditRepository: AuditRepository,
    private readonly timeClockService: TimeClockService
  ) {}

  /**
   * Raise a pay stub for an employee.
   *
   * Everything the printed document shows is resolved and stored here — the
   * company header, the employee's name, position and rate, the period figures
   * and the year-to-date columns. Nothing is joined live at render time, so a
   * later change to a compensation record, a time entry or the company name
   * cannot alter a stub that has already been issued.
   *
   * Raising the stub is also what pays the hours behind it, so the approved
   * entries it covers are processed here — see processHoursCovered().
   */
  async create(dto: CreatePayStubDto, userId: string): Promise<PayStubDto> {
    const employee = await this.prisma.user.findUnique({
      where: { id: dto.employeeId },
      include: { role: true },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const periodStart = toBusinessCalendarDate(dto.periodStart);
    const periodEnd = toBusinessCalendarDate(dto.periodEnd);
    const payDate = toBusinessCalendarDate(dto.payDate);

    if (periodEnd < periodStart) {
      throw new BadRequestException(
        'Pay period end cannot be before the pay period start'
      );
    }

    const company = await this.prisma.company.findFirst({
      where: { isDefault: true },
    });
    if (!company) {
      throw new BadRequestException(
        'No default company is configured — a pay stub needs a company header'
      );
    }

    const compensation = await this.prisma.employeeCompensation.findFirst({
      where: { employeeId: dto.employeeId, isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });

    // Derived figures are computed here, never accepted from the client, so the
    // arithmetic on the printed stub is always internally consistent.
    const regularHours = round2(dto.regularHours);
    const regularAmount = round2(dto.regularAmount);

    // Vacation accrues on the period's regular earnings, then is held back
    // again, so the pair nets to zero on the cheque while recording what the
    // employee has banked. The rate is the employee's own, or the statutory
    // minimum; the accountant can override either figure.
    const vacationPayRate = round2(
      dto.vacationPayRate ??
        resolveVacationPayRate(compensation?.vacationPayRate)
    );
    const vacationPayAmount = round2(
      dto.vacationPayAmount ??
        calculateVacationPay(regularAmount, vacationPayRate)
    );
    const vacationPayHeld = round2(dto.vacationPayHeld ?? vacationPayAmount);

    // Holding back more vacation than the period earned is not a split, it is a
    // typo — 1228.80 for 122.88 passes the net-pay check, short-pays the
    // employee by a thousand dollars and inflates the vacation the business
    // appears to owe them.
    if (vacationPayHeld > vacationPayAmount) {
      throw new BadRequestException(
        'Vacation pay held cannot exceed the vacation pay earned this period'
      );
    }

    // Money leaving the bank, not new earnings. It stays out of grossPay
    // because it was counted as gross and taxed in the period it was earned;
    // counting it again would inflate the year and tax it twice.
    const vacationPayPaidOut = round2(dto.vacationPayPaidOut ?? 0);

    const grossPay = round2(regularAmount + vacationPayAmount);
    const eiAmount = round2(dto.eiAmount ?? 0);
    const cppAmount = round2(dto.cppAmount ?? 0);
    const incomeTaxAmount = round2(dto.incomeTaxAmount ?? 0);
    const otherDeductions = round2(dto.otherDeductions ?? 0);
    const totalWithholding = round2(
      eiAmount + cppAmount + incomeTaxAmount + otherDeductions + vacationPayHeld
    );
    // Added after withholding, not before: this is already-taxed money being
    // handed over, so it must not attract a second round of deductions.
    const netPay = round2(grossPay - totalWithholding + vacationPayPaidOut);

    if (netPay < 0) {
      throw new BadRequestException(
        'Withholdings exceed gross pay — net pay would be negative'
      );
    }

    // Paying out more vacation than the employee has banked is not a rounding
    // problem, it is paying for time nobody earned. Checked against the balance
    // as it stood before this stub.
    const bankedBefore = await this.vacationBalanceBefore(
      dto.employeeId,
      payDate
    );
    if (vacationPayPaidOut > bankedBefore) {
      throw new BadRequestException(
        `Vacation payout of ${vacationPayPaidOut.toFixed(2)} exceeds the ` +
          `${bankedBefore.toFixed(2)} this employee has banked`
      );
    }

    // Year to date is the sum of this employee's earlier stubs in the same
    // calendar year, plus this one. Computed once and frozen: recomputing at
    // render time would make an old stub change every time a later one is
    // issued, which is exactly what a pay record must not do.
    const priorTotals = await this.sumPriorStubsInYear(dto.employeeId, payDate);

    const payStub = await this.prisma.payStub.create({
      data: {
        employeeId: dto.employeeId,
        periodStart,
        periodEnd,
        payDate,
        companyName: company.name,
        companyAddress: company.address,
        companyBusinessType: company.businessType,
        companyRegistrationNumber: company.registrationNumber,
        companyPhone: company.phone,
        companyEmail: company.email,
        employeeName:
          [employee.firstName, employee.lastName].filter(Boolean).join(' ') ||
          employee.email,
        // The job title lives on the compensation record, which is where it is
        // maintained; the stub freezes a copy so a later change of title does
        // not rewrite documents already issued. An explicit value from the
        // form still wins — a stub can be raised for a role someone held only
        // for that period.
        position: dto.position ?? compensation?.position ?? undefined,
        payRate: dto.payRate ?? null,
        payType: compensation?.payType ?? PayType.HOURLY,
        regularHours,
        regularAmount,
        grossPay,
        vacationPayRate,
        vacationPayAmount,
        vacationPayHeld,
        vacationPayPaidOut,
        vacationPayBalance: round2(
          bankedBefore + vacationPayHeld - vacationPayPaidOut
        ),
        eiAmount,
        cppAmount,
        incomeTaxAmount,
        otherDeductions,
        otherDeductionsLabel: dto.otherDeductionsLabel,
        totalWithholding,
        netPay,
        ytdHours: round2(priorTotals.hours + regularHours),
        ytdRegularAmount: round2(priorTotals.regularAmount + regularAmount),
        ytdGrossPay: round2(priorTotals.grossPay + grossPay),
        ytdVacationPayAmount: round2(
          priorTotals.vacationPayAmount + vacationPayAmount
        ),
        ytdVacationPayHeld: round2(
          priorTotals.vacationPayHeld + vacationPayHeld
        ),
        ytdEiAmount: round2(priorTotals.eiAmount + eiAmount),
        ytdCppAmount: round2(priorTotals.cppAmount + cppAmount),
        ytdIncomeTaxAmount: round2(
          priorTotals.incomeTaxAmount + incomeTaxAmount
        ),
        ytdOtherDeductions: round2(
          priorTotals.otherDeductions + otherDeductions
        ),
        ytdWithholding: round2(priorTotals.totalWithholding + totalWithholding),
        ytdNetPay: round2(priorTotals.netPay + netPay),
        notes: dto.notes,
        generatedBy: userId,
      },
      include: { employee: { include: { role: true } } },
    });

    await this.auditRepository.create({
      userId,
      action: 'CREATE_PAY_STUB',
      resource: 'PayStub',
      resourceId: payStub.id,
      newValue: {
        employeeId: dto.employeeId,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        payDate: dto.payDate,
        grossPay,
        totalWithholding,
        netPay,
      },
    });

    // A stub raised out of pay-date order — a missed period backfilled after a
    // later one was issued — lands in the middle of an existing chain, leaving
    // every stub after it carrying a running total that no longer includes
    // everything before it. Rewriting the year in pay-date order is the same
    // reconciliation an amendment performs, and for the same reason: a year
    // whose stubs disagree with each other surfaces at T4 time, long after
    // anyone could explain it.
    //
    // Run unconditionally rather than only when a later stub exists, so there
    // is one path to be right about instead of two.
    await this.recomputeYearToDate(dto.employeeId, payDate.getUTCFullYear());
    // The balance spans years, so it gets its own pass over the whole record.
    await this.recomputeVacationBalance(dto.employeeId);

    // Re-read: the row above holds the totals computed before the rewrite, and
    // returning those would show the accountant a figure the database no longer
    // agrees with.
    const reconciled = await this.prisma.payStub.findUnique({
      where: { id: payStub.id },
      include: { employee: { include: { role: true } } },
    });

    // Last, because it is the only step that reaches outside the pay stub
    // record: the document and its year are settled before the time entries
    // behind it are.
    const hoursProcessed = await this.processHoursCovered(
      employee,
      periodStart,
      periodEnd,
      regularHours,
      userId
    );

    return { ...this.toDto(reconciled ?? payStub), hoursProcessed };
  }

  /**
   * Mark the approved hours this stub pays for as processed.
   *
   * Raising the stub *is* the payment, so the entries behind it become terminal
   * at that moment: they stop being offered to the next stub, and they can no
   * longer be edited, unapproved or deleted. Without this the same shift could
   * be paid on two stubs with nothing in the record to show it.
   *
   * The catch is that a stub carries an hours *figure*, not a set of entries,
   * and that figure is only ever pre-filled — the accountant may overwrite it
   * to pay an advance, split a period, or simply mistype. Processing is
   * addressed by date range, so a stub for 40 of an available 80 hours would
   * stamp all 80, and the unpaid 40 could never be recovered: nothing
   * un-processes an entry, and no later stub would be offered them again.
   *
   * So the entries are processed only when the stub pays for exactly what the
   * period holds. If the figures disagree — an override, or a shift approved
   * while the form was open — the stub is still raised but the entries are left
   * alone, and the caller is told. Hours left available are visible on the time
   * clock and can be paid or processed deliberately; hours stamped as paid with
   * nothing paying them are silent and permanent, which is the worse of the two.
   *
   * Runs after the stub row exists, for the same reason: a failure here leaves
   * a stub with unprocessed hours, not hours with no stub.
   *
   * A stub can be raised for someone outside payroll time tracking, such as an
   * accountant. They have no time entries to process, so nothing is attempted.
   *
   * @returns whether the covered entries were stamped.
   */
  private async processHoursCovered(
    employee: { id: string; role?: { name: string } | null },
    periodStart: Date,
    periodEnd: Date,
    regularHours: number,
    userId: string
  ): Promise<boolean> {
    if (!this.timeClockService.isPayrollRole(employee.role?.name)) return false;

    // periodStart/periodEnd are calendar dates at midnight UTC. A shift worked
    // at 9am on the last day of the period is a later instant than that, so the
    // range has to cover the business days themselves, not the two instants
    // that name them.
    const { start } = businessDayUtcRange(extractBusinessDate(periodStart));
    const { end } = businessDayUtcRange(extractBusinessDate(periodEnd));
    const startDate = start.toISOString();
    // `end` is the first instant of the next business day and the filter is
    // inclusive, so step back to stay inside the period.
    const endDate = new Date(end.getTime() - 1).toISOString();

    // Recomputed here rather than trusted from whatever the form last saw, so a
    // shift approved between opening the form and saving it is caught.
    const available = await this.timeClockService.calculatePayrollHours(
      employee.id,
      startDate,
      endDate,
      { unprocessedOnly: true }
    );

    if (available.entries.length === 0) return false;
    if (round2(available.hours) !== round2(regularHours)) return false;

    await this.timeClockService.processPayroll(
      { employeeId: employee.id, startDate, endDate },
      userId
    );
    return true;
  }

  /**
   * Correct a stub that has already been issued.
   *
   * Pay stubs are issued documents, so this is a deliberate amendment, not a
   * casual edit: the change is audited with both the old and new figures, and
   * the derived totals are recomputed here rather than accepted from the
   * client, exactly as on create.
   *
   * The awkward part is year-to-date. Those columns are frozen snapshots, so
   * changing an earlier stub leaves every later one carrying a running total
   * that no longer reconciles. Rather than leave the record internally
   * inconsistent — which would surface at T4 time, long after anyone could
   * explain it — the whole calendar year for that employee is rewritten in pay
   * date order. Moving a stub across new year's rewrites both years.
   */
  async update(
    id: string,
    dto: UpdatePayStubDto,
    userId: string
  ): Promise<PayStubDto> {
    const existing = await this.prisma.payStub.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Pay stub not found');
    }

    const periodStart = dto.periodStart
      ? toBusinessCalendarDate(dto.periodStart)
      : existing.periodStart;
    const periodEnd = dto.periodEnd
      ? toBusinessCalendarDate(dto.periodEnd)
      : existing.periodEnd;
    const payDate = dto.payDate
      ? toBusinessCalendarDate(dto.payDate)
      : existing.payDate;

    if (periodEnd < periodStart) {
      throw new BadRequestException(
        'Pay period end cannot be before the pay period start'
      );
    }

    const pick = (next: number | undefined, current: unknown) =>
      round2(next ?? num(current));

    const regularHours = pick(dto.regularHours, existing.regularHours);
    const regularAmount = pick(dto.regularAmount, existing.regularAmount);

    const vacationPayRate = pick(dto.vacationPayRate, existing.vacationPayRate);
    // Correcting the earnings re-accrues vacation on them. Leaving the old
    // figure would quietly break the 4% the stub still claims to apply, so an
    // accountant who means to keep it has to say so with an explicit amount.
    const vacationPayAmount =
      dto.vacationPayAmount !== undefined
        ? round2(dto.vacationPayAmount)
        : dto.regularAmount !== undefined || dto.vacationPayRate !== undefined
        ? calculateVacationPay(regularAmount, vacationPayRate)
        : round2(num(existing.vacationPayAmount));
    const vacationPayHeld =
      dto.vacationPayHeld !== undefined
        ? round2(dto.vacationPayHeld)
        : // The held line tracks the accrual unless it was deliberately split.
        num(existing.vacationPayHeld) === num(existing.vacationPayAmount)
        ? vacationPayAmount
        : round2(num(existing.vacationPayHeld));

    // Holding back more vacation than the period earned is not a split, it is a
    // typo — 1228.80 for 122.88 passes the net-pay check, short-pays the
    // employee by a thousand dollars and inflates the vacation the business
    // appears to owe them.
    if (vacationPayHeld > vacationPayAmount) {
      throw new BadRequestException(
        'Vacation pay held cannot exceed the vacation pay earned this period'
      );
    }

    const vacationPayPaidOut = pick(
      dto.vacationPayPaidOut,
      existing.vacationPayPaidOut
    );

    const grossPay = round2(regularAmount + vacationPayAmount);
    const eiAmount = pick(dto.eiAmount, existing.eiAmount);
    const cppAmount = pick(dto.cppAmount, existing.cppAmount);
    const incomeTaxAmount = pick(dto.incomeTaxAmount, existing.incomeTaxAmount);
    const otherDeductions = pick(dto.otherDeductions, existing.otherDeductions);
    const totalWithholding = round2(
      eiAmount + cppAmount + incomeTaxAmount + otherDeductions + vacationPayHeld
    );
    const netPay = round2(grossPay - totalWithholding + vacationPayPaidOut);

    if (netPay < 0) {
      throw new BadRequestException(
        'Withholdings exceed gross pay — net pay would be negative'
      );
    }

    // Measured against the bank as it stood before this stub, with this stub's
    // own contribution excluded — otherwise an amendment would be checked
    // against a balance that already contains the payout being amended.
    const bankedBefore = await this.vacationBalanceBefore(
      existing.employeeId,
      payDate,
      id
    );
    if (vacationPayPaidOut > bankedBefore) {
      throw new BadRequestException(
        `Vacation payout of ${vacationPayPaidOut.toFixed(2)} exceeds the ` +
          `${bankedBefore.toFixed(2)} this employee had banked`
      );
    }

    await this.prisma.payStub.update({
      where: { id },
      data: {
        periodStart,
        periodEnd,
        payDate,
        position: dto.position === undefined ? undefined : dto.position,
        payRate: dto.payRate === undefined ? undefined : dto.payRate,
        regularHours,
        regularAmount,
        grossPay,
        vacationPayRate,
        vacationPayAmount,
        vacationPayHeld,
        vacationPayPaidOut,
        vacationPayBalance: round2(
          bankedBefore + vacationPayHeld - vacationPayPaidOut
        ),
        eiAmount,
        cppAmount,
        incomeTaxAmount,
        otherDeductions,
        otherDeductionsLabel:
          dto.otherDeductionsLabel === undefined
            ? undefined
            : dto.otherDeductionsLabel,
        totalWithholding,
        netPay,
        notes: dto.notes === undefined ? undefined : dto.notes,
      },
    });

    // Both years, in case the pay date moved across a year boundary — the old
    // year's chain has lost a stub and the new year's has gained one.
    const years = new Set([
      existing.payDate.getUTCFullYear(),
      payDate.getUTCFullYear(),
    ]);
    for (const year of years) {
      await this.recomputeYearToDate(existing.employeeId, year);
    }
    await this.recomputeVacationBalance(existing.employeeId);

    await this.auditRepository.create({
      userId,
      action: 'UPDATE_PAY_STUB',
      resource: 'PayStub',
      resourceId: id,
      oldValue: {
        periodStart: extractBusinessDate(existing.periodStart),
        periodEnd: extractBusinessDate(existing.periodEnd),
        payDate: extractBusinessDate(existing.payDate),
        grossPay: num(existing.grossPay),
        totalWithholding: num(existing.totalWithholding),
        netPay: num(existing.netPay),
      },
      newValue: {
        periodStart: extractBusinessDate(periodStart),
        periodEnd: extractBusinessDate(periodEnd),
        payDate: extractBusinessDate(payDate),
        grossPay,
        totalWithholding,
        netPay,
      },
    });

    // Re-read: the year-to-date rewrite above changed this row after the update.
    const updated = await this.prisma.payStub.findUnique({
      where: { id },
      include: { employee: { include: { role: true } } },
    });

    return this.toDto(updated);
  }

  /**
   * Rewrite one employee's year-to-date columns for a calendar year, walking
   * their stubs in pay date order and accumulating.
   *
   * Ordering is by pay date, then by creation, so two stubs paid the same day
   * accumulate in the order they were raised.
   */
  private async recomputeYearToDate(employeeId: string, year: number) {
    const stubs = await this.prisma.payStub.findMany({
      where: {
        employeeId,
        payDate: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
      orderBy: [{ payDate: 'asc' }, { createdAt: 'asc' }],
    });

    const running = {
      hours: 0,
      regularAmount: 0,
      grossPay: 0,
      vacationPayAmount: 0,
      vacationPayHeld: 0,
      eiAmount: 0,
      cppAmount: 0,
      incomeTaxAmount: 0,
      otherDeductions: 0,
      totalWithholding: 0,
      netPay: 0,
    };

    for (const stub of stubs) {
      running.hours += num(stub.regularHours);
      running.regularAmount += num(stub.regularAmount);
      running.grossPay += num(stub.grossPay);
      running.vacationPayAmount += num(stub.vacationPayAmount);
      running.vacationPayHeld += num(stub.vacationPayHeld);
      running.eiAmount += num(stub.eiAmount);
      running.cppAmount += num(stub.cppAmount);
      running.incomeTaxAmount += num(stub.incomeTaxAmount);
      running.otherDeductions += num(stub.otherDeductions);
      running.totalWithholding += num(stub.totalWithholding);
      running.netPay += num(stub.netPay);

      await this.prisma.payStub.update({
        where: { id: stub.id },
        data: {
          ytdHours: round2(running.hours),
          ytdRegularAmount: round2(running.regularAmount),
          ytdGrossPay: round2(running.grossPay),
          ytdVacationPayAmount: round2(running.vacationPayAmount),
          ytdVacationPayHeld: round2(running.vacationPayHeld),
          ytdEiAmount: round2(running.eiAmount),
          ytdCppAmount: round2(running.cppAmount),
          ytdIncomeTaxAmount: round2(running.incomeTaxAmount),
          ytdOtherDeductions: round2(running.otherDeductions),
          ytdWithholding: round2(running.totalWithholding),
          ytdNetPay: round2(running.netPay),
        },
      });
    }
  }

  /**
   * What this employee currently has banked in vacation.
   *
   * Read by the pay stub form so the accountant can see what is available
   * before typing a payout, rather than guessing and being refused on save.
   */
  async getVacationBalance(
    employeeId: string,
    currentUser: any
  ): Promise<{ employeeId: string; balance: number }> {
    this.assertCanAccessEmployee(employeeId, currentUser);

    const stubs = await this.prisma.payStub.findMany({
      where: { employeeId },
      select: { vacationPayHeld: true, vacationPayPaidOut: true },
    });

    return {
      employeeId,
      balance: round2(
        stubs.reduce(
          (balance, stub) =>
            balance + num(stub.vacationPayHeld) - num(stub.vacationPayPaidOut),
          0
        )
      ),
    };
  }

  /**
   * Vacation banked by this employee immediately before a given pay date.
   *
   * Everything held to date, less everything paid out to date. Note what this
   * does *not* do: scope itself to a calendar year. The ytd columns reset each
   * January because that is how earnings are reported, but a vacation bank does
   * not — vacation earned in December is usually taken the following spring,
   * and resetting it would either erase the liability or pay it twice.
   *
   * Bounded above by the pay date so a stub backfilled into the middle of the
   * year is measured against the bank as it stood then, not as it stands now.
   */
  private async vacationBalanceBefore(
    employeeId: string,
    payDate: Date,
    excludeStubId?: string
  ): Promise<number> {
    const earlier = await this.prisma.payStub.findMany({
      where: {
        employeeId,
        payDate: { lt: payDate },
        ...(excludeStubId ? { id: { not: excludeStubId } } : {}),
      },
      select: { vacationPayHeld: true, vacationPayPaidOut: true },
    });

    return round2(
      earlier.reduce(
        (balance, stub) =>
          balance + num(stub.vacationPayHeld) - num(stub.vacationPayPaidOut),
        0
      )
    );
  }

  /**
   * Rewrite the vacation balance on every stub this employee has, in pay date
   * order.
   *
   * Separate from recomputeYearToDate() and deliberately not year-scoped: the
   * balance is a running total over the whole employment. Correcting a stub in
   * March has to carry through to the following February, which a per-year
   * rewrite would never reach.
   */
  private async recomputeVacationBalance(employeeId: string) {
    const stubs = await this.prisma.payStub.findMany({
      where: { employeeId },
      orderBy: [{ payDate: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        vacationPayHeld: true,
        vacationPayPaidOut: true,
        vacationPayBalance: true,
      },
    });

    let balance = 0;
    for (const stub of stubs) {
      balance = round2(
        balance + num(stub.vacationPayHeld) - num(stub.vacationPayPaidOut)
      );
      // Only write where it actually moved — a correction early in the record
      // otherwise rewrites every stub the employee has ever had.
      if (round2(num(stub.vacationPayBalance)) !== balance) {
        await this.prisma.payStub.update({
          where: { id: stub.id },
          data: { vacationPayBalance: balance },
        });
      }
    }
  }

  /**
   * What CPP, EI and income tax the CRA formulas say should come off a given
   * gross — a suggestion for the accountant, never applied on its own.
   *
   * Year-to-date CPP and EI come from this employee's earlier stubs in the same
   * calendar year, because both stop at an annual maximum: the same $2,000 of
   * pay attracts different contributions in January and in November. That makes
   * the estimate only as good as the stubs already in the system — pay run
   * outside it, and the maximums will be reached late.
   *
   * Returns `supported: false` rather than a figure when the pay date falls in
   * a year with no rate table. A number computed from the wrong year's rates
   * would look exactly as trustworthy as a right one.
   */
  async estimateDeductions(
    dto: PayStubDeductionEstimateRequestDto
  ): Promise<PayStubDeductionEstimateDto> {
    const employee = await this.prisma.user.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const payDate = toBusinessCalendarDate(dto.payDate);
    const taxYear = payDate.getUTCFullYear();
    const priorTotals = await this.sumPriorStubsInYear(dto.employeeId, payDate);

    const empty = {
      taxYear,
      province: PROVINCE_OF_EMPLOYMENT,
      payPeriodsPerYear: dto.payPeriodsPerYear,
      ytdGrossPay: round2(priorTotals.grossPay),
      ytdCpp: round2(priorTotals.cppAmount),
      ytdEi: round2(priorTotals.eiAmount),
    };

    const rates = getPayrollRates(PROVINCE_OF_EMPLOYMENT, taxYear);
    if (!rates) {
      return {
        ...empty,
        supported: false,
        ei: 0,
        cpp: 0,
        cpp2: 0,
        incomeTax: 0,
        federalTax: 0,
        provincialTax: 0,
        annualTaxableIncome: 0,
        cppMaxedOut: false,
        eiMaxedOut: false,
        assumptions: [
          `No CRA rate table is held for ${taxYear}. Enter the deductions manually, or add the ${taxYear} rates from the CRA's T4127 guide.`,
        ],
      };
    }

    const estimate = calculateDeductions({
      grossPay: dto.grossPay,
      payPeriodsPerYear: dto.payPeriodsPerYear,
      ytdCpp: priorTotals.cppAmount,
      ytdEi: priorTotals.eiAmount,
      ytdGrossPay: priorTotals.grossPay,
      province: PROVINCE_OF_EMPLOYMENT,
      taxYear,
    });

    // getPayrollRates just confirmed the year is supported, so this holds.
    if (!estimate) {
      throw new BadRequestException(
        `Could not calculate deductions for ${taxYear}`
      );
    }

    const assumptions = [
      `${taxYear} CRA rates, ${PROVINCE_OF_EMPLOYMENT} — ${payPeriodLabel(
        dto.payPeriodsPerYear
      ).toLowerCase()} (${dto.payPeriodsPerYear} pay periods).`,
      'Basic personal amounts only (TD1 claim code 1) — an employee claiming more will be over-deducted.',
      'No RRSP, pension, union dues or other tax-deductible amounts.',
    ];
    if (estimate.cppMaxedOut) {
      assumptions.push(
        'CPP has reached the annual maximum, so this period takes only the remainder.'
      );
    }
    if (estimate.eiMaxedOut) {
      assumptions.push(
        'EI has reached the annual maximum, so this period takes only the remainder.'
      );
    }
    if (priorTotals.grossPay === 0) {
      assumptions.push(
        'No earlier stub this year, so the annual maximums are treated as untouched.'
      );
    }

    return { ...empty, supported: true, ...estimate, assumptions };
  }

  /**
   * Pay stubs for one employee, newest first.
   *
   * An employee may only ever read their own; payroll roles may read anyone's.
   */
  async findForEmployee(
    employeeId: string,
    currentUser: any
  ): Promise<PayStubDto[]> {
    this.assertCanAccessEmployee(employeeId, currentUser);

    const stubs = await this.prisma.payStub.findMany({
      where: { employeeId },
      include: { employee: { include: { role: true } } },
      orderBy: [{ payDate: 'desc' }, { createdAt: 'desc' }],
    });

    return stubs.map((stub) => this.toDto(stub));
  }

  /** Every pay stub, newest first. Payroll roles only. */
  async findAll(currentUser: any, employeeId?: string): Promise<PayStubDto[]> {
    if (!PAYROLL_ADMIN_ROLES.includes(currentUser?.role?.name)) {
      throw new ForbiddenException(
        'Only admins and accountants can list all pay stubs'
      );
    }

    const stubs = await this.prisma.payStub.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: { include: { role: true } } },
      orderBy: [{ payDate: 'desc' }, { createdAt: 'desc' }],
    });

    return stubs.map((stub) => this.toDto(stub));
  }

  async findOne(id: string, currentUser: any): Promise<PayStubDto> {
    const stub = await this.getAccessibleStub(id, currentUser);
    return this.toDto(stub);
  }

  /**
   * Render the stub as a PDF, on demand. Nothing is stored — the document is
   * rebuilt from the frozen row each time it is viewed, printed or emailed.
   */
  async generatePdf(id: string, currentUser: any): Promise<Buffer> {
    const stub = await this.getAccessibleStub(id, currentUser);
    const html = this.pdfService.generatePayStubHtml(this.toDto(stub));
    return this.pdfService.generatePdfFromHtml(html);
  }

  /**
   * Filename for a downloaded/printed stub, e.g.
   * `paystub-2026-01-31-rohit-toora.pdf`.
   */
  async getPdfFilename(id: string, currentUser: any): Promise<string> {
    const stub = await this.getAccessibleStub(id, currentUser);
    const slug = stub.employeeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `paystub-${extractBusinessDate(stub.payDate)}-${slug}.pdf`;
  }

  private async getAccessibleStub(id: string, currentUser: any) {
    const stub = await this.prisma.payStub.findUnique({
      where: { id },
      include: { employee: { include: { role: true } } },
    });
    if (!stub) {
      throw new NotFoundException('Pay stub not found');
    }
    this.assertCanAccessEmployee(stub.employeeId, currentUser);
    return stub;
  }

  /**
   * Pay data is the most sensitive thing in the system: an employee sees their
   * own stubs and nobody else's. Being a supervisor or foreman is not enough —
   * only admins and accountants, who raise them, can read another person's.
   */
  private assertCanAccessEmployee(employeeId: string, currentUser: any) {
    const role = currentUser?.role?.name;
    if (PAYROLL_ADMIN_ROLES.includes(role)) return;
    if (currentUser?.id && currentUser.id === employeeId) return;
    throw new ForbiddenException('You can only view your own pay stubs');
  }

  /**
   * Totals across the employee's existing stubs in the same calendar year as
   * `payDate`, used as the running start for this stub's YTD columns.
   *
   * Scoped by pay date year, matching how the printed stub is read: a stub paid
   * in January carries January's year-to-date regardless of which period it
   * covers.
   */
  /**
   * This employee's stubs in the same calendar year up to and including
   * `payDate`.
   *
   * The upper bound matters. Stubs are not always raised in pay-date order — a
   * missed period gets backfilled, and this feature exists partly to run
   * payroll after a period has closed. Summing the whole year would count a
   * *later* stub as prior, overstating year-to-date on the one being raised and
   * understating the CPP and EI room left when deductions are estimated.
   */
  private async sumPriorStubsInYear(employeeId: string, payDate: Date) {
    const year = payDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));

    const priorStubs = await this.prisma.payStub.findMany({
      where: {
        employeeId,
        // Inclusive: a stub already issued for this same pay date is earlier in
        // the chain, since recomputeYearToDate() breaks ties on creation order.
        payDate: { gte: yearStart, lte: payDate },
      },
    });

    return priorStubs.reduce(
      (acc, stub) => ({
        hours: acc.hours + num(stub.regularHours),
        regularAmount: acc.regularAmount + num(stub.regularAmount),
        grossPay: acc.grossPay + num(stub.grossPay),
        vacationPayAmount: acc.vacationPayAmount + num(stub.vacationPayAmount),
        vacationPayHeld: acc.vacationPayHeld + num(stub.vacationPayHeld),
        eiAmount: acc.eiAmount + num(stub.eiAmount),
        cppAmount: acc.cppAmount + num(stub.cppAmount),
        incomeTaxAmount: acc.incomeTaxAmount + num(stub.incomeTaxAmount),
        otherDeductions: acc.otherDeductions + num(stub.otherDeductions),
        totalWithholding: acc.totalWithholding + num(stub.totalWithholding),
        netPay: acc.netPay + num(stub.netPay),
      }),
      {
        hours: 0,
        regularAmount: 0,
        grossPay: 0,
        vacationPayAmount: 0,
        vacationPayHeld: 0,
        eiAmount: 0,
        cppAmount: 0,
        incomeTaxAmount: 0,
        otherDeductions: 0,
        totalWithholding: 0,
        netPay: 0,
      }
    );
  }

  private toDto(stub: any): PayStubDto {
    return {
      id: stub.id,
      employeeId: stub.employeeId,
      employee: stub.employee
        ? {
            id: stub.employee.id,
            firstName: stub.employee.firstName || undefined,
            lastName: stub.employee.lastName || undefined,
            email: stub.employee.email,
          }
        : undefined,
      periodStart: extractBusinessDate(stub.periodStart),
      periodEnd: extractBusinessDate(stub.periodEnd),
      payDate: extractBusinessDate(stub.payDate),
      companyName: stub.companyName,
      companyAddress: stub.companyAddress || undefined,
      companyBusinessType: stub.companyBusinessType || undefined,
      companyRegistrationNumber: stub.companyRegistrationNumber || undefined,
      companyPhone: stub.companyPhone || undefined,
      companyEmail: stub.companyEmail || undefined,
      employeeName: stub.employeeName,
      position: stub.position || undefined,
      payRate: stub.payRate == null ? undefined : num(stub.payRate),
      payType: stub.payType,
      regularHours: num(stub.regularHours),
      regularAmount: num(stub.regularAmount),
      grossPay: num(stub.grossPay),
      vacationPayRate: num(stub.vacationPayRate),
      vacationPayAmount: num(stub.vacationPayAmount),
      vacationPayHeld: num(stub.vacationPayHeld),
      vacationPayPaidOut: num(stub.vacationPayPaidOut),
      vacationPayBalance: num(stub.vacationPayBalance),
      eiAmount: num(stub.eiAmount),
      cppAmount: num(stub.cppAmount),
      incomeTaxAmount: num(stub.incomeTaxAmount),
      otherDeductions: num(stub.otherDeductions),
      otherDeductionsLabel: stub.otherDeductionsLabel || undefined,
      totalWithholding: num(stub.totalWithholding),
      netPay: num(stub.netPay),
      ytdHours: num(stub.ytdHours),
      ytdRegularAmount: num(stub.ytdRegularAmount),
      ytdGrossPay: num(stub.ytdGrossPay),
      ytdVacationPayAmount: num(stub.ytdVacationPayAmount),
      ytdVacationPayHeld: num(stub.ytdVacationPayHeld),
      ytdEiAmount: num(stub.ytdEiAmount),
      ytdCppAmount: num(stub.ytdCppAmount),
      ytdIncomeTaxAmount: num(stub.ytdIncomeTaxAmount),
      ytdOtherDeductions: num(stub.ytdOtherDeductions),
      ytdWithholding: num(stub.ytdWithholding),
      ytdNetPay: num(stub.ytdNetPay),
      notes: stub.notes || undefined,
      generatedBy: stub.generatedBy,
      createdAt: stub.createdAt.toISOString(),
    };
  }
}
