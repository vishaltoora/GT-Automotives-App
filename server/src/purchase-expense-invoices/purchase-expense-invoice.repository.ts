import { Injectable } from '@nestjs/common';
import {
  PrismaClient,
  PurchaseExpenseInvoice,
  PurchaseExpenseType,
  PurchaseExpenseCategory,
} from '@prisma/client';
import {
  CreatePurchaseExpenseInvoiceDto,
  UpdatePurchaseExpenseInvoiceDto,
} from '../common/dto/purchase-expense-invoice.dto';

@Injectable()
export class PurchaseExpenseInvoiceRepository {
  private prisma = new PrismaClient();

  async create(
    data: CreatePurchaseExpenseInvoiceDto,
    createdBy: string,
  ): Promise<PurchaseExpenseInvoice> {
    return this.prisma.purchaseExpenseInvoice.create({
      data: {
        type: data.type,
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        description: data.description,
        invoiceDate: new Date(data.invoiceDate),
        amount: data.amount,
        gstRate: data.gstRate,
        gstAmount: data.gstAmount,
        pstRate: data.pstRate,
        pstAmount: data.pstAmount,
        hstRate: data.hstRate,
        hstAmount: data.hstAmount,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        category: data.category,
        notes: data.notes,
        createdBy,
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
      type?: PurchaseExpenseType;
      vendorId?: string;
      search?: string;
      category?: PurchaseExpenseCategory;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<PurchaseExpenseInvoice[]> {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }
    if (filters?.search) {
      where.vendorName = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
    if (filters?.category) {
      where.category = filters.category;
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

    return this.prisma.purchaseExpenseInvoice.findMany({
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

  async findById(id: string): Promise<PurchaseExpenseInvoice | null> {
    return this.prisma.purchaseExpenseInvoice.findUnique({
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

  async update(
    id: string,
    data: UpdatePurchaseExpenseInvoiceDto,
  ): Promise<PurchaseExpenseInvoice> {
    const updateData: any = { ...data };
    if (data.invoiceDate) {
      updateData.invoiceDate = new Date(data.invoiceDate);
    }

    return this.prisma.purchaseExpenseInvoice.update({
      where: { id },
      data: updateData,
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
    imageUrl: string | null,
    imageName: string | null,
    imageSize: number | null,
  ): Promise<PurchaseExpenseInvoice> {
    return this.prisma.purchaseExpenseInvoice.update({
      where: { id },
      data: {
        imageUrl,
        imageName,
        imageSize,
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

  async delete(id: string): Promise<PurchaseExpenseInvoice> {
    return this.prisma.purchaseExpenseInvoice.delete({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async count(filters?: {
    type?: PurchaseExpenseType;
    vendorId?: string;
    search?: string;
    category?: PurchaseExpenseCategory;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }
    if (filters?.search) {
      where.vendorName = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
    if (filters?.category) {
      where.category = filters.category;
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

    return this.prisma.purchaseExpenseInvoice.count({ where });
  }
}
