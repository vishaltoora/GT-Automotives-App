import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { CreatePayStubDto, PayStubDto, PayType } from '@gt-automotive/data';
import { PdfService } from '../pdf/pdf.service';
import { AuditRepository } from '../audit/repositories/audit.repository';
import {
  extractBusinessDate,
  toBusinessCalendarDate,
} from '../config/timezone.config';

/** Roles allowed to raise and read every employee's pay stubs. */
const PAYROLL_ADMIN_ROLES = ['ADMIN', 'ACCOUNTANT'];

const round2 = (value: number) => Math.round(value * 100) / 100;
const num = (value: unknown) => Number(value ?? 0);

@Injectable()
export class PayStubsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly auditRepository: AuditRepository
  ) {}

  /**
   * Raise a pay stub for an employee.
   *
   * Everything the printed document shows is resolved and stored here — the
   * company header, the employee's name, position and rate, the period figures
   * and the year-to-date columns. Nothing is joined live at render time, so a
   * later change to a compensation record, a time entry or the company name
   * cannot alter a stub that has already been issued.
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
    const grossPay = regularAmount;
    const eiAmount = round2(dto.eiAmount ?? 0);
    const cppAmount = round2(dto.cppAmount ?? 0);
    const incomeTaxAmount = round2(dto.incomeTaxAmount ?? 0);
    const otherDeductions = round2(dto.otherDeductions ?? 0);
    const totalWithholding = round2(
      eiAmount + cppAmount + incomeTaxAmount + otherDeductions
    );
    const netPay = round2(grossPay - totalWithholding);

    if (netPay < 0) {
      throw new BadRequestException(
        'Withholdings exceed gross pay — net pay would be negative'
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
        employeeName:
          [employee.firstName, employee.lastName].filter(Boolean).join(' ') ||
          employee.email,
        position: dto.position,
        payRate: dto.payRate ?? null,
        payType: compensation?.payType ?? PayType.HOURLY,
        regularHours,
        regularAmount,
        grossPay,
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

    return this.toDto(payStub);
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
  private async sumPriorStubsInYear(employeeId: string, payDate: Date) {
    const year = payDate.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

    const priorStubs = await this.prisma.payStub.findMany({
      where: {
        employeeId,
        payDate: { gte: yearStart, lt: yearEnd },
      },
    });

    return priorStubs.reduce(
      (acc, stub) => ({
        hours: acc.hours + num(stub.regularHours),
        regularAmount: acc.regularAmount + num(stub.regularAmount),
        grossPay: acc.grossPay + num(stub.grossPay),
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
      employeeName: stub.employeeName,
      position: stub.position || undefined,
      payRate: stub.payRate == null ? undefined : num(stub.payRate),
      payType: stub.payType,
      regularHours: num(stub.regularHours),
      regularAmount: num(stub.regularAmount),
      grossPay: num(stub.grossPay),
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
