import { Injectable } from '@nestjs/common';
import { PrismaClient, PurchaseInvoice, PurchaseCategory, PurchaseInvoiceStatus } from '@prisma/client';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from '../common/dto/purchase-invoice.dto';

@Injectable()
export class PurchaseInvoiceRepository {
  private prisma = new PrismaClient();

  async create(data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    return this.prisma.purchaseInvoice.create({
      data: {
        ...data,
        invoiceDate: new Date(data.invoiceDate),
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(
    skip: number = 0,
    take: number = 100,
    filters?: {
      vendorId?: string;
      category?: PurchaseCategory;
      status?: PurchaseInvoiceStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<PurchaseInvoice[]> {
    const where: any = {};

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
      where.invoiceDate = {};
      if (filters.startDate) {
        where.invoiceDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.invoiceDate.lte = filters.endDate;
      }
    }

    return this.prisma.purchaseInvoice.findMany({
      where,
      skip,
      take,
      orderBy: { invoiceDate: 'desc' },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<PurchaseInvoice | null> {
    return this.prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: {
        ...data,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            contactPerson: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async updateImageInfo(
    id: string,
    imageUrl: string,
    imageName: string,
    imageSize: number,
  ): Promise<PurchaseInvoice> {
    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: {
        imageUrl,
        imageName,
        imageSize,
      },
    });
  }

  async delete(id: string): Promise<PurchaseInvoice> {
    return this.prisma.purchaseInvoice.delete({
      where: { id },
    });
  }

  async count(filters?: {
    vendorId?: string;
    category?: PurchaseCategory;
    status?: PurchaseInvoiceStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const where: any = {};

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
      where.invoiceDate = {};
      if (filters.startDate) {
        where.invoiceDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.invoiceDate.lte = filters.endDate;
      }
    }

    return this.prisma.purchaseInvoice.count({ where });
  }
}
