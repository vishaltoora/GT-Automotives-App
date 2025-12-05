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
}