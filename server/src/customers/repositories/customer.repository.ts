import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Customer, Prisma } from '@prisma/client';

@Injectable()
export class CustomerRepository extends BaseRepository<
  Customer,
  Prisma.CustomerCreateInput,
  Prisma.CustomerUpdateInput,
  Prisma.CustomerWhereUniqueInput,
  Prisma.CustomerWhereInput,
  Prisma.CustomerOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'customer');
  }

  async findByUserId(userId: string) {
    return this.prisma.customer.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            role: true,
          },
        },
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
        user: {
          include: {
            role: true,
          },
        },
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
        user: {
          include: {
            role: true,
          },
        },
        vehicles: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        invoices: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            vehicle: true,
            items: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: {
            scheduledDate: 'desc',
          },
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async search(searchTerm: string) {
    return this.prisma.customer.findMany({
      where: {
        OR: [
          {
            user: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
          { address: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
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
    const [totalSpent, vehicleCount, appointmentCount, lastVisit] = await Promise.all([
      // Total amount spent
      this.prisma.invoice.aggregate({
        where: {
          customerId,
          status: 'PAID',
        },
        _sum: {
          total: true,
        },
      }),
      // Number of vehicles
      this.prisma.vehicle.count({
        where: { customerId },
      }),
      // Number of appointments
      this.prisma.appointment.count({
        where: { customerId },
      }),
      // Last visit date
      this.prisma.invoice.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalSpent: totalSpent._sum.total || 0,
      vehicleCount,
      appointmentCount,
      lastVisitDate: lastVisit?.createdAt || null,
    };
  }
}