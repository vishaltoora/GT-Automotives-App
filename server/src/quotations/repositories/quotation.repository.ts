import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { Quotation, Prisma } from '@prisma/client';

@Injectable()
export class QuotationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.QuotationCreateInput): Promise<Quotation> {
    return this.prisma.quotation.create({
      data,
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Quotation[]> {
    return this.prisma.quotation.findMany({
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Quotation | null> {
    return this.prisma.quotation.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async findByNumber(quotationNumber: string): Promise<Quotation | null> {
    return this.prisma.quotation.findUnique({
      where: { quotationNumber },
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.QuotationUpdateInput
  ): Promise<Quotation> {
    return this.prisma.quotation.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Quotation> {
    return this.prisma.quotation.delete({
      where: { id },
    });
  }

  async deleteItems(quotationId: string): Promise<void> {
    await this.prisma.quotationItem.deleteMany({
      where: { quotationId },
    });
  }

  async createItems(
    items: Prisma.QuotationItemCreateManyInput[]
  ): Promise<void> {
    await this.prisma.quotationItem.createMany({
      data: items,
    });
  }

  /**
   * Swap a quotation's items and update the quotation itself, atomically.
   *
   * Editing a quote replaces its whole item set. Doing that as separate
   * delete/create calls means a failure in the create leaves the quotation
   * with no items at all — a Prisma validation error wiped the line items off
   * a real quote exactly this way, leaving stale totals and nothing to show.
   * Running all three statements in one transaction means a failed save now
   * changes nothing.
   */
  async replaceItemsAndUpdate(
    id: string,
    items: Prisma.QuotationItemCreateManyInput[],
    data: Prisma.QuotationUpdateInput
  ): Promise<Quotation> {
    return this.prisma.$transaction(async (tx) => {
      await tx.quotationItem.deleteMany({ where: { quotationId: id } });
      if (items.length > 0) {
        await tx.quotationItem.createMany({ data: items });
      }
      return tx.quotation.update({
        where: { id },
        data,
        include: {
          items: {
            include: {
              tire: true,
            },
          },
        },
      });
    });
  }

  async search(params: {
    customerName?: string;
    quotationNumber?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Quotation[]> {
    const where: Prisma.QuotationWhereInput = {};

    if (params.customerName) {
      where.OR = [
        {
          customerName: {
            contains: params.customerName,
            mode: 'insensitive',
          },
        },
        {
          businessName: {
            contains: params.customerName,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (params.quotationNumber) {
      where.quotationNumber = {
        contains: params.quotationNumber,
        mode: 'insensitive',
      };
    }

    if (params.status) {
      where.status = params.status as any;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.createdAt.lte = new Date(params.endDate);
      }
    }

    return this.prisma.quotation.findMany({
      where,
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async convertToInvoice(
    quotationId: string,
    invoiceId: string
  ): Promise<Quotation> {
    return this.prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'CONVERTED',
        convertedToInvoiceId: invoiceId,
      },
    });
  }
}
