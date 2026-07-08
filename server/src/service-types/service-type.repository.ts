import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { ServiceType, Prisma } from '@prisma/client';

@Injectable()
export class ServiceTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = false): Promise<ServiceType[]> {
    return this.prisma.serviceType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<ServiceType | null> {
    return this.prisma.serviceType.findUnique({ where: { id } });
  }

  async findByCode(code: string): Promise<ServiceType | null> {
    return this.prisma.serviceType.findUnique({ where: { code } });
  }

  async create(data: Prisma.ServiceTypeCreateInput): Promise<ServiceType> {
    return this.prisma.serviceType.create({ data });
  }

  async update(
    id: string,
    data: Prisma.ServiceTypeUpdateInput
  ): Promise<ServiceType> {
    return this.prisma.serviceType.update({ where: { id }, data });
  }

  async delete(id: string): Promise<ServiceType> {
    return this.prisma.serviceType.delete({ where: { id } });
  }

  async maxSortOrder(): Promise<number> {
    const result = await this.prisma.serviceType.aggregate({
      _max: { sortOrder: true },
    });
    return result._max.sortOrder ?? 0;
  }
}
