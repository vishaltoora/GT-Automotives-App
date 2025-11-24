import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { SquarePayment, SquarePaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class SquarePaymentRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SquarePaymentCreateInput): Promise<SquarePayment> {
    return this.prisma.squarePayment.create({
      data,
      include: {
        invoice: true,
      },
    });
  }

  async findById(id: string): Promise<SquarePayment | null> {
    return this.prisma.squarePayment.findUnique({
      where: { id },
      include: {
        invoice: true,
      },
    });
  }

  async findBySquarePaymentId(
    squarePaymentId: string,
  ): Promise<SquarePayment | null> {
    return this.prisma.squarePayment.findUnique({
      where: { squarePaymentId },
      include: {
        invoice: true,
      },
    });
  }

  async findByInvoiceId(invoiceId: string): Promise<SquarePayment[]> {
    return this.prisma.squarePayment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: Prisma.SquarePaymentUpdateInput,
  ): Promise<SquarePayment> {
    return this.prisma.squarePayment.update({
      where: { id },
      data,
      include: {
        invoice: true,
      },
    });
  }

  async updateBySquarePaymentId(
    squarePaymentId: string,
    data: Prisma.SquarePaymentUpdateInput,
  ): Promise<SquarePayment> {
    return this.prisma.squarePayment.update({
      where: { squarePaymentId },
      data,
      include: {
        invoice: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: SquarePaymentStatus,
  ): Promise<SquarePayment> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<SquarePayment> {
    return this.prisma.squarePayment.delete({
      where: { id },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.SquarePaymentWhereInput;
    orderBy?: Prisma.SquarePaymentOrderByWithRelationInput;
  }): Promise<SquarePayment[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.squarePayment.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        invoice: true,
      },
    });
  }

  async count(where?: Prisma.SquarePaymentWhereInput): Promise<number> {
    return this.prisma.squarePayment.count({ where });
  }
}
