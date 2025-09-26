import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });
  }

  async findDefault() {
    return this.prisma.company.findFirst({
      where: { isDefault: true }
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id }
    });
  }
}