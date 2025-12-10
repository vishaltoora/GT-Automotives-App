import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Customer, Prisma } from '@prisma/client';

@Injectable()
export class CustomerRepository extends BaseRepository<
  Customer,
  Prisma.CustomerCreateInput,
  Prisma.CustomerUpdateInput,
  Prisma.CustomerFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'customer');
  }

  async findByEmail(email: string) {
    return this.prisma.customer.findFirst({
      where: { email },
      include: {
        vehicles: true,
        _count: {
          select: {
            invoices: true,
            appointments: true,
          },
        },
      },
    });
  }

  async findAllWithDetails() {
    return this.prisma.customer.findMany({
      include: {
        vehicles: true,
        _count: {
          select: {
            invoices: true,
            appointments: true,
            vehicles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneWithDetails(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        // Return all invoices for accurate outstanding balance calculation
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            vehicle: true,
            items: true,
          },
        },
        // Return all appointments for complete history
        appointments: {
          orderBy: {
            scheduledDate: 'desc',
          },
          include: {
            vehicle: true,
            employees: {
              include: {
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        smsPreference: true,
      },
    });
  }

  async search(searchTerm: string) {
    return this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
          { businessName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        vehicles: true,
        _count: {
          select: {
            invoices: true,
            appointments: true,
            vehicles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCustomerStats(customerId: string) {
    const [totalSpent, invoiceOutstanding, vehicleCount, appointmentCount, upcomingAppointments, lastVisit, unpaidAppointments] = await Promise.all([
      // Total amount spent (PAID invoices)
      this.prisma.invoice.aggregate({
        where: {
          customerId,
          status: 'PAID',
        },
        _sum: {
          total: true,
        },
      }),
      // Outstanding balance from invoices (PENDING and DRAFT invoices)
      this.prisma.invoice.aggregate({
        where: {
          customerId,
          status: { in: ['PENDING', 'DRAFT'] },
        },
        _sum: {
          total: true,
        },
      }),
      // Number of vehicles
      this.prisma.vehicle.count({
        where: { customerId },
      }),
      // Total number of appointments
      this.prisma.appointment.count({
        where: { customerId },
      }),
      // Upcoming appointments count
      this.prisma.appointment.count({
        where: {
          customerId,
          scheduledDate: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      // Last visit date
      this.prisma.invoice.findFirst({
        where: { customerId, status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // Completed appointments with outstanding balance (expectedAmount > paymentAmount)
      this.prisma.appointment.findMany({
        where: {
          customerId,
          status: 'COMPLETED',
          expectedAmount: { gt: 0 },
        },
        select: {
          expectedAmount: true,
          paymentAmount: true,
        },
      }),
    ]);

    // Calculate outstanding from appointments (expectedAmount - paymentAmount for each)
    const appointmentOutstanding = unpaidAppointments.reduce((sum, apt) => {
      const expected = Number(apt.expectedAmount) || 0;
      const paid = Number(apt.paymentAmount) || 0;
      const remaining = expected - paid;
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    // Total outstanding = invoices + appointments
    const invoiceOutstandingAmount = Number(invoiceOutstanding._sum.total) || 0;
    const totalOutstanding = invoiceOutstandingAmount + appointmentOutstanding;

    return {
      totalSpent: totalSpent._sum.total || 0,
      outstandingBalance: totalOutstanding,
      vehicleCount,
      appointmentCount,
      upcomingAppointments,
      lastVisitDate: lastVisit?.createdAt || null,
    };
  }

  override async findById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  /**
   * Get stats for ALL customers in a SINGLE optimized SQL query
   * This eliminates the N+1 problem completely with one database round-trip
   */
  async getAllCustomerStats(): Promise<Map<string, {
    totalSpent: number;
    outstandingBalance: number;
    vehicleCount: number;
    appointmentCount: number;
    upcomingAppointments: number;
    lastVisitDate: Date | null;
  }>> {
    // Single raw SQL query that calculates all stats for all customers
    const results = await this.prisma.$queryRaw<Array<{
      customerId: string;
      totalSpent: number | null;
      invoiceOutstanding: number | null;
      appointmentOutstanding: number | null;
      vehicleCount: bigint;
      appointmentCount: bigint;
      upcomingAppointments: bigint;
      lastVisitDate: Date | null;
    }>>`
      SELECT
        c.id as "customerId",
        -- Total spent (PAID invoices)
        COALESCE((
          SELECT SUM(i.total)
          FROM "Invoice" i
          WHERE i."customerId" = c.id AND i.status = 'PAID'
        ), 0) as "totalSpent",
        -- Invoice outstanding (PENDING + DRAFT)
        COALESCE((
          SELECT SUM(i.total)
          FROM "Invoice" i
          WHERE i."customerId" = c.id AND i.status IN ('PENDING', 'DRAFT')
        ), 0) as "invoiceOutstanding",
        -- Appointment outstanding (completed with unpaid balance)
        COALESCE((
          SELECT SUM(GREATEST(a."expectedAmount" - COALESCE(a."paymentAmount", 0), 0))
          FROM "Appointment" a
          WHERE a."customerId" = c.id AND a.status = 'COMPLETED' AND a."expectedAmount" > 0
        ), 0) as "appointmentOutstanding",
        -- Vehicle count
        (SELECT COUNT(*) FROM "Vehicle" v WHERE v."customerId" = c.id) as "vehicleCount",
        -- Appointment count
        (SELECT COUNT(*) FROM "Appointment" a WHERE a."customerId" = c.id) as "appointmentCount",
        -- Upcoming appointments
        (
          SELECT COUNT(*)
          FROM "Appointment" a
          WHERE a."customerId" = c.id
            AND a."scheduledDate" >= CURRENT_DATE
            AND a.status IN ('SCHEDULED', 'CONFIRMED')
        ) as "upcomingAppointments",
        -- Last visit date (most recent PAID invoice)
        (
          SELECT MAX(i."createdAt")
          FROM "Invoice" i
          WHERE i."customerId" = c.id AND i.status = 'PAID'
        ) as "lastVisitDate"
      FROM "Customer" c
    `;

    // Build the stats map from query results
    const statsMap = new Map<string, {
      totalSpent: number;
      outstandingBalance: number;
      vehicleCount: number;
      appointmentCount: number;
      upcomingAppointments: number;
      lastVisitDate: Date | null;
    }>();

    for (const row of results) {
      const invoiceOutstanding = Number(row.invoiceOutstanding) || 0;
      const appointmentOutstanding = Number(row.appointmentOutstanding) || 0;

      statsMap.set(row.customerId, {
        totalSpent: Number(row.totalSpent) || 0,
        outstandingBalance: invoiceOutstanding + appointmentOutstanding,
        vehicleCount: Number(row.vehicleCount),
        appointmentCount: Number(row.appointmentCount),
        upcomingAppointments: Number(row.upcomingAppointments),
        lastVisitDate: row.lastVisitDate,
      });
    }

    return statsMap;
  }
}