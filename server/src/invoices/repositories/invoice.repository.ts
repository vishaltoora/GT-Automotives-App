import { Injectable } from '@nestjs/common';
import { Prisma, Invoice, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';
import {
  extractBusinessDate,
  POSTGRES_TIMEZONE,
} from '../../config/timezone.config';

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

  async findByCustomer(
    customerId: string,
    includeItems = false
  ): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { customerId },
      include: {
        customer: true,
        vehicle: true,
        items: includeItems
          ? {
              include: {
                tire: true,
              },
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: { status },
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithDetails(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        company: true,
        repairOrder: {
          select: { id: true, roNumber: true, status: true },
        },
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
    items: Prisma.InvoiceItemCreateWithoutInvoiceInput[],
    // Optional up-front payment recorded in the SAME transaction so an invoice
    // created as paid never exists without its ledger row.
    initialPayment?: {
      amount: number;
      paymentMethod: PaymentMethod;
      paidAt: Date;
      createdBy: string;
    }
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
          customer: true,
          vehicle: true,
          company: true,
          items: {
            include: {
              tire: true,
            },
          },
        },
      });

      // Deduct tire inventory for tire items
      for (const item of items) {
        if (item.itemType === 'TIRE' && (item as any).tireId) {
          await tx.tire.update({
            where: { id: (item as any).tireId as string },
            data: {
              quantity: {
                decrement: Number(item.quantity),
              },
            },
          });
        }
      }

      if (initialPayment) {
        await tx.invoicePayment.create({
          data: {
            invoiceId: invoice.id,
            amount: new Decimal(initialPayment.amount),
            paymentMethod: initialPayment.paymentMethod,
            paidAt: initialPayment.paidAt,
            createdBy: initialPayment.createdBy,
          },
        });
      }

      return invoice;
    });
  }

  async updateStatus(
    id: string,
    status: InvoiceStatus,
    paidAt?: Date
  ): Promise<Invoice> {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAID' ? paidAt || new Date() : undefined,
      },
      include: {
        customer: true,
        vehicle: true,
        company: true,
        items: {
          include: {
            tire: true,
          },
        },
      },
    });
  }

  async updateWithItems(
    id: string,
    invoiceData: Prisma.InvoiceUpdateInput,
    items?: Prisma.InvoiceItemCreateWithoutInvoiceInput[]
  ): Promise<Invoice> {
    return this.prisma.$transaction(async (tx) => {
      // If items are provided, delete old items and create new ones
      if (items) {
        // Get existing items to restore tire inventory
        const existingInvoice = await tx.invoice.findUnique({
          where: { id },
          include: { items: true },
        });

        if (existingInvoice) {
          // Restore tire inventory for old tire items
          for (const item of existingInvoice.items) {
            if (item.itemType === 'TIRE' && item.tireId) {
              await tx.tire.update({
                where: { id: item.tireId },
                data: {
                  quantity: {
                    increment: Number(item.quantity),
                  },
                },
              });
            }
          }
        }

        // Delete old items
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      // Update invoice with new data
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          ...invoiceData,
          ...(items && {
            items: {
              create: items,
            },
          }),
        },
        include: {
          customer: true,
          vehicle: true,
          company: true,
          items: {
            include: {
              tire: true,
            },
          },
        },
      });

      // Deduct tire inventory for new tire items
      if (items) {
        for (const item of items) {
          if (item.itemType === 'TIRE' && (item as any).tireId) {
            await tx.tire.update({
              where: { id: (item as any).tireId as string },
              data: {
                quantity: {
                  decrement: Number(item.quantity),
                },
              },
            });
          }
        }
      }

      return invoice;
    });
  }

  // ---- Payment ledger (partial / split payments) -------------------------

  /** Insert a single payment ledger row (without touching the invoice). */
  async recordLedgerRow(payment: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paidAt: Date;
    createdBy: string;
    notes?: string;
  }): Promise<void> {
    await this.prisma.invoicePayment.create({
      data: {
        invoiceId: payment.invoiceId,
        amount: new Decimal(payment.amount),
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt,
        createdBy: payment.createdBy,
        notes: payment.notes,
      },
    });
  }

  /** Append one or more payment rows and update the invoice atomically. */
  async addPayments(
    invoiceId: string,
    payments: Array<{
      invoiceId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      paidAt: Date;
      createdBy: string;
      notes?: string;
      reference?: string;
    }>,
    invoiceUpdate: Prisma.InvoiceUpdateInput
  ): Promise<Invoice> {
    return this.prisma.$transaction(async (tx) => {
      for (const payment of payments) {
        await tx.invoicePayment.create({
          data: {
            invoiceId,
            amount: new Decimal(payment.amount),
            paymentMethod: payment.paymentMethod,
            paidAt: payment.paidAt,
            createdBy: payment.createdBy,
            notes: payment.notes,
            reference: payment.reference,
          },
        });
      }
      return tx.invoice.update({
        where: { id: invoiceId },
        data: invoiceUpdate,
        include: {
          customer: true,
          vehicle: true,
          company: true,
          items: { include: { tire: true } },
        },
      });
    });
  }

  /** When a combined parent is fully paid, mark its children paid too. */
  async settleConsolidatedChildren(
    parentId: string,
    paymentMethod: PaymentMethod,
    paidAt: Date
  ): Promise<void> {
    const children = await this.prisma.invoice.findMany({
      where: {
        combinedInvoiceId: parentId,
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
      },
      select: { id: true, total: true },
    });
    for (const child of children) {
      await this.prisma.invoice.update({
        where: { id: child.id },
        data: {
          status: 'PAID',
          paymentMethod,
          paidAt,
          amountPaid: child.total,
        },
      });
      // A consolidated child is typically an RO invoice — complete its appointment.
      await this.completeAppointmentForInvoice(child.id);
    }
  }

  /**
   * Mark the appointment linked to an invoice as COMPLETED. Resolves the
   * appointment either directly (`invoice.appointmentId`) or via the invoice's
   * repair order (`invoice.repairOrder.appointmentId`). Only money is tracked on
   * the invoice ledger — the appointment's payment fields are intentionally left
   * untouched (no double counting in the Day Summary). No-op when there is no
   * linked appointment or it's already completed/cancelled.
   */
  async completeAppointmentForInvoice(invoiceId: string): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        appointmentId: true,
        repairOrder: { select: { appointmentId: true } },
      },
    });
    const appointmentId =
      invoice?.appointmentId ?? invoice?.repairOrder?.appointmentId ?? null;
    if (!appointmentId) return;

    await this.prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
      },
      data: { status: 'COMPLETED' },
    });
  }

  async linkConsolidatedChildren(
    parentId: string,
    childIds: string[]
  ): Promise<void> {
    await this.prisma.invoice.updateMany({
      where: { id: { in: childIds } },
      data: { combinedInvoiceId: parentId },
    });
  }

  /** Open invoices that can be rolled into a combined invoice (excludes parents). */
  async findCombinableForCustomer(customerId: string): Promise<any[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        customerId,
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        combinedInvoiceId: null,
      },
      include: { consolidatedInvoices: { select: { id: true } } },
      orderBy: { invoiceDate: 'asc' },
    });
    return invoices.filter((inv) => inv.consolidatedInvoices.length === 0);
  }

  // ---- Day Summary: invoice money + outstanding --------------------------

  /**
   * Invoice payments collected on `date` (business timezone), grouped by
   * payment method.
   *
   * No appointment-dedup is needed: appointment-flow money lives on the
   * appointment (paymentBreakdown) and is summed from the appointment fetch,
   * and that flow never writes InvoicePayment rows — so the ledger holds only
   * invoice-originated money. (An earlier dedup against appointment.paymentDate
   * caused undercounts and is intentionally removed.)
   */
  async getDaySummaryInvoicePayments(date: string): Promise<any> {
    const dateOnly = extractBusinessDate(date);
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT ip.id, ip.amount, ip."paymentMethod", ip."paidAt",
             i.id AS "invoiceId", i."invoiceNumber",
             c."firstName", c."lastName", c."businessName",
             COALESCE(a."appointmentType", roa."appointmentType") AS "appointmentType"
      FROM "InvoicePayment" ip
      JOIN "Invoice" i ON i.id = ip."invoiceId"
      JOIN "Customer" c ON c.id = i."customerId"
      LEFT JOIN "Appointment" a ON a.id = i."appointmentId"
      LEFT JOIN "repair_orders" ro ON ro.id = i."repairOrderId"
      LEFT JOIN "Appointment" roa ON roa.id = ro."appointmentId"
      WHERE DATE(ip."paidAt" AT TIME ZONE 'UTC' AT TIME ZONE ${POSTGRES_TIMEZONE}) = ${dateOnly}::date
      ORDER BY ip."paidAt" DESC
    `;

    const byPaymentMethod: Record<string, number> = {};
    // Invoice money split by service location. Mobile-service invoices go to
    // mobile; everything else (at-garage or no linked appointment) is At Shop.
    const atGarage = {
      total: 0,
      byPaymentMethod: {} as Record<string, number>,
    };
    const mobileService = {
      total: 0,
      byPaymentMethod: {} as Record<string, number>,
    };
    let total = 0;
    const payments = rows.map((r) => {
      const amount = Number(r.amount);
      total += amount;
      byPaymentMethod[r.paymentMethod] =
        (byPaymentMethod[r.paymentMethod] || 0) + amount;

      const bucket =
        r.appointmentType === 'MOBILE_SERVICE' ? mobileService : atGarage;
      bucket.total += amount;
      bucket.byPaymentMethod[r.paymentMethod] =
        (bucket.byPaymentMethod[r.paymentMethod] || 0) + amount;

      const customerName =
        r.businessName ||
        `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() ||
        'Unknown';
      return {
        id: r.id,
        amount,
        paymentMethod: r.paymentMethod,
        paidAt: r.paidAt,
        invoiceId: r.invoiceId,
        invoiceNumber: r.invoiceNumber,
        customerName,
        appointmentType: r.appointmentType ?? null,
      };
    });

    return {
      date: dateOnly,
      total,
      count: payments.length,
      byPaymentMethod,
      atGarage,
      mobileService,
      payments,
    };
  }

  /**
   * Outstanding pending-invoice balance: today's pending invoices and the
   * cumulative total owed grouped by customer. Uses remaining balance
   * (total - amountPaid) and excludes consolidated children.
   */
  async getPendingInvoiceOutstanding(date: string): Promise<any> {
    const dateOnly = extractBusinessDate(date);
    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        combinedInvoiceId: null,
      },
      include: {
        customer: true,
        _count: { select: { consolidatedInvoices: true } },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    let cumulativeTotal = 0;
    let cumulativeCount = 0;
    let todayTotal = 0;
    let todayCount = 0;
    const byCustomerMap = new Map<string, any>();
    const todayByCustomerMap = new Map<string, any>();

    for (const inv of invoices) {
      const remaining = Number(inv.total) - Number(inv.amountPaid ?? 0);
      if (remaining <= 0.005) continue;

      cumulativeTotal += remaining;
      cumulativeCount += 1;

      const c: any = inv.customer;
      const name =
        c?.businessName ||
        `${c?.firstName ?? ''} ${c?.lastName ?? ''}`.trim() ||
        'Unknown';

      if (extractBusinessDate(inv.invoiceDate) === dateOnly) {
        todayTotal += remaining;
        todayCount += 1;
        const t = todayByCustomerMap.get(inv.customerId) || {
          customerId: inv.customerId,
          customerName: name,
          count: 0,
          outstanding: 0,
        };
        t.count += 1;
        t.outstanding += remaining;
        todayByCustomerMap.set(inv.customerId, t);
      }

      const existing = byCustomerMap.get(inv.customerId) || {
        customerId: inv.customerId,
        customerName: name,
        email: c?.email ?? null,
        count: 0,
        // How many of these can actually be rolled into a combined invoice —
        // combined parents are excluded (matches findCombinableForCustomer), so
        // the "Combine & Email" button only shows when there are >= 2 sources.
        combinableCount: 0,
        outstanding: 0,
        invoiceIds: [] as string[],
      };
      const isCombinedParent = (inv as any)._count?.consolidatedInvoices > 0;
      existing.count += 1;
      if (!isCombinedParent) existing.combinableCount += 1;
      existing.outstanding += remaining;
      existing.invoiceIds.push(inv.id);
      byCustomerMap.set(inv.customerId, existing);
    }

    const byCustomer = Array.from(byCustomerMap.values()).sort(
      (a, b) => b.outstanding - a.outstanding
    );
    const todayByCustomer = Array.from(todayByCustomerMap.values()).sort(
      (a, b) => b.outstanding - a.outstanding
    );

    return {
      date: dateOnly,
      today: {
        total: todayTotal,
        count: todayCount,
        byCustomer: todayByCustomer,
      },
      cumulative: {
        total: cumulativeTotal,
        count: cumulativeCount,
        byCustomer,
      },
    };
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
        customer: true,
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
      date: extractBusinessDate(date),
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
    companyId?: string;
  }): Promise<Invoice[]> {
    const where: Prisma.InvoiceWhereInput = {};

    // When both customerName and invoiceNumber have the same value,
    // treat it as a combined search (OR condition)
    if (
      searchParams.invoiceNumber &&
      searchParams.customerName &&
      searchParams.invoiceNumber === searchParams.customerName
    ) {
      const searchTerm = searchParams.invoiceNumber;
      where.OR = [
        {
          invoiceNumber: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          customer: {
            OR: [
              {
                firstName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                businessName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ];
    } else {
      // Individual search fields (backward compatibility)
      if (searchParams.invoiceNumber) {
        where.invoiceNumber = {
          contains: searchParams.invoiceNumber,
          mode: 'insensitive',
        };
      }

      if (searchParams.customerName) {
        where.customer = {
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
            {
              businessName: {
                contains: searchParams.customerName,
                mode: 'insensitive',
              },
            },
          ],
        };
      }
    }

    if (searchParams.status) {
      where.status = searchParams.status;
    }

    if (searchParams.companyId) {
      where.companyId = searchParams.companyId;
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

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        company: true,
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
      const lastSequence = parseInt(
        lastInvoice.invoiceNumber.split('-').pop() || '0'
      );
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  override async delete(id: string): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      // Get invoice with items to restore tire inventory
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!invoice) {
        return false;
      }

      // Restore tire inventory for tire items
      for (const item of invoice.items) {
        if (item.itemType === 'TIRE' && item.tireId) {
          await tx.tire.update({
            where: { id: item.tireId },
            data: {
              quantity: {
                increment: Number(item.quantity),
              },
            },
          });
        }
      }

      // Delete invoice items first (due to foreign key constraints)
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Delete the invoice
      await tx.invoice.delete({
        where: { id },
      });

      return true;
    });
  }
}
