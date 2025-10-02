import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { Service, Prisma } from '@prisma/client';

@Injectable()
export class ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return this.prisma.service.create({ data });
  }

  async findAll(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { name },
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Service> {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
