import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Get date range for comparisons
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total revenue (sum of all paid invoices)
    const revenueResult = await this.prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: 'PAID',
      },
    });

    // Get last month's revenue for comparison
    const lastMonthRevenueResult = await this.prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: 'PAID',
        invoiceDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calculate revenue change
    const currentRevenue = Number(revenueResult._sum.total || 0);
    const lastMonthRevenue = Number(lastMonthRevenueResult._sum.total || 0);
    const revenueChange = lastMonthRevenue > 0
      ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Get total customers
    const totalCustomers = await this.prisma.customer.count();

    // Get last month's customer count
    const lastMonthCustomers = await this.prisma.customer.count({
      where: {
        createdAt: {
          lte: endOfLastMonth,
        },
      },
    });

    const customerChange = lastMonthCustomers > 0
      ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
      : 0;

    // Get total vehicles
    const totalVehicles = await this.prisma.vehicle.count();

    // Get last month's vehicle count
    const lastMonthVehicles = await this.prisma.vehicle.count({
      where: {
        createdAt: {
          lte: endOfLastMonth,
        },
      },
    });

    const vehicleChange = lastMonthVehicles > 0
      ? ((totalVehicles - lastMonthVehicles) / lastMonthVehicles) * 100
      : 0;

    // Get today's appointments (if appointments table exists, otherwise use invoices)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // For now, use invoices created today as proxy for appointments
    const todayInvoices = await this.prisma.invoice.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const yesterdayInvoices = await this.prisma.invoice.count({
      where: {
        createdAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
      },
    });

    const appointmentChange = yesterdayInvoices > 0
      ? ((todayInvoices - yesterdayInvoices) / yesterdayInvoices) * 100
      : 0;

    // Get total inventory items
    const totalInventory = await this.prisma.tire.aggregate({
      _sum: {
        quantity: true,
      },
    });

    // Get low stock items count (items where quantity <= minStock)
    const allTires = await this.prisma.tire.findMany({
      select: {
        quantity: true,
        minStock: true,
      },
    });

    const lowStockItems = allTires.filter(tire => tire.quantity <= tire.minStock).length;

    return {
      revenue: {
        value: Number(currentRevenue),
        change: Number(revenueChange.toFixed(1)),
        trend: revenueChange >= 0 ? 'up' : 'down',
      },
      customers: {
        value: totalCustomers,
        change: Number(customerChange.toFixed(1)),
        trend: customerChange >= 0 ? 'up' : 'down',
      },
      vehicles: {
        value: totalVehicles,
        change: Number(vehicleChange.toFixed(1)),
        trend: vehicleChange >= 0 ? 'up' : 'down',
      },
      appointments: {
        value: todayInvoices,
        change: Number(appointmentChange.toFixed(1)),
        trend: appointmentChange >= 0 ? 'up' : 'down',
      },
      inventory: {
        value: Number(totalInventory._sum.quantity || 0),
        lowStock: lowStockItems,
      },
    };
  }
}
