import { Injectable } from '@nestjs/common';
import { PrismaClient, RecurringPeriod } from '@prisma/client';
import {
  ExpenseReportFilterDto,
  ExpenseReportResponseDto,
  CategorySummaryDto,
  VendorSummaryDto,
  MonthlyTrendDto,
  RecurringExpenseSummaryDto,
} from '../common/dto/expense-report.dto';

@Injectable()
export class ReportsService {
  private prisma = new PrismaClient();

  async getExpenseReport(filterDto: ExpenseReportFilterDto): Promise<ExpenseReportResponseDto> {
    const startDate = filterDto.startDate ? new Date(filterDto.startDate) : undefined;
    const endDate = filterDto.endDate ? new Date(filterDto.endDate) : undefined;

    // Build filter conditions
    const purchaseWhere: any = {};
    const expenseWhere: any = {};

    if (startDate) {
      purchaseWhere.invoiceDate = { ...purchaseWhere.invoiceDate, gte: startDate };
      expenseWhere.invoiceDate = { ...expenseWhere.invoiceDate, gte: startDate };
    }
    if (endDate) {
      purchaseWhere.invoiceDate = { ...purchaseWhere.invoiceDate, lte: endDate };
      expenseWhere.invoiceDate = { ...expenseWhere.invoiceDate, lte: endDate };
    }
    if (filterDto.vendorId) {
      purchaseWhere.vendorId = filterDto.vendorId;
      expenseWhere.vendorId = filterDto.vendorId;
    }
    if (filterDto.status) {
      purchaseWhere.status = filterDto.status;
      expenseWhere.status = filterDto.status;
    }

    // Fetch all data in parallel
    const [
      purchaseInvoices,
      expenseInvoices,
      purchasesByCategory,
      expensesByCategory,
      recurringExpenses,
    ] = await Promise.all([
      this.prisma.purchaseInvoice.findMany({ where: purchaseWhere }),
      this.prisma.expenseInvoice.findMany({ where: expenseWhere }),
      this.getPurchasesByCategory(purchaseWhere),
      this.getExpensesByCategory(expenseWhere),
      this.getRecurringExpenses(expenseWhere),
    ]);

    // Calculate summary statistics
    const totalPurchaseAmount = purchaseInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalExpenseAmount = expenseInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const paidPurchases = purchaseInvoices.filter(inv => inv.status === 'PAID');
    const paidExpenses = expenseInvoices.filter(inv => inv.status === 'PAID');
    const paidTotal =
      paidPurchases.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) +
      paidExpenses.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const pendingPurchases = purchaseInvoices.filter(inv => inv.status === 'PENDING');
    const pendingExpenses = expenseInvoices.filter(inv => inv.status === 'PENDING');
    const pendingTotal =
      pendingPurchases.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) +
      pendingExpenses.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const overduePurchases = purchaseInvoices.filter(inv => inv.status === 'OVERDUE');
    const overdueExpenses = expenseInvoices.filter(inv => inv.status === 'OVERDUE');
    const overdueTotal =
      overduePurchases.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) +
      overdueExpenses.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // Get vendor analysis
    const topVendorsBySpending = await this.getTopVendorsBySpending(purchaseWhere, expenseWhere);

    // Get monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(purchaseInvoices, expenseInvoices);

    return {
      totalPurchases: purchaseInvoices.length,
      totalPurchaseAmount,
      totalExpenses: expenseInvoices.length,
      totalExpenseAmount,
      combinedTotal: totalPurchaseAmount + totalExpenseAmount,
      paidTotal,
      pendingTotal,
      overdueTotal,
      purchasesByCategory,
      expensesByCategory,
      topVendorsBySpending,
      monthlyTrends,
      recurringExpenses,
    };
  }

  private async getPurchasesByCategory(where: any): Promise<CategorySummaryDto[]> {
    const groupedData = await this.prisma.purchaseInvoice.groupBy({
      by: ['category'],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const result: CategorySummaryDto[] = [];

    for (const group of groupedData) {
      const categoryInvoices = await this.prisma.purchaseInvoice.findMany({
        where: { ...where, category: group.category },
      });

      const paidAmount = categoryInvoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      const pendingAmount = categoryInvoices
        .filter(inv => inv.status === 'PENDING')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      const overdueAmount = categoryInvoices
        .filter(inv => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      result.push({
        category: group.category,
        count: group._count.id,
        totalAmount: Number(group._sum.totalAmount || 0),
        paidAmount,
        pendingAmount,
        overdueAmount,
      });
    }

    return result;
  }

  private async getExpensesByCategory(where: any): Promise<CategorySummaryDto[]> {
    const groupedData = await this.prisma.expenseInvoice.groupBy({
      by: ['category'],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const result: CategorySummaryDto[] = [];

    for (const group of groupedData) {
      const categoryInvoices = await this.prisma.expenseInvoice.findMany({
        where: { ...where, category: group.category },
      });

      const paidAmount = categoryInvoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      const pendingAmount = categoryInvoices
        .filter(inv => inv.status === 'PENDING')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      const overdueAmount = categoryInvoices
        .filter(inv => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

      result.push({
        category: group.category,
        count: group._count.id,
        totalAmount: Number(group._sum.totalAmount || 0),
        paidAmount,
        pendingAmount,
        overdueAmount,
      });
    }

    return result;
  }

  private async getTopVendorsBySpending(
    purchaseWhere: any,
    expenseWhere: any,
  ): Promise<VendorSummaryDto[]> {
    const vendorMap = new Map<string, VendorSummaryDto>();

    // Aggregate purchases by vendor
    const purchases = await this.prisma.purchaseInvoice.findMany({
      where: purchaseWhere,
    });

    for (const purchase of purchases) {
      const key = purchase.vendorId || purchase.vendorName;
      const existing = vendorMap.get(key) || {
        vendorId: purchase.vendorId,
        vendorName: purchase.vendorName,
        count: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };

      existing.count++;
      existing.totalAmount += Number(purchase.totalAmount);
      if (purchase.status === 'PAID') {
        existing.paidAmount += Number(purchase.totalAmount);
      } else if (purchase.status === 'PENDING') {
        existing.pendingAmount += Number(purchase.totalAmount);
      }

      vendorMap.set(key, existing as VendorSummaryDto);
    }

    // Aggregate expenses by vendor
    const expenses = await this.prisma.expenseInvoice.findMany({
      where: expenseWhere,
    });

    for (const expense of expenses) {
      const key = expense.vendorId || expense.vendorName;
      const existing = vendorMap.get(key) || {
        vendorId: expense.vendorId,
        vendorName: expense.vendorName,
        count: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
      };

      existing.count++;
      existing.totalAmount += Number(expense.totalAmount);
      if (expense.status === 'PAID') {
        existing.paidAmount += Number(expense.totalAmount);
      } else if (expense.status === 'PENDING') {
        existing.pendingAmount += Number(expense.totalAmount);
      }

      vendorMap.set(key, existing as VendorSummaryDto);
    }

    // Sort by total spending and return top 10
    return Array.from(vendorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  private calculateMonthlyTrends(
    purchaseInvoices: any[],
    expenseInvoices: any[],
  ): MonthlyTrendDto[] {
    const monthMap = new Map<string, MonthlyTrendDto>();

    // Aggregate purchases
    for (const purchase of purchaseInvoices) {
      const month = purchase.invoiceDate.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthMap.get(month) || {
        month,
        purchaseCount: 0,
        purchaseTotal: 0,
        expenseCount: 0,
        expenseTotal: 0,
        combinedTotal: 0,
      };

      existing.purchaseCount++;
      existing.purchaseTotal += Number(purchase.totalAmount);
      existing.combinedTotal = existing.purchaseTotal + existing.expenseTotal;

      monthMap.set(month, existing);
    }

    // Aggregate expenses
    for (const expense of expenseInvoices) {
      const month = expense.invoiceDate.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthMap.get(month) || {
        month,
        purchaseCount: 0,
        purchaseTotal: 0,
        expenseCount: 0,
        expenseTotal: 0,
        combinedTotal: 0,
      };

      existing.expenseCount++;
      existing.expenseTotal += Number(expense.totalAmount);
      existing.combinedTotal = existing.purchaseTotal + existing.expenseTotal;

      monthMap.set(month, existing);
    }

    // Sort by month (most recent first)
    return Array.from(monthMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  }

  private async getRecurringExpenses(where: any): Promise<RecurringExpenseSummaryDto[]> {
    const recurring = await this.prisma.expenseInvoice.findMany({
      where: {
        ...where,
        isRecurring: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });

    return recurring.map(expense => ({
      id: expense.id,
      vendorName: expense.vendorName,
      description: expense.description,
      category: expense.category,
      amount: Number(expense.totalAmount),
      recurringPeriod: (expense.recurringPeriod as RecurringPeriod) || 'MONTHLY',
      lastPaymentDate: expense.paymentDate,
      nextDueDate: this.calculateNextDueDate(expense.invoiceDate, expense.recurringPeriod || undefined),
      status: expense.status,
    })) as RecurringExpenseSummaryDto[];
  }

  private calculateNextDueDate(lastDate: Date, period?: string): Date {
    const next = new Date(lastDate);

    switch (period) {
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1); // Default to monthly
    }

    return next;
  }

  async getAnalytics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // MTD (Month-to-Date) calculations
    const [mtdPurchases, mtdExpenses, mtdSalesInvoices] = await Promise.all([
      this.prisma.purchaseInvoice.aggregate({
        where: {
          invoiceDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.expenseInvoice.aggregate({
        where: {
          invoiceDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          invoiceDate: { gte: startOfMonth },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    // YTD (Year-to-Date) calculations
    const [ytdPurchases, ytdExpenses, ytdSalesInvoices] = await Promise.all([
      this.prisma.purchaseInvoice.aggregate({
        where: {
          invoiceDate: { gte: startOfYear },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.expenseInvoice.aggregate({
        where: {
          invoiceDate: { gte: startOfYear },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          invoiceDate: { gte: startOfYear },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return {
      mtd: {
        purchases: {
          count: mtdPurchases._count.id,
          total: Number(mtdPurchases._sum.totalAmount || 0),
        },
        expenses: {
          count: mtdExpenses._count.id,
          total: Number(mtdExpenses._sum.totalAmount || 0),
        },
        salesInvoices: {
          count: mtdSalesInvoices._count.id,
          total: Number(mtdSalesInvoices._sum.total || 0),
        },
        combined: {
          count: mtdPurchases._count.id + mtdExpenses._count.id,
          total: Number(mtdPurchases._sum.totalAmount || 0) + Number(mtdExpenses._sum.totalAmount || 0),
        },
      },
      ytd: {
        purchases: {
          count: ytdPurchases._count.id,
          total: Number(ytdPurchases._sum.totalAmount || 0),
        },
        expenses: {
          count: ytdExpenses._count.id,
          total: Number(ytdExpenses._sum.totalAmount || 0),
        },
        salesInvoices: {
          count: ytdSalesInvoices._count.id,
          total: Number(ytdSalesInvoices._sum.total || 0),
        },
        combined: {
          count: ytdPurchases._count.id + ytdExpenses._count.id,
          total: Number(ytdPurchases._sum.totalAmount || 0) + Number(ytdExpenses._sum.totalAmount || 0),
        },
      },
    };
  }
}
