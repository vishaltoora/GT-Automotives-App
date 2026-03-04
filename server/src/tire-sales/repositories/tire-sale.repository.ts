import { Injectable } from '@nestjs/common';
import { Prisma, TireSale, CommissionStatus } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';

export interface TireSaleWithRelations extends TireSale {
  soldBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    businessName: string | null;
    phone: string | null;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
  } | null;
  items: Array<{
    id: string;
    tireId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    total: Prisma.Decimal;
    tireBrand: string;
    tireSize: string;
    tireType: string;
    tireCondition: string;
  }>;
}

export interface TireSaleFilters {
  soldById?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  commissionStatus?: CommissionStatus;
}

@Injectable()
export class TireSaleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    soldBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    customer: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
      },
    },
    invoice: {
      select: {
        id: true,
        invoiceNumber: true,
      },
    },
    items: true,
  };

  /**
   * Generate next sale number in format TS-YYYYMM-####
   */
  async generateSaleNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `TS-${yearMonth}-`;

    // Find the last sale number for this month
    const lastSale = await this.prisma.tireSale.findFirst({
      where: {
        saleNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        saleNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastSale) {
      const lastNumberStr = lastSale.saleNumber.split('-')[2];
      nextNumber = parseInt(lastNumberStr, 10) + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Create a tire sale with items in a transaction
   * Also handles inventory deduction
   */
  async createWithItems(
    saleData: {
      saleNumber: string;
      soldById: string;
      customerId?: string;
      invoiceId?: string;
      paymentMethod: string;
      subtotal: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      total: Prisma.Decimal;
      commissionRate?: Prisma.Decimal;
      commissionAmount?: Prisma.Decimal;
      notes?: string;
    },
    items: Array<{
      tireId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      total: Prisma.Decimal;
      tireBrand: string;
      tireSize: string;
      tireType: string;
      tireCondition: string;
    }>
  ): Promise<TireSaleWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      // Deduct inventory for each item
      for (const item of items) {
        await tx.tire.update({
          where: { id: item.tireId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create the tire sale with items
      const tireSale = await tx.tireSale.create({
        data: {
          saleNumber: saleData.saleNumber,
          soldById: saleData.soldById,
          customerId: saleData.customerId,
          invoiceId: saleData.invoiceId,
          paymentMethod: saleData.paymentMethod as any,
          subtotal: saleData.subtotal,
          taxAmount: saleData.taxAmount,
          total: saleData.total,
          commissionRate: saleData.commissionRate,
          commissionAmount: saleData.commissionAmount,
          notes: saleData.notes,
          items: {
            create: items.map((item) => ({
              tireId: item.tireId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              tireBrand: item.tireBrand,
              tireSize: item.tireSize,
              tireType: item.tireType as any,
              tireCondition: item.tireCondition as any,
            })),
          },
        },
        include: this.includeRelations,
      });

      return tireSale as TireSaleWithRelations;
    });
  }

  /**
   * Find tire sale by ID with all relations
   */
  async findById(id: string): Promise<TireSaleWithRelations | null> {
    const sale = await this.prisma.tireSale.findUnique({
      where: { id },
      include: this.includeRelations,
    });

    return sale as TireSaleWithRelations | null;
  }

  /**
   * Find all tire sales with optional filters
   */
  async findAll(
    filters: TireSaleFilters,
    page = 1,
    limit = 20
  ): Promise<{ items: TireSaleWithRelations[]; total: number }> {
    const where: Prisma.TireSaleWhereInput = {};

    if (filters.soldById) {
      where.soldById = filters.soldById;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod as any;
    }

    if (filters.commissionStatus) {
      where.commissionStatus = filters.commissionStatus;
    }

    if (filters.startDate || filters.endDate) {
      where.saleDate = {};
      if (filters.startDate) {
        where.saleDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.saleDate.lte = filters.endDate;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.tireSale.findMany({
        where,
        include: this.includeRelations,
        orderBy: { saleDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tireSale.count({ where }),
    ]);

    return {
      items: items as TireSaleWithRelations[],
      total,
    };
  }

  /**
   * Get monthly tire count for an employee (for commission calculation)
   */
  async getMonthlyTireCount(employeeId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.prisma.tireSaleItem.aggregate({
      where: {
        tireSale: {
          soldById: employeeId,
          saleDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity || 0;
  }

  /**
   * Update commission for a tire sale
   */
  async updateCommission(
    id: string,
    data: {
      commissionRate?: Prisma.Decimal;
      commissionAmount?: Prisma.Decimal;
      commissionStatus?: CommissionStatus;
      commissionPaidAt?: Date;
      commissionJobId?: string;
    }
  ): Promise<TireSaleWithRelations> {
    const updated = await this.prisma.tireSale.update({
      where: { id },
      data,
      include: this.includeRelations,
    });

    return updated as TireSaleWithRelations;
  }

  /**
   * Get all pending commissions for an employee in a month
   * (for retroactive recalculation when threshold is crossed)
   */
  async getPendingCommissionsForMonth(
    employeeId: string,
    year: number,
    month: number
  ): Promise<TireSaleWithRelations[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sales = await this.prisma.tireSale.findMany({
      where: {
        soldById: employeeId,
        saleDate: {
          gte: startDate,
          lte: endDate,
        },
        commissionStatus: 'PENDING',
      },
      include: this.includeRelations,
    });

    return sales as TireSaleWithRelations[];
  }

  /**
   * Batch update commission rates for multiple sales
   */
  async batchUpdateCommissionRate(
    saleIds: string[],
    newRate: Prisma.Decimal
  ): Promise<number> {
    // Get all sales to recalculate amounts
    const sales = await this.prisma.tireSale.findMany({
      where: { id: { in: saleIds } },
      include: { items: true },
    });

    // Update each sale with new rate and recalculated amount
    let updated = 0;
    for (const sale of sales) {
      const totalTires = sale.items.reduce((sum, item) => sum + item.quantity, 0);
      const newAmount = new Prisma.Decimal(totalTires).mul(newRate);

      await this.prisma.tireSale.update({
        where: { id: sale.id },
        data: {
          commissionRate: newRate,
          commissionAmount: newAmount,
        },
      });
      updated++;
    }

    return updated;
  }

  /**
   * Batch update commission status for multiple sales (for processing all at once)
   */
  async batchUpdateCommissionStatus(
    saleIds: string[],
    status: CommissionStatus,
    paidAt: Date,
    jobId: string
  ): Promise<number> {
    const result = await this.prisma.tireSale.updateMany({
      where: { id: { in: saleIds } },
      data: {
        commissionStatus: status,
        commissionPaidAt: paidAt,
        commissionJobId: jobId,
      },
    });

    return result.count;
  }

  /**
   * Get commission report data
   */
  async getCommissionReport(
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<
    Array<{
      employeeId: string;
      employeeName: string;
      totalTiresSold: number;
      totalSalesAmount: number;
      pendingCommission: number;
      paidCommission: number;
    }>
  > {
    const where: Prisma.TireSaleWhereInput = {
      saleDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (employeeId) {
      where.soldById = employeeId;
    }

    const sales = await this.prisma.tireSale.findMany({
      where,
      include: {
        soldBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
      },
    });

    // Group by employee
    const employeeMap = new Map<
      string,
      {
        employeeId: string;
        employeeName: string;
        totalTiresSold: number;
        totalSalesAmount: number;
        pendingCommission: number;
        paidCommission: number;
      }
    >();

    for (const sale of sales) {
      const empId = sale.soldById;
      const empName = `${sale.soldBy.firstName || ''} ${sale.soldBy.lastName || ''}`.trim() || 'Unknown';

      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeId: empId,
          employeeName: empName,
          totalTiresSold: 0,
          totalSalesAmount: 0,
          pendingCommission: 0,
          paidCommission: 0,
        });
      }

      const emp = employeeMap.get(empId)!;
      const tireCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
      emp.totalTiresSold += tireCount;
      emp.totalSalesAmount += Number(sale.subtotal);

      const commission = Number(sale.commissionAmount || 0);
      if (sale.commissionStatus === 'PAID') {
        emp.paidCommission += commission;
      } else if (sale.commissionStatus === 'PENDING' || sale.commissionStatus === 'APPROVED') {
        emp.pendingCommission += commission;
      }
    }

    return Array.from(employeeMap.values());
  }
}
