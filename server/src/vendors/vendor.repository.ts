import { Injectable } from '@nestjs/common';
import { PrismaClient, Vendor } from '@prisma/client';
import { CreateVendorDto, UpdateVendorDto } from '../common/dto/vendor.dto';

@Injectable()
export class VendorRepository {
  private prisma = new PrismaClient();

  async create(data: CreateVendorDto): Promise<Vendor> {
    return this.prisma.vendor.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(skip: number = 0, take: number = 100): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            purchaseInvoices: true,
            expenseInvoices: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseInvoices: true,
            expenseInvoices: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { name },
    });
  }

  async search(query: string, limit: number = 10): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contactPerson: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: UpdateVendorDto): Promise<Vendor> {
    return this.prisma.vendor.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            purchaseInvoices: true,
            expenseInvoices: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Vendor> {
    // Soft delete by setting isActive to false
    return this.prisma.vendor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async count(): Promise<number> {
    return this.prisma.vendor.count();
  }

  async findActive(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
