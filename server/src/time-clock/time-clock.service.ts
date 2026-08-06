import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import {
  BreakType,
  ClockInDto,
  ClockOutDto,
  CreatePayrollAdjustmentDto,
  CreateTimeEntryDto,
  PayrollAdjustmentType,
  PayType,
  ProcessPayrollDto,
  StartBreakDto,
  TimeEntrySource,
  TimeEntryStatus,
  UpdateTimeEntryDto,
  UpsertEmployeeCompensationDto,
} from '@gt-automotive/data';
import { AuditRepository } from '../audit/repositories/audit.repository';

const ACTIVE_TIME_ENTRY_STATUSES = [
  TimeEntryStatus.OPEN,
  TimeEntryStatus.ON_BREAK,
];
/**
 * Work the business has agreed to pay for: approved, and approved-then-paid.
 * Processing moves an entry from one to the other, so anything counting payable
 * hours must accept both or the totals collapse the moment payroll is run.
 */
const PAYABLE_TIME_ENTRY_STATUSES = [
  TimeEntryStatus.APPROVED,
  TimeEntryStatus.PROCESSED,
];
const STAFF_PAYROLL_ROLES = ['ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF'];

@Injectable()
export class TimeClockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditRepository: AuditRepository
  ) {}

  async upsertCompensation(
    employeeId: string,
    dto: UpsertEmployeeCompensationDto,
    userId: string
  ) {
    await this.assertPayrollEmployee(employeeId);
    this.validateCompensation(dto);

    const effectiveFrom = dto.effectiveFrom
      ? new Date(dto.effectiveFrom)
      : new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.employeeCompensation.updateMany({
        where: { employeeId, isActive: true },
        data: { isActive: false, effectiveTo: effectiveFrom },
      });

      return tx.employeeCompensation.create({
        data: {
          employeeId,
          position: dto.position?.trim() || null,
          payType: dto.payType as any,
          hourlyRate: dto.hourlyRate,
          annualSalary: dto.annualSalary,
          expectedWeeklyHours: dto.expectedWeeklyHours,
          effectiveFrom,
          createdBy: userId,
        },
      });
    });

    await this.auditRepository.create({
      userId,
      action: 'UPSERT_COMPENSATION',
      resource: 'EmployeeCompensation',
      resourceId: result.id,
      newValue: result,
    });

    return this.toCompensationDto(result);
  }

  async getCompensation(employeeId: string) {
    await this.assertPayrollEmployee(employeeId);
    const compensation = await this.prisma.employeeCompensation.findFirst({
      where: { employeeId, isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });

    return compensation ? this.toCompensationDto(compensation) : null;
  }

  async clockIn(employeeId: string, dto: ClockInDto) {
    await this.assertPayrollEmployee(employeeId);
    const current = await this.findCurrentEntry(employeeId);

    if (current) {
      throw new BadRequestException('Employee is already clocked in');
    }

    const entry = await this.prisma.timeEntry.create({
      data: {
        employeeId,
        clockInAt: new Date(),
        status: TimeEntryStatus.OPEN as any,
        source: 'EMPLOYEE' as any,
        notes: dto.notes,
      },
      include: this.timeEntryInclude(),
    });

    return this.toTimeEntryDto(entry);
  }

  async startBreak(employeeId: string, dto: StartBreakDto) {
    const entry = await this.requireCurrentEntry(employeeId);

    if (entry.status === TimeEntryStatus.ON_BREAK) {
      throw new BadRequestException('Employee is already on break');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.breakEntry.create({
        data: {
          timeEntryId: entry.id,
          breakType: (dto.breakType || BreakType.MEAL) as any,
          isPaid: dto.isPaid ?? false,
          notes: dto.notes,
          startAt: new Date(),
        },
      });

      return tx.timeEntry.update({
        where: { id: entry.id },
        data: { status: TimeEntryStatus.ON_BREAK as any },
        include: this.timeEntryInclude(),
      });
    });

    return this.toTimeEntryDto(updated);
  }

  async endBreak(employeeId: string) {
    const entry = await this.requireCurrentEntry(employeeId);
    const openBreak = entry.breaks.find((breakEntry) => !breakEntry.endAt);

    if (!openBreak) {
      throw new BadRequestException('No active break found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.breakEntry.update({
        where: { id: openBreak.id },
        data: { endAt: new Date() },
      });

      return tx.timeEntry.update({
        where: { id: entry.id },
        data: { status: TimeEntryStatus.OPEN as any },
        include: this.timeEntryInclude(),
      });
    });

    return this.toTimeEntryDto(updated);
  }

  async clockOut(employeeId: string, dto: ClockOutDto) {
    const entry = await this.requireCurrentEntry(employeeId);
    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.breakEntry.updateMany({
        where: { timeEntryId: entry.id, endAt: null },
        data: { endAt: now, notes: 'Auto-ended on clock out' },
      });

      return tx.timeEntry.update({
        where: { id: entry.id },
        data: {
          clockOutAt: now,
          status: TimeEntryStatus.CLOCKED_OUT as any,
          notes: dto.notes ?? entry.notes,
        },
        include: this.timeEntryInclude(),
      });
    });

    return this.toTimeEntryDto(updated);
  }

  async getCurrentForEmployee(employeeId: string) {
    const entry = await this.findCurrentEntry(employeeId);
    return entry ? this.toTimeEntryDto(entry) : null;
  }

  async getCurrentEntries() {
    const entries = await this.prisma.timeEntry.findMany({
      where: { status: { in: ACTIVE_TIME_ENTRY_STATUSES as any[] } },
      include: this.timeEntryInclude(),
      orderBy: { clockInAt: 'asc' },
    });

    return entries.map((entry) => this.toTimeEntryDto(entry));
  }

  async getEntries(
    filters: {
      employeeId?: string;
      startDate?: string;
      endDate?: string;
      status?: TimeEntryStatus;
    },
    currentUser: any
  ) {
    // STAFF only ever see their own entries. Every other role that reaches this
    // endpoint — ADMIN, FOREMAN, SUPERVISOR and ACCOUNTANT — is trusted with
    // the whole team, so the employee filter is theirs to choose. Stated as an
    // explicit list rather than "not STAFF" so adding a role to the guard is a
    // deliberate decision here too, not an accident of the default branch.
    const role = currentUser?.role?.name;
    const canViewAllEmployees = [
      'ADMIN',
      'FOREMAN',
      'SUPERVISOR',
      'ACCOUNTANT',
    ].includes(role);
    const employeeId = canViewAllEmployees
      ? filters.employeeId
      : currentUser.id;

    const entries = await this.prisma.timeEntry.findMany({
      where: {
        employeeId,
        status: filters.status as any,
        clockInAt: this.dateRangeFilter(filters.startDate, filters.endDate),
      },
      include: this.timeEntryInclude(),
      orderBy: { clockInAt: 'desc' },
    });

    return entries.map((entry) => this.toTimeEntryDto(entry));
  }

  async createManualEntry(dto: CreateTimeEntryDto, userId: string) {
    await this.assertPayrollEmployee(dto.employeeId);

    const clockInAt = new Date(dto.clockInAt);
    const clockOutAt = new Date(dto.clockOutAt);

    if (
      Number.isNaN(clockInAt.getTime()) ||
      Number.isNaN(clockOutAt.getTime())
    ) {
      throw new BadRequestException('Invalid clock in or clock out time');
    }

    if (clockOutAt <= clockInAt) {
      throw new BadRequestException('Clock out must be after clock in');
    }

    const breakMinutes = dto.breakMinutes ? Math.round(dto.breakMinutes) : 0;
    if (breakMinutes < 0) {
      throw new BadRequestException('Break minutes cannot be negative');
    }
    const grossMinutes = this.diffMinutes(clockInAt, clockOutAt);
    if (breakMinutes >= grossMinutes) {
      throw new BadRequestException(
        'Break must be shorter than the total worked time'
      );
    }

    const entry = await this.prisma.timeEntry.create({
      data: {
        employeeId: dto.employeeId,
        clockInAt,
        clockOutAt,
        status: TimeEntryStatus.CLOCKED_OUT as any,
        source: TimeEntrySource.ADMIN as any,
        notes: dto.notes,
        adjustedBy: userId,
        adjustmentReason: dto.reason?.trim() || 'Manual entry added by admin',
        breaks: breakMinutes
          ? {
              create: {
                breakType: BreakType.MEAL as any,
                isPaid: false,
                startAt: clockInAt,
                endAt: new Date(clockInAt.getTime() + breakMinutes * 60000),
                notes: 'Manual break added by admin',
              },
            }
          : undefined,
      },
      include: this.timeEntryInclude(),
    });

    await this.auditRepository.create({
      userId,
      action: 'CREATE_TIME_ENTRY',
      resource: 'TimeEntry',
      resourceId: entry.id,
      newValue: entry,
    });

    return this.toTimeEntryDto(entry);
  }

  /**
   * A processed entry is the evidence behind money that has already left the
   * business. Changing it after the fact would leave the pay that was issued
   * unsupported by the record it was calculated from, so every mutation stops
   * here rather than each one remembering to check.
   */
  private assertNotProcessed(
    entry: { payrollProcessedAt?: Date | null },
    action: string
  ) {
    if (entry.payrollProcessedAt) {
      throw new BadRequestException(
        `Cannot ${action} an entry that has already been processed for payroll`
      );
    }
  }

  async updateEntry(id: string, dto: UpdateTimeEntryDto, userId: string) {
    const existing = await this.prisma.timeEntry.findUnique({
      where: { id },
      include: this.timeEntryInclude(),
    });

    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }

    this.assertNotProcessed(existing, 'edit');

    if (existing.status === TimeEntryStatus.APPROVED) {
      throw new BadRequestException(
        'Approved entries must be unapproved before editing'
      );
    }

    if (!dto.adjustmentReason?.trim()) {
      throw new BadRequestException('Adjustment reason is required');
    }

    const clockInAt = dto.clockInAt
      ? new Date(dto.clockInAt)
      : existing.clockInAt;
    const clockOutAt = dto.clockOutAt
      ? new Date(dto.clockOutAt)
      : existing.clockOutAt;

    const replaceBreaks = dto.breakMinutes !== undefined;
    const breakMinutes = replaceBreaks ? Math.round(dto.breakMinutes || 0) : 0;

    if (replaceBreaks) {
      if (breakMinutes < 0) {
        throw new BadRequestException('Break minutes cannot be negative');
      }
      const grossMinutes = this.diffMinutes(
        clockInAt,
        clockOutAt || new Date()
      );
      if (breakMinutes >= grossMinutes) {
        throw new BadRequestException(
          'Break must be shorter than the total worked time'
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (replaceBreaks) {
        await tx.breakEntry.deleteMany({ where: { timeEntryId: id } });
        if (breakMinutes > 0) {
          await tx.breakEntry.create({
            data: {
              timeEntryId: id,
              breakType: BreakType.MEAL as any,
              isPaid: false,
              startAt: clockInAt,
              endAt: new Date(clockInAt.getTime() + breakMinutes * 60000),
              notes: 'Break adjusted by admin',
            },
          });
        }
      }

      return tx.timeEntry.update({
        where: { id },
        data: {
          clockInAt: dto.clockInAt ? new Date(dto.clockInAt) : undefined,
          clockOutAt: dto.clockOutAt ? new Date(dto.clockOutAt) : undefined,
          notes: dto.notes,
          adjustedBy: userId,
          adjustmentReason: dto.adjustmentReason,
          status: TimeEntryStatus.ADJUSTED as any,
        },
        include: this.timeEntryInclude(),
      });
    });

    await this.auditRepository.create({
      userId,
      action: 'UPDATE_TIME_ENTRY',
      resource: 'TimeEntry',
      resourceId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toTimeEntryDto(updated);
  }

  async approveEntry(id: string, userId: string) {
    const existing = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }
    if (!existing.clockOutAt) {
      throw new BadRequestException('Cannot approve an open time entry');
    }
    this.assertNotProcessed(existing, 'approve');

    const updated = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        status: TimeEntryStatus.APPROVED as any,
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: this.timeEntryInclude(),
    });

    await this.auditRepository.create({
      userId,
      action: 'APPROVE_TIME_ENTRY',
      resource: 'TimeEntry',
      resourceId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toTimeEntryDto(updated);
  }

  async unapproveEntry(id: string, userId: string) {
    const existing = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }
    // Processed first: it is the stronger rule, and a processed entry is no
    // longer APPROVED, so the status check alone would refuse it for the wrong
    // reason and tell the user something unhelpful.
    this.assertNotProcessed(existing, 'unapprove');
    if (existing.status !== TimeEntryStatus.APPROVED) {
      throw new BadRequestException('Only approved entries can be unapproved');
    }

    const updated = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        status: TimeEntryStatus.CLOCKED_OUT as any,
        approvedBy: null,
        approvedAt: null,
      },
      include: this.timeEntryInclude(),
    });

    await this.auditRepository.create({
      userId,
      action: 'UNAPPROVE_TIME_ENTRY',
      resource: 'TimeEntry',
      resourceId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toTimeEntryDto(updated);
  }

  async deleteEntry(id: string, userId: string) {
    const existing = await this.prisma.timeEntry.findUnique({
      where: { id },
      include: this.timeEntryInclude(),
    });
    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }
    this.assertNotProcessed(existing, 'delete');

    await this.prisma.timeEntry.delete({ where: { id } });

    await this.auditRepository.create({
      userId,
      action: 'DELETE_TIME_ENTRY',
      resource: 'TimeEntry',
      resourceId: id,
      oldValue: existing,
    });

    return { id };
  }

  async voidEntry(id: string, userId: string, reason?: string) {
    const existing = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Time entry not found');
    }
    this.assertNotProcessed(existing, 'void');

    const updated = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        status: TimeEntryStatus.VOIDED as any,
        adjustedBy: userId,
        adjustmentReason: reason || 'Voided by admin',
      },
      include: this.timeEntryInclude(),
    });

    await this.auditRepository.create({
      userId,
      action: 'VOID_TIME_ENTRY',
      resource: 'TimeEntry',
      resourceId: id,
      oldValue: existing,
      newValue: updated,
    });

    return this.toTimeEntryDto(updated);
  }

  async createAdjustment(dto: CreatePayrollAdjustmentDto, userId: string) {
    await this.assertPayrollEmployee(dto.employeeId);

    if (dto.amount <= 0) {
      throw new BadRequestException(
        'Adjustment amount must be greater than zero'
      );
    }

    const adjustment = await this.prisma.payrollAdjustment.create({
      data: {
        employeeId: dto.employeeId,
        type: (dto.type || PayrollAdjustmentType.BONUS) as any,
        amount: dto.amount,
        reason: dto.reason,
        notes: dto.notes,
        effectiveDate: new Date(dto.effectiveDate),
        createdBy: userId,
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: { employee: { include: { role: true } } },
    });

    await this.auditRepository.create({
      userId,
      action: 'CREATE_PAYROLL_ADJUSTMENT',
      resource: 'PayrollAdjustment',
      resourceId: adjustment.id,
      newValue: adjustment,
    });

    return this.toAdjustmentDto(adjustment);
  }

  async getAdjustments(filters: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const adjustments = await this.prisma.payrollAdjustment.findMany({
      where: {
        employeeId: filters.employeeId,
        effectiveDate: this.dateRangeFilter(filters.startDate, filters.endDate),
      },
      include: { employee: { include: { role: true } } },
      orderBy: { effectiveDate: 'desc' },
    });

    return adjustments.map((adjustment) => this.toAdjustmentDto(adjustment));
  }

  /**
   * Hours and gross pay for one employee over a date range. Pure read — this
   * method never writes, so it is safe to call from anything that only wants
   * the numbers (the pay stub form pre-fill, the accountant's hours view).
   *
   * It is the single source of truth for "what is this employee paid for this
   * period": processPayroll() below consumes it too, so the figure a stub shows
   * and the figure payroll processes can never be computed two different ways.
   *
   * `unprocessedOnly` is the only behavioural difference between the callers:
   *  - true  — approved entries not yet stamped for payroll. What
   *            processPayroll() must use, so hours are never paid twice.
   *  - false — every approved entry in the period, stamped or not. What a pay
   *            stub needs: the stub describes a period, and must not collapse
   *            to zero just because payroll was processed before it was issued.
   *
   * Unapproved entries never count, under either flag. An employee should not
   * be paid from a time entry nobody has approved.
   */
  async calculatePayrollHours(
    employeeId: string,
    startDate: string,
    endDate: string,
    options: { unprocessedOnly: boolean }
  ) {
    const entries = await this.prisma.timeEntry.findMany({
      where: {
        employeeId,
        status: options.unprocessedOnly
          ? (TimeEntryStatus.APPROVED as any)
          : ({ in: PAYABLE_TIME_ENTRY_STATUSES as any[] } as any),
        ...(options.unprocessedOnly ? { payrollProcessedAt: null } : {}),
        clockInAt: this.dateRangeFilter(startDate, endDate),
      },
      include: this.timeEntryInclude(),
    });

    const hours = this.round2(
      entries.reduce(
        (sum, entry) => sum + this.calculateMinutes(entry).paidMinutes / 60,
        0
      )
    );

    const compensation = await this.prisma.employeeCompensation.findFirst({
      where: { employeeId, isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });

    // A salaried employee has no hourly rate to multiply by, so hours × rate
    // would report $0 gross and quietly understate their pay. Prorate the
    // annual salary over the period instead, and tell the caller which basis
    // was used so it can label the figure honestly.
    const isHourly = compensation?.payType === PayType.HOURLY;
    const hourlyRate = isHourly ? Number(compensation?.hourlyRate || 0) : 0;
    const salaryPay =
      compensation?.payType === PayType.SALARIED
        ? this.calculateSalaryForPeriod(
            Number(compensation.annualSalary || 0),
            startDate,
            endDate
          )
        : 0;
    const grossPay = this.round2(hours * hourlyRate + salaryPay);

    return {
      employeeId,
      startDate,
      endDate,
      entries,
      entryCount: entries.length,
      hours,
      payType: compensation?.payType,
      hasCompensation: Boolean(compensation),
      // Carried so the pay stub form can pre-fill the job title without a
      // second round trip for the compensation record.
      position: compensation?.position || undefined,
      hourlyRate,
      salaryPay,
      grossPay,
    };
  }

  /**
   * Read-only wrapper for callers outside payroll processing — the accountant's
   * hours view and the pay stub form pre-fill. Deliberately a separate entry
   * point from processPayroll() so that reading the numbers can never stamp
   * entries as processed.
   *
   * Returns one row per payroll-eligible employee, or a single row when
   * `employeeId` is given. Each row is produced by calculatePayrollHours(), so
   * the totals an accountant reviews and the figures a stub is pre-filled with
   * are the same calculation rather than two that can drift apart.
   */
  async getPayrollHours(
    startDate: string,
    endDate: string,
    employeeId?: string
  ) {
    if (employeeId) {
      await this.assertPayrollEmployee(employeeId);
    }

    // The employee summary rides along on each row so the accountant's view can
    // show names without also being granted GET /api/users, which would expose
    // far more than the payroll roster.
    const employees = await this.prisma.user.findMany({
      where: employeeId
        ? { id: employeeId }
        : { role: { name: { in: STAFF_PAYROLL_ROLES as any[] } } },
      include: { role: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    // One calculation per employee rather than a single grouped query: the team
    // is small, and sharing calculatePayrollHours() with processPayroll()
    // matters more here than saving a few round trips.
    return Promise.all(
      employees.map(async (employee) => {
        const { entries, ...summary } = await this.calculatePayrollHours(
          employee.id,
          startDate,
          endDate,
          { unprocessedOnly: false }
        );
        return {
          ...summary,
          employee: this.toEmployeeDto(employee),
          processedHours: this.round2(
            entries
              .filter((entry) => entry.payrollProcessedAt)
              .reduce(
                (sum, entry) =>
                  sum + this.calculateMinutes(entry).paidMinutes / 60,
                0
              )
          ),
        };
      })
    );
  }

  async processPayroll(dto: ProcessPayrollDto, userId: string) {
    await this.assertPayrollEmployee(dto.employeeId);

    const {
      entries,
      hours: processedHours,
      grossPay,
    } = await this.calculatePayrollHours(
      dto.employeeId,
      dto.startDate,
      dto.endDate,
      { unprocessedOnly: true }
    );

    const processedAt = new Date();

    if (entries.length > 0) {
      await this.prisma.timeEntry.updateMany({
        where: { id: { in: entries.map((entry) => entry.id) } },
        data: {
          // The status carries the outcome, not just the timestamp: an entry
          // that has been paid should not still read as merely "approved".
          status: TimeEntryStatus.PROCESSED as any,
          payrollProcessedAt: processedAt,
          payrollProcessedBy: userId,
        },
      });
    }

    await this.auditRepository.create({
      userId,
      action: 'PROCESS_PAYROLL_HOURS',
      resource: 'TimeEntry',
      resourceId: dto.employeeId,
      newValue: {
        employeeId: dto.employeeId,
        entryIds: entries.map((entry) => entry.id),
        processedAt,
        processedHours,
        grossPay,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });

    return {
      employeeId: dto.employeeId,
      processedEntries: entries.length,
      processedHours,
      grossPay,
      processedAt: processedAt.toISOString(),
    };
  }

  async getPayrollSummary(
    startDate: string,
    endDate: string,
    employeeId?: string
  ) {
    const [entries, adjustments, compensations] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where: {
          employeeId,
          status: {
            in: [
              ...PAYABLE_TIME_ENTRY_STATUSES,
              TimeEntryStatus.CLOCKED_OUT,
              TimeEntryStatus.ADJUSTED,
            ] as any[],
          },
          clockInAt: this.dateRangeFilter(startDate, endDate),
        },
        include: this.timeEntryInclude(),
      }),
      this.prisma.payrollAdjustment.findMany({
        where: {
          employeeId,
          type: PayrollAdjustmentType.BONUS as any,
          effectiveDate: this.dateRangeFilter(startDate, endDate),
        },
      }),
      this.prisma.employeeCompensation.findMany({
        where: {
          employeeId,
          isActive: true,
        },
      }),
    ]);

    const byEmployee = new Map<string, any>();
    const getBucket = (employee: any) => {
      if (!byEmployee.has(employee.id)) {
        const compensation = compensations.find(
          (item) => item.employeeId === employee.id
        );
        byEmployee.set(employee.id, {
          employee: this.toEmployeeDto(employee),
          compensation: compensation
            ? this.toCompensationDto(compensation)
            : undefined,
          approvedHours: 0,
          pendingHours: 0,
          processedHours: 0,
          unpaidApprovedHours: 0,
          hourlyPay: 0,
          salaryPay: 0,
          bonusPay: 0,
          grossPay: 0,
        });
      }
      return byEmployee.get(employee.id);
    };

    for (const entry of entries) {
      const bucket = getBucket(entry.employee);
      const hours = this.calculateMinutes(entry).paidMinutes / 60;
      if (PAYABLE_TIME_ENTRY_STATUSES.includes(entry.status as any)) {
        bucket.approvedHours += hours;
        if (entry.payrollProcessedAt) {
          bucket.processedHours += hours;
        } else {
          bucket.unpaidApprovedHours += hours;
        }
      } else {
        bucket.pendingHours += hours;
      }
    }

    for (const adjustment of adjustments) {
      const user = await this.prisma.user.findUnique({
        where: { id: adjustment.employeeId },
        include: { role: true },
      });
      if (!user) continue;
      const bucket = getBucket(user);
      bucket.bonusPay += Number(adjustment.amount);
    }

    for (const bucket of byEmployee.values()) {
      if (bucket.compensation?.payType === PayType.HOURLY) {
        bucket.hourlyPay =
          bucket.unpaidApprovedHours *
          Number(bucket.compensation.hourlyRate || 0);
      } else if (bucket.compensation?.payType === PayType.SALARIED) {
        bucket.salaryPay = this.calculateSalaryForPeriod(
          Number(bucket.compensation.annualSalary || 0),
          startDate,
          endDate
        );
      }
      bucket.grossPay = bucket.hourlyPay + bucket.salaryPay + bucket.bonusPay;
      bucket.approvedHours = this.round2(bucket.approvedHours);
      bucket.pendingHours = this.round2(bucket.pendingHours);
      bucket.processedHours = this.round2(bucket.processedHours);
      bucket.unpaidApprovedHours = this.round2(bucket.unpaidApprovedHours);
      bucket.hourlyPay = this.round2(bucket.hourlyPay);
      bucket.bonusPay = this.round2(bucket.bonusPay);
      bucket.grossPay = this.round2(bucket.grossPay);
    }

    const employees = Array.from(byEmployee.values());
    const totals = employees.reduce(
      (acc, item) => ({
        approvedHours: this.round2(acc.approvedHours + item.approvedHours),
        pendingHours: this.round2(acc.pendingHours + item.pendingHours),
        processedHours: this.round2(acc.processedHours + item.processedHours),
        unpaidApprovedHours: this.round2(
          acc.unpaidApprovedHours + item.unpaidApprovedHours
        ),
        hourlyPay: this.round2(acc.hourlyPay + item.hourlyPay),
        salaryPay: this.round2(acc.salaryPay + item.salaryPay),
        bonusPay: this.round2(acc.bonusPay + item.bonusPay),
        grossPay: this.round2(acc.grossPay + item.grossPay),
      }),
      {
        approvedHours: 0,
        pendingHours: 0,
        processedHours: 0,
        unpaidApprovedHours: 0,
        hourlyPay: 0,
        salaryPay: 0,
        bonusPay: 0,
        grossPay: 0,
      }
    );

    return { startDate, endDate, employees, totals };
  }

  private async assertPayrollEmployee(employeeId: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
      include: { role: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!STAFF_PAYROLL_ROLES.includes(employee.role.name)) {
      throw new ForbiddenException(
        'Only staff, supervisors, and admins can use payroll time tracking'
      );
    }
  }

  private validateCompensation(dto: UpsertEmployeeCompensationDto) {
    if (
      dto.payType === PayType.HOURLY &&
      (!dto.hourlyRate || dto.hourlyRate <= 0)
    ) {
      throw new BadRequestException('Hourly employees require an hourly rate');
    }

    if (
      dto.payType === PayType.SALARIED &&
      (!dto.annualSalary || dto.annualSalary <= 0)
    ) {
      throw new BadRequestException(
        'Salaried employees require an annual salary'
      );
    }
  }

  private async requireCurrentEntry(employeeId: string) {
    const entry = await this.findCurrentEntry(employeeId);
    if (!entry) {
      throw new BadRequestException('Employee is not clocked in');
    }
    return entry;
  }

  private findCurrentEntry(employeeId: string) {
    return this.prisma.timeEntry.findFirst({
      where: {
        employeeId,
        status: { in: ACTIVE_TIME_ENTRY_STATUSES as any[] },
      },
      include: this.timeEntryInclude(),
      orderBy: { clockInAt: 'desc' },
    });
  }

  private timeEntryInclude() {
    return {
      employee: { include: { role: true } },
      breaks: { orderBy: { startAt: 'asc' as const } },
    };
  }

  private dateRangeFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return undefined;
    return {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    };
  }

  private toTimeEntryDto(entry: any) {
    const minutes = this.calculateMinutes(entry);
    return {
      id: entry.id,
      employeeId: entry.employeeId,
      clockInAt: entry.clockInAt.toISOString(),
      clockOutAt: entry.clockOutAt?.toISOString(),
      status: entry.status,
      source: entry.source,
      notes: entry.notes || undefined,
      adjustedBy: entry.adjustedBy || undefined,
      adjustmentReason: entry.adjustmentReason || undefined,
      approvedBy: entry.approvedBy || undefined,
      approvedAt: entry.approvedAt?.toISOString(),
      payrollProcessedBy: entry.payrollProcessedBy || undefined,
      payrollProcessedAt: entry.payrollProcessedAt?.toISOString(),
      grossMinutes: minutes.grossMinutes,
      unpaidBreakMinutes: minutes.unpaidBreakMinutes,
      paidMinutes: minutes.paidMinutes,
      employee: entry.employee ? this.toEmployeeDto(entry.employee) : undefined,
      breaks: (entry.breaks || []).map((breakEntry: any) =>
        this.toBreakDto(breakEntry)
      ),
    };
  }

  private toBreakDto(breakEntry: any) {
    return {
      id: breakEntry.id,
      timeEntryId: breakEntry.timeEntryId,
      breakType: breakEntry.breakType,
      startAt: breakEntry.startAt.toISOString(),
      endAt: breakEntry.endAt?.toISOString(),
      isPaid: breakEntry.isPaid,
      notes: breakEntry.notes || undefined,
      minutes: this.diffMinutes(
        breakEntry.startAt,
        breakEntry.endAt || new Date()
      ),
    };
  }

  private toAdjustmentDto(adjustment: any) {
    return {
      id: adjustment.id,
      employeeId: adjustment.employeeId,
      type: adjustment.type,
      amount: Number(adjustment.amount),
      reason: adjustment.reason,
      notes: adjustment.notes || undefined,
      effectiveDate: adjustment.effectiveDate.toISOString(),
      createdBy: adjustment.createdBy,
      approvedBy: adjustment.approvedBy || undefined,
      approvedAt: adjustment.approvedAt?.toISOString(),
      employee: adjustment.employee
        ? this.toEmployeeDto(adjustment.employee)
        : undefined,
    };
  }

  private toCompensationDto(compensation: any) {
    return {
      id: compensation.id,
      employeeId: compensation.employeeId,
      position: compensation.position || undefined,
      payType: compensation.payType,
      hourlyRate:
        compensation.hourlyRate === null
          ? undefined
          : Number(compensation.hourlyRate),
      annualSalary:
        compensation.annualSalary === null
          ? undefined
          : Number(compensation.annualSalary),
      expectedWeeklyHours:
        compensation.expectedWeeklyHours === null
          ? undefined
          : Number(compensation.expectedWeeklyHours),
      effectiveFrom: compensation.effectiveFrom.toISOString(),
      effectiveTo: compensation.effectiveTo?.toISOString(),
      isActive: compensation.isActive,
      createdBy: compensation.createdBy,
      createdAt: compensation.createdAt.toISOString(),
      updatedAt: compensation.updatedAt.toISOString(),
    };
  }

  private toEmployeeDto(employee: any) {
    return {
      id: employee.id,
      firstName: employee.firstName || undefined,
      lastName: employee.lastName || undefined,
      email: employee.email,
    };
  }

  private calculateMinutes(entry: any) {
    const end = entry.clockOutAt || new Date();
    const grossMinutes = this.diffMinutes(entry.clockInAt, end);
    const unpaidBreakMinutes = (entry.breaks || [])
      .filter((breakEntry: any) => !breakEntry.isPaid)
      .reduce(
        (sum: number, breakEntry: any) =>
          sum +
          this.diffMinutes(breakEntry.startAt, breakEntry.endAt || new Date()),
        0
      );
    return {
      grossMinutes,
      unpaidBreakMinutes,
      paidMinutes: Math.max(0, grossMinutes - unpaidBreakMinutes),
    };
  }

  private diffMinutes(start: Date, end: Date) {
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  }

  private round2(value: number) {
    return Math.round(value * 100) / 100;
  }

  private calculateSalaryForPeriod(
    annualSalary: number,
    startDate: string,
    endDate: string
  ) {
    if (!annualSalary) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
    );
    return this.round2((annualSalary / 365) * days);
  }
}
