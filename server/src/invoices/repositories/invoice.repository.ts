import { Injectable } from '@nestjs/common';
import { Prisma, Invoice, InvoiceStatus } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class InvoiceRepository extends BaseRepository<
  Invoice,
  Prisma.InvoiceCreateInput,
  Prisma.InvoiceUpdateInput,
  Prisma.InvoiceFindManyArgs
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'invoice');
  }

  async findByCustomer(customerId: string, includeItems = false): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { customerId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        vehicle: true,
        items: includeItems ? {
          include: {
            tire: true,
          },
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { status },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithDetails(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        vehicle: true,
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async createWithItems(
    invoiceData: Prisma.InvoiceCreateInput,
    items: Prisma.InvoiceItemCreateWithoutInvoiceInput[]
  ): Promise<Invoice> {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          items: {
            create: items,
          },
        },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
          vehicle: true,
          items: {
            include: {
              tire: true,
            },
          },
        },
      });

      // Deduct tire inventory for tire items
      for (const item of items) {
        if (item.itemType === 'TIRE' && item.tireId) {
          await tx.tire.update({
            where: { id: item.tireId as string },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return invoice;
    });
  }

  async updateStatus(id: string, status: InvoiceStatus, paidAt?: Date): Promise<Invoice> {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAID' ? (paidAt || new Date()) : undefined,
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        vehicle: true,
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async getDailyCashReport(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'PAID',
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    const byPaymentMethod = await this.prisma.invoice.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'PAID',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    return {
      date: date.toISOString().split('T')[0],
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
      byPaymentMethod,
      invoices,
    };
  }

  async searchInvoices(searchParams: {
    customerName?: string;
    invoiceNumber?: string;
    startDate?: Date;
    endDate?: Date;
    status?: InvoiceStatus;
  }): Promise<Invoice[]> {
    const where: Prisma.InvoiceWhereInput = {};

    if (searchParams.invoiceNumber) {
      where.invoiceNumber = {
        contains: searchParams.invoiceNumber,
        mode: 'insensitive',
      };
    }

    if (searchParams.status) {
      where.status = searchParams.status;
    }

    if (searchParams.startDate || searchParams.endDate) {
      where.createdAt = {};
      if (searchParams.startDate) {
        where.createdAt.gte = searchParams.startDate;
      }
      if (searchParams.endDate) {
        where.createdAt.lte = searchParams.endDate;
      }
    }

    if (searchParams.customerName) {
      where.customer = {
        user: {
          OR: [
            {
              firstName: {
                contains: searchParams.customerName,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: searchParams.customerName,
                mode: 'insensitive',
              },
            },
          ],
        },
      };
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        vehicle: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}${month}`,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
}