import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Vehicle, Prisma } from '@prisma/client';

@Injectable()
export class VehicleRepository extends BaseRepository<
  Vehicle,
  Prisma.VehicleCreateInput,
  Prisma.VehicleUpdateInput,
  Prisma.VehicleWhereUniqueInput,
  Prisma.VehicleWhereInput,
  Prisma.VehicleOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'vehicle');
  }

  async findAllWithDetails() {
    return this.prisma.vehicle.findMany({
      include: {
        customer: true,
        _count: {
          select: {
            invoices: true,
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.vehicle.findMany({
      where: { customerId },
      include: {
        _count: {
          select: {
            invoices: true,
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneWithDetails(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: true,
        invoices: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            items: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: {
            scheduledDate: 'desc',
          },
        },
      },
    });
  }

  async findByVin(vin: string) {
    return this.prisma.vehicle.findUnique({
      where: { vin },
      include: {
        customer: true,
      },
    });
  }

  async search(searchTerm: string) {
    return this.prisma.vehicle.findMany({
      where: {
        OR: [
          { make: { contains: searchTerm, mode: 'insensitive' } },
          { model: { contains: searchTerm, mode: 'insensitive' } },
          { vin: { contains: searchTerm, mode: 'insensitive' } },
          { licensePlate: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        customer: true,
        _count: {
          select: {
            invoices: true,
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getVehicleStats(vehicleId: string) {
    const [serviceCount, totalSpent, lastService, nextAppointment] = await Promise.all([
      // Number of services
      this.prisma.invoice.count({
        where: { vehicleId },
      }),
      // Total amount spent on this vehicle
      this.prisma.invoice.aggregate({
        where: {
          vehicleId,
          status: 'PAID',
        },
        _sum: {
          total: true,
        },
      }),
      // Last service date
      this.prisma.invoice.findFirst({
        where: { vehicleId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // Next scheduled appointment
      this.prisma.appointment.findFirst({
        where: {
          vehicleId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledDate: { gte: new Date() },
        },
        orderBy: { scheduledDate: 'asc' },
        select: {
          scheduledDate: true,
          scheduledTime: true,
          serviceType: true,
        },
      }),
    ]);

    return {
      serviceCount,
      totalSpent: totalSpent._sum.total || 0,
      lastServiceDate: lastService?.createdAt || null,
      nextAppointment,
    };
  }
}