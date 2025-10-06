import { Injectable } from '@nestjs/common';
import { PrismaClient, ExpenseInvoice, ExpenseCategory, PurchaseInvoiceStatus } from '@prisma/client';
import { CreateExpenseInvoiceDto, UpdateExpenseInvoiceDto } from '../common/dto/expense-invoice.dto';

@Injectable()
export class ExpenseInvoiceRepository {
  private prisma = new PrismaClient();

  async create(data: CreateExpenseInvoiceDto): Promise<ExpenseInvoice> {
    return this.prisma.expenseInvoice.create({
      data: {
        ...data,
        invoiceDate: new Date(data.invoiceDate),
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        status: data.status || 'PENDING',
        isRecurring: data.isRecurring ?? false,
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
      category?: ExpenseCategory;
      status?: PurchaseInvoiceStatus;
      isRecurring?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<ExpenseInvoice[]> {
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
    if (filters?.isRecurring !== undefined) {
      where.isRecurring = filters.isRecurring;
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

    return this.prisma.expenseInvoice.findMany({
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

  async findById(id: string): Promise<ExpenseInvoice | null> {
    return this.prisma.expenseInvoice.findUnique({
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

  async update(id: string, data: UpdateExpenseInvoiceDto): Promise<ExpenseInvoice> {
    return this.prisma.expenseInvoice.update({
      where: { id },
      data: {
        ...data,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
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
  ): Promise<ExpenseInvoice> {
    return this.prisma.expenseInvoice.update({
      where: { id },
      data: {
        imageUrl,
        imageName,
        imageSize,
      },
    });
  }

  async delete(id: string): Promise<ExpenseInvoice> {
    return this.prisma.expenseInvoice.delete({
      where: { id },
    });
  }

  async count(filters?: {
    vendorId?: string;
    category?: ExpenseCategory;
    status?: PurchaseInvoiceStatus;
    isRecurring?: boolean;
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
    if (filters?.isRecurring !== undefined) {
      where.isRecurring = filters.isRecurring;
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

    return this.prisma.expenseInvoice.count({ where });
  }
}
