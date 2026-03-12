import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, PaymentMethod, CommissionStatus, JobType, JobStatus } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';
import { TireSaleRepository, TireSaleWithRelations } from './repositories/tire-sale.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { InvoicesService } from '../invoices/invoices.service';
import { JobsService } from '../jobs/jobs.service';
import {
  CreateTireSaleDto,
  TireSaleResponseDto,
  TireSaleFiltersDto,
  CommissionReportDto,
  CommissionFiltersDto,
} from '../common/dto/tire-sale.dto';
import { InvoiceItemType } from '../common/dto/invoice.dto';

// Commission tiers (per tire, based on monthly volume)
const COMMISSION_TIERS = [
  { minTires: 0, maxTires: 30, rate: 3 },   // $3/tire for first 30
  { minTires: 31, maxTires: 50, rate: 4 },  // $4/tire for 31-50
  { minTires: 51, maxTires: 70, rate: 5 },  // $5/tire for 51-70
  { minTires: 71, maxTires: Infinity, rate: 7 }, // $7/tire for 71+
];

@Injectable()
export class TireSalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tireSaleRepository: TireSaleRepository,
    private readonly auditRepository: AuditRepository,
    private readonly invoicesService: InvoicesService,
    private readonly jobsService: JobsService,
  ) {}

  /**
   * Get commission rate based on monthly tire count
   */
  private getCommissionRate(monthlyTireCount: number): number {
    for (const tier of COMMISSION_TIERS) {
      if (monthlyTireCount >= tier.minTires && monthlyTireCount <= tier.maxTires) {
        return tier.rate;
      }
    }
    return COMMISSION_TIERS[COMMISSION_TIERS.length - 1].rate;
  }

  /**
   * Check if a threshold was crossed (for retroactive recalculation)
   */
  private checkThresholdCrossed(beforeCount: number, afterCount: number): number | null {
    const thresholds = [40, 60, 80];
    for (const threshold of thresholds) {
      if (beforeCount < threshold && afterCount >= threshold) {
        return threshold;
      }
    }
    return null;
  }

  /**
   * Create a new tire sale
   */
  async create(dto: CreateTireSaleDto, userId: string): Promise<TireSaleResponseDto> {
    // Use provided soldById or default to current user
    const salespersonId = dto.soldById || userId;
    const isCashSale = dto.paymentMethod === PaymentMethod.CASH;

    // For non-cash sales, customer is required
    if (!isCashSale && !dto.customerId && !dto.customerData) {
      throw new BadRequestException('Customer is required for non-cash sales');
    }

    // Validate all tires exist and have sufficient stock
    const tireIds = dto.items.map((item) => item.tireId);
    const tires = await this.prisma.tire.findMany({
      where: { id: { in: tireIds } },
      include: { brand: true, size: true },
    });

    if (tires.length !== tireIds.length) {
      throw new BadRequestException('One or more tires not found');
    }

    // Check stock levels
    for (const item of dto.items) {
      const tire = tires.find((t) => t.id === item.tireId);
      if (!tire) {
        throw new BadRequestException(`Tire ${item.tireId} not found`);
      }
      if (tire.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${tire.brand.name} ${tire.size.size}. Available: ${tire.quantity}, Requested: ${item.quantity}`
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const itemsWithDetails = dto.items.map((item) => {
      const tire = tires.find((t) => t.id === item.tireId)!;
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        tireId: item.tireId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        total: new Prisma.Decimal(total),
        tireBrand: tire.brand.name,
        tireSize: tire.size.size,
        tireType: tire.type,
        tireCondition: tire.condition,
      };
    });

    // Calculate tax (0 for cash sales)
    const taxAmount = isCashSale ? 0 : subtotal * 0.12; // 12% (5% GST + 7% PST)
    const total = subtotal + taxAmount;

    // Calculate total tires in this sale
    const totalTiresInSale = dto.items.reduce((sum, item) => sum + item.quantity, 0);

    // Get current monthly tire count for commission calculation (based on salesperson)
    const now = new Date();
    const monthlyTireCount = await this.tireSaleRepository.getMonthlyTireCount(
      salespersonId,
      now.getFullYear(),
      now.getMonth() + 1
    );

    // Calculate commission
    const newMonthlyTotal = monthlyTireCount + totalTiresInSale;
    const commissionRate = this.getCommissionRate(newMonthlyTotal);
    const commissionAmount = totalTiresInSale * commissionRate;

    // Generate sale number
    const saleNumber = await this.tireSaleRepository.generateSaleNumber();

    let customerId = dto.customerId;
    let invoiceId: string | undefined;

    // For non-cash sales, create customer if needed and create invoice
    if (!isCashSale) {
      // Create customer if customerData provided
      if (dto.customerData && !dto.customerId) {
        const newCustomer = await this.prisma.customer.create({
          data: {
            firstName: dto.customerData.firstName,
            lastName: dto.customerData.lastName,
            phone: dto.customerData.phone || null,
            email: dto.customerData.email || '',
            businessName: dto.customerData.businessName || null,
            address: dto.customerData.address || 'Prince George, BC',
          },
        });
        customerId = newCustomer.id;
      }

      // Get default company
      const company = await this.prisma.company.findFirst({
        where: { isDefault: true },
      });

      if (!company) {
        throw new BadRequestException('No default company found');
      }

      // Create invoice for non-cash sales
      const invoiceItems = dto.items.map((item) => {
        const tire = tires.find((t) => t.id === item.tireId)!;
        return {
          tireId: item.tireId,
          tireName: `${tire.brand.name} ${tire.size.size}`,
          itemType: InvoiceItemType.TIRE,
          description: `${tire.brand.name} ${tire.type} - ${tire.size.size}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      });

      const invoice = await this.invoicesService.create(
        {
          customerId: customerId!,
          companyId: company.id,
          items: invoiceItems,
          subtotal,
          taxRate: 0.12,
          taxAmount,
          gstRate: 0.05,
          gstAmount: subtotal * 0.05,
          pstRate: 0.07,
          pstAmount: subtotal * 0.07,
          total,
          status: 'PAID' as any,
          paymentMethod: dto.paymentMethod,
        },
        userId
      );

      invoiceId = invoice.id;
    }

    // Create the tire sale (repository handles inventory deduction in transaction)
    const tireSale = await this.tireSaleRepository.createWithItems(
      {
        saleNumber,
        soldById: salespersonId,
        customerId: customerId || undefined,
        invoiceId,
        paymentMethod: dto.paymentMethod,
        subtotal: new Prisma.Decimal(subtotal),
        taxAmount: new Prisma.Decimal(taxAmount),
        total: new Prisma.Decimal(total),
        commissionRate: new Prisma.Decimal(commissionRate),
        commissionAmount: new Prisma.Decimal(commissionAmount),
        notes: dto.notes,
      },
      itemsWithDetails
    );

    // Check if threshold was crossed and recalculate pending commissions
    const thresholdCrossed = this.checkThresholdCrossed(monthlyTireCount, newMonthlyTotal);
    if (thresholdCrossed) {
      await this.recalculatePendingCommissions(salespersonId, now.getFullYear(), now.getMonth() + 1);
    }

    // Note: Jobs for commissions are created when admin processes commissions at end of month
    // via the processEmployeeCommissions endpoint, not automatically on each sale

    // Log audit
    await this.auditRepository.create({
      userId,
      action: 'CREATE',
      resource: 'TireSale',
      resourceId: tireSale.id,
      newValue: {
        saleNumber,
        totalTires: totalTiresInSale,
        total,
        paymentMethod: dto.paymentMethod,
        commissionRate,
        commissionAmount,
      },
    });

    return this.toResponseDto(tireSale);
  }

  /**
   * Recalculate all pending commissions for an employee in a month
   * Called when a threshold is crossed
   */
  private async recalculatePendingCommissions(
    employeeId: string,
    year: number,
    month: number
  ): Promise<void> {
    // Get all pending commissions for this month
    const pendingSales = await this.tireSaleRepository.getPendingCommissionsForMonth(
      employeeId,
      year,
      month
    );

    // Get total tire count for the month
    const monthlyTotal = await this.tireSaleRepository.getMonthlyTireCount(employeeId, year, month);

    // Determine the new rate
    const newRate = this.getCommissionRate(monthlyTotal);

    // Update all pending sales with new rate
    const saleIds = pendingSales.map((s) => s.id);
    if (saleIds.length > 0) {
      await this.tireSaleRepository.batchUpdateCommissionRate(saleIds, new Prisma.Decimal(newRate));
    }
  }

  /**
   * Get all tire sales with filters
   */
  async findAll(filters: TireSaleFiltersDto): Promise<{
    items: TireSaleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const repoFilters: any = {};

    if (filters.soldById) {
      repoFilters.soldById = filters.soldById;
    }
    if (filters.paymentMethod) {
      repoFilters.paymentMethod = filters.paymentMethod;
    }
    if (filters.commissionStatus) {
      repoFilters.commissionStatus = filters.commissionStatus;
    }
    if (filters.startDate) {
      repoFilters.startDate = new Date(filters.startDate);
    }
    if (filters.endDate) {
      repoFilters.endDate = new Date(filters.endDate);
    }

    const { items, total } = await this.tireSaleRepository.findAll(repoFilters, page, limit);

    return {
      items: items.map((item) => this.toResponseDto(item)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get tire sales for current user (staff view)
   */
  async findMySales(userId: string, filters: TireSaleFiltersDto): Promise<{
    items: TireSaleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.findAll({ ...filters, soldById: userId });
  }

  /**
   * Get single tire sale by ID
   */
  async findOne(id: string): Promise<TireSaleResponseDto> {
    const sale = await this.tireSaleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException('Tire sale not found');
    }
    return this.toResponseDto(sale);
  }

  /**
   * Get commission report
   */
  async getCommissionReport(filters: CommissionFiltersDto): Promise<CommissionReportDto> {
    const now = new Date();
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = filters.endDate
      ? new Date(filters.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const data = await this.tireSaleRepository.getCommissionReport(
      startDate,
      endDate,
      filters.employeeId
    );

    // Calculate current commission rate for each employee
    const employees = data.map((emp) => {
      const rate = this.getCommissionRate(emp.totalTiresSold);
      return {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        totalTiresSold: emp.totalTiresSold,
        totalSalesAmount: emp.totalSalesAmount,
        commissionRate: rate,
        totalCommission: emp.pendingCommission + emp.paidCommission,
        pendingCommission: emp.pendingCommission,
        paidCommission: emp.paidCommission,
      };
    });

    const totals = {
      totalTiresSold: employees.reduce((sum, e) => sum + e.totalTiresSold, 0),
      totalSalesAmount: employees.reduce((sum, e) => sum + e.totalSalesAmount, 0),
      totalCommission: employees.reduce((sum, e) => sum + e.totalCommission, 0),
      pendingCommission: employees.reduce((sum, e) => sum + e.pendingCommission, 0),
      paidCommission: employees.reduce((sum, e) => sum + e.paidCommission, 0),
    };

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      employees,
      totals,
    };
  }

  /**
   * Approve commission for payment
   */
  async approveCommission(id: string, adminUserId: string): Promise<TireSaleResponseDto> {
    const sale = await this.tireSaleRepository.findById(id);
    if (!sale) {
      throw new NotFoundException('Tire sale not found');
    }

    if (sale.commissionStatus !== 'PENDING') {
      throw new BadRequestException('Commission is not in pending status');
    }

    const updated = await this.tireSaleRepository.updateCommission(id, {
      commissionStatus: CommissionStatus.APPROVED,
    });

    await this.auditRepository.create({
      userId: adminUserId,
      action: 'APPROVE_COMMISSION',
      resource: 'TireSale',
      resourceId: id,
      oldValue: { commissionStatus: 'PENDING' },
      newValue: { commissionStatus: 'APPROVED' },
    });

    return this.toResponseDto(updated);
  }

  /**
   * Process all pending commissions for an employee (creates ONE job for total amount)
   */
  async processEmployeeCommissions(
    employeeId: string,
    adminUserId: string,
    year?: number,
    month?: number
  ): Promise<{ jobId: string; totalAmount: number; salesCount: number }> {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    // Get all pending commission sales for this employee in the specified month
    const pendingSales = await this.tireSaleRepository.getPendingCommissionsForMonth(
      employeeId,
      y,
      m
    );

    if (pendingSales.length === 0) {
      throw new BadRequestException('No pending commissions found for this employee');
    }

    // Calculate total commission amount
    const totalCommissionAmount = pendingSales.reduce(
      (sum, sale) => sum + Number(sale.commissionAmount || 0),
      0
    );

    if (totalCommissionAmount <= 0) {
      throw new BadRequestException('No commission amount to pay');
    }

    // Get employee details for job description
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true },
    });

    const employeeName = employee
      ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
      : 'Employee';

    // Calculate total tires sold
    const totalTiresSold = pendingSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Create ONE job for all commissions
    const monthName = new Date(y, m - 1).toLocaleString('default', { month: 'long' });
    const job = await this.jobsService.create(
      {
        employeeId,
        title: `Tire Sales Commission - ${monthName} ${y}`,
        description: `Commission for ${totalTiresSold} tire(s) sold across ${pendingSales.length} sale(s) in ${monthName} ${y}. Rate: $${this.getCommissionRate(totalTiresSold)}/tire.`,
        payAmount: totalCommissionAmount,
        jobType: JobType.COMMISSION,
        status: JobStatus.READY,
      },
      adminUserId
    );

    // Update all tire sales to PAID status
    const saleIds = pendingSales.map((s) => s.id);
    await this.tireSaleRepository.batchUpdateCommissionStatus(
      saleIds,
      CommissionStatus.PAID,
      new Date(),
      job.id
    );

    // Log audit
    await this.auditRepository.create({
      userId: adminUserId,
      action: 'PROCESS_COMMISSIONS',
      resource: 'TireSale',
      resourceId: job.id,
      newValue: {
        employeeId,
        employeeName,
        month: `${y}-${String(m).padStart(2, '0')}`,
        salesCount: pendingSales.length,
        totalTiresSold,
        totalCommissionAmount,
        jobId: job.id,
      },
    });

    return {
      jobId: job.id,
      totalAmount: totalCommissionAmount,
      salesCount: pendingSales.length,
    };
  }

  /**
   * Get monthly stats for an employee
   */
  async getMonthlyStats(employeeId: string, year?: number, month?: number): Promise<{
    totalTiresSold: number;
    currentRate: number;
    nextThreshold: number | null;
    tiresToNextThreshold: number | null;
  }> {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    const totalTiresSold = await this.tireSaleRepository.getMonthlyTireCount(employeeId, y, m);
    const currentRate = this.getCommissionRate(totalTiresSold);

    // Determine next threshold
    let nextThreshold: number | null = null;
    let tiresToNextThreshold: number | null = null;

    if (totalTiresSold < 40) {
      nextThreshold = 40;
      tiresToNextThreshold = 40 - totalTiresSold;
    } else if (totalTiresSold < 60) {
      nextThreshold = 60;
      tiresToNextThreshold = 60 - totalTiresSold;
    } else if (totalTiresSold < 80) {
      nextThreshold = 80;
      tiresToNextThreshold = 80 - totalTiresSold;
    }

    return {
      totalTiresSold,
      currentRate,
      nextThreshold,
      tiresToNextThreshold,
    };
  }

  /**
   * Convert repository entity to response DTO
   */
  private toResponseDto(sale: TireSaleWithRelations): TireSaleResponseDto {
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      soldBy: {
        id: sale.soldBy.id,
        firstName: sale.soldBy.firstName,
        lastName: sale.soldBy.lastName,
        email: sale.soldBy.email,
      },
      customer: sale.customer
        ? {
            id: sale.customer.id,
            firstName: sale.customer.firstName,
            lastName: sale.customer.lastName,
            businessName: sale.customer.businessName,
            phone: sale.customer.phone,
          }
        : null,
      invoice: sale.invoice
        ? {
            id: sale.invoice.id,
            invoiceNumber: sale.invoice.invoiceNumber,
          }
        : null,
      paymentMethod: sale.paymentMethod,
      items: sale.items.map((item) => ({
        id: item.id,
        tireId: item.tireId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        tireBrand: item.tireBrand,
        tireSize: item.tireSize,
        tireType: item.tireType as any,
        tireCondition: item.tireCondition as any,
      })),
      subtotal: Number(sale.subtotal),
      taxAmount: Number(sale.taxAmount),
      total: Number(sale.total),
      commissionRate: sale.commissionRate ? Number(sale.commissionRate) : null,
      commissionAmount: sale.commissionAmount ? Number(sale.commissionAmount) : null,
      commissionStatus: sale.commissionStatus,
      commissionPaidAt: sale.commissionPaidAt,
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
    };
  }
}
