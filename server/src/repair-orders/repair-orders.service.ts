import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AzureBlobService } from '../common/services/azure-blob.service';
import { ROStatus } from '@prisma/client';
import { InspectionsService } from '../inspections/inspections.service';
import { buildAdjustmentItems } from '../invoices/invoice-adjustments';
import {
  CreateRepairOrderDto,
  UpdateRepairOrderDto,
  CreateROServiceDto,
  UpdateROServiceDto,
  ROQueryDto,
  UpdateROMediaDto,
  CreateServiceCatalogItemDto,
  UpdateServiceCatalogItemDto,
} from '@gt-automotive/data';

@Injectable()
export class RepairOrdersService {
  private readonly roInclude = {
    customer: true,
    vehicle: true,
    appointment: {
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        serviceType: true,
        appointmentType: true,
        notes: true,
        status: true,
      },
    },
    employees: {
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    },
    services: {
      include: {
        completedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        media: { orderBy: { sortOrder: 'asc' as const } },
      },
      orderBy: { createdAt: 'asc' as const },
    },
    inspections: {
      select: {
        id: true,
        status: true,
        overallStatus: true,
        invoiceId: true,
        createdAt: true,
        completedAt: true,
        template: { select: { type: true, name: true } },
      },
    },
    media: { orderBy: { sortOrder: 'asc' as const } },
    invoice: {
      select: { id: true, invoiceNumber: true, status: true, total: true },
    },
  };

  constructor(
    private prisma: PrismaService,
    private azureBlob: AzureBlobService,
    private inspectionsService: InspectionsService
  ) {}

  /**
   * The repair-order-media container is private (the storage account forbids
   * public blob access), so the stored fileUrl is not directly viewable.
   * Swap it for a short-lived SAS URL on read — same pattern as invoice images.
   * Dev/mock entries (inline data URLs, no blob metadata) are left untouched.
   */
  private async withMediaSasUrl(media: any): Promise<any> {
    if (!media || !media.blobName || !media.containerName) return media;
    if (
      media.blobName.startsWith('mock-') ||
      (typeof media.fileUrl === 'string' &&
        (media.fileUrl.startsWith('data:') ||
          media.fileUrl.includes('localhost')))
    ) {
      return media;
    }
    try {
      const fileUrl = await this.azureBlob.generateSasUrl(
        media.containerName,
        media.blobName,
        120
      );
      return { ...media, fileUrl };
    } catch {
      // If SAS generation fails, fall back to the stored URL rather than 500.
      return media;
    }
  }

  /** Apply SAS URLs to the media nested directly on a repair order and on its services. */
  private async applyMediaSasUrls(ro: any): Promise<any> {
    if (!ro) return ro;
    if (Array.isArray(ro.media)) {
      ro.media = await Promise.all(
        ro.media.map((m: any) => this.withMediaSasUrl(m))
      );
    }
    if (Array.isArray(ro.services)) {
      ro.services = await Promise.all(
        ro.services.map(async (svc: any) => {
          if (Array.isArray(svc.media)) {
            svc.media = await Promise.all(
              svc.media.map((m: any) => this.withMediaSasUrl(m))
            );
          }
          return svc;
        })
      );
    }
    return ro;
  }

  async create(dto: CreateRepairOrderDto): Promise<any> {
    const roNumber = await this.generateRoNumber();

    const data: any = {
      roNumber,
      appointmentId: dto.appointmentId,
      customerId: dto.customerId,
      vehicleId: dto.vehicleId,
      customerConcern: dto.customerConcern,
      mileageIn: dto.mileageIn,
    };

    if (dto.employeeIds?.length) {
      data.employees = {
        create: dto.employeeIds.map((userId, index) => ({
          userId,
          role: index === 0 ? 'Lead' : 'Assistant',
        })),
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const ro = await tx.repairOrder.create({
        data,
        include: this.roInclude,
      });

      // Opening an RO moves its appointment into IN_PROGRESS. Guarded to only
      // advance not-yet-started appointments — never reopen a completed one or
      // touch a cancelled / no-show.
      if (dto.appointmentId) {
        await tx.appointment.updateMany({
          where: {
            id: dto.appointmentId,
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          data: { status: 'IN_PROGRESS' },
        });
      }

      return ro;
    });
  }

  async findAll(
    query: ROQueryDto,
    roleName: string,
    userId: string
  ): Promise<any[]> {
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.vehicleId) where.vehicleId = query.vehicleId;

    // Staff only see their assigned ROs unless explicitly querying all
    if (roleName === 'STAFF' && !query.employeeId) {
      where.employees = { some: { userId } };
    } else if (query.employeeId) {
      where.employees = { some: { userId: query.employeeId } };
    }

    if (query.startDate || query.endDate) {
      where.openedAt = {};
      if (query.startDate) where.openedAt.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setDate(end.getDate() + 1);
        where.openedAt.lt = end;
      }
    }

    if (query.search) {
      where.OR = [
        { roNumber: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            businessName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    return this.prisma.repairOrder.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        employees: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        services: { select: { id: true, status: true, total: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true } },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findOne(id: string, roleName: string, userId: string): Promise<any> {
    const ro = await this.prisma.repairOrder.findUnique({
      where: { id },
      include: this.roInclude,
    });

    if (!ro) throw new NotFoundException(`Repair order ${id} not found`);

    if (
      roleName === 'STAFF' &&
      !ro.employees.some((e: any) => e.userId === userId)
    ) {
      throw new ForbiddenException('You are not assigned to this repair order');
    }

    return this.applyMediaSasUrls(ro);
  }

  async findByVehicle(vehicleId: string): Promise<any[]> {
    return this.prisma.repairOrder.findMany({
      where: { vehicleId },
      include: {
        customer: true,
        employees: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        services: {
          select: { id: true, description: true, status: true, total: true },
        },
        invoice: {
          select: { id: true, invoiceNumber: true, status: true, total: true },
        },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async update(
    id: string,
    dto: UpdateRepairOrderDto,
    roleName: string
  ): Promise<any> {
    await this.assertExists(id);

    const data: any = { ...dto };

    // A vehicle and the "no vehicle" (loose tires) flag are mutually exclusive.
    if (dto.vehicleId) {
      data.noVehicle = false;
    } else if (dto.noVehicle === true) {
      data.vehicleId = null;
    }

    if (dto.status === ROStatus.CLOSED || dto.status === ROStatus.INVOICED) {
      if (roleName !== 'ADMIN' && roleName !== 'SUPERVISOR') {
        throw new ForbiddenException(
          'Only admin or supervisor can close a repair order'
        );
      }
      data.closedAt = new Date();
    }

    return this.prisma.repairOrder.update({
      where: { id },
      data,
      include: this.roInclude,
    });
  }

  // ---- Service Items ----

  async addService(roId: string, dto: CreateROServiceDto): Promise<any> {
    await this.assertExists(roId);
    const qty = dto.quantity ?? 1;
    const price = dto.unitPrice ?? 0;
    return this.prisma.rOService.create({
      data: {
        repairOrderId: roId,
        description: dto.description,
        type: dto.type ?? 'LABOR',
        quantity: qty,
        unitPrice: price,
        total: qty * price,
        technicianNotes: dto.technicianNotes,
      },
      include: {
        completedBy: { select: { id: true, firstName: true, lastName: true } },
        media: true,
      },
    });
  }

  async updateService(
    roId: string,
    serviceId: string,
    dto: UpdateROServiceDto,
    userId: string
  ): Promise<any> {
    const service = await this.prisma.rOService.findFirst({
      where: { id: serviceId, repairOrderId: roId },
    });
    if (!service) throw new NotFoundException('Service item not found');

    const data: any = { ...dto };
    if (dto.quantity !== undefined || dto.unitPrice !== undefined) {
      const qty = dto.quantity ?? Number(service.quantity);
      const price = dto.unitPrice ?? Number(service.unitPrice);
      data.total = qty * price;
    }
    if (dto.status === 'COMPLETED') {
      data.completedById = userId;
      data.completedAt = new Date();
    }

    return this.prisma.rOService.update({
      where: { id: serviceId },
      data,
      include: {
        completedBy: { select: { id: true, firstName: true, lastName: true } },
        media: true,
      },
    });
  }

  async removeService(roId: string, serviceId: string): Promise<void> {
    const service = await this.prisma.rOService.findFirst({
      where: { id: serviceId, repairOrderId: roId },
    });
    if (!service) throw new NotFoundException('Service item not found');
    await this.prisma.rOService.delete({ where: { id: serviceId } });
  }

  // ---- Media ----

  async addMedia(
    roId: string,
    file: any,
    uploadedById: string,
    mediaType: string,
    caption?: string,
    roServiceId?: string
  ): Promise<any> {
    await this.assertExists(roId);

    // Determine last sort order
    const lastMedia = await this.prisma.rOMedia.findFirst({
      where: { repairOrderId: roId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const sortOrder = (lastMedia?.sortOrder ?? -1) + 1;

    const created = await this.prisma.rOMedia.create({
      data: {
        repairOrderId: roId,
        roServiceId: roServiceId ?? null,
        fileUrl: file.fileUrl,
        blobName: file.blobName,
        containerName: file.containerName,
        mimeType: file.mimeType,
        fileName: file.fileName,
        size: file.size,
        caption: caption ?? null,
        mediaType: (mediaType as any) ?? 'OTHER',
        sortOrder,
        uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Return a viewable SAS URL so the just-uploaded photo renders immediately.
    return this.withMediaSasUrl(created);
  }

  async updateMedia(
    roId: string,
    mediaId: string,
    dto: UpdateROMediaDto
  ): Promise<any> {
    const media = await this.prisma.rOMedia.findFirst({
      where: { id: mediaId, repairOrderId: roId },
    });
    if (!media) throw new NotFoundException('Media not found');
    return this.prisma.rOMedia.update({ where: { id: mediaId }, data: dto });
  }

  async removeMedia(
    roId: string,
    mediaId: string,
    azureBlobService: any
  ): Promise<void> {
    const media = await this.prisma.rOMedia.findFirst({
      where: { id: mediaId, repairOrderId: roId },
    });
    if (!media) throw new NotFoundException('Media not found');

    if (media.blobName && media.containerName) {
      await azureBlobService
        .deleteInvoiceImage(media.containerName, media.blobName)
        .catch(() => {});
    }
    await this.prisma.rOMedia.delete({ where: { id: mediaId } });
  }

  // ---- Close → Invoice ----

  /**
   * Build the invoice line items and tax totals for a repair order's completed
   * services. Shared between the initial close→invoice and the re-sync path used
   * when an accidentally-closed RO is reopened, edited, and closed again.
   */
  private buildRoInvoiceTotals(
    ro: any,
    noTax = false
  ): {
    items: any[];
    subtotal: number;
    gstRate: number;
    pstRate: number;
    gstAmount: number;
    pstAmount: number;
    total: number;
  } {
    const completedServices = ro.services;
    const baseItems = completedServices.map((s: any) => ({
      description: s.description,
      itemType: s.type === 'PART' ? 'PART' : 'SERVICE',
      quantity: Number(s.quantity),
      unitPrice: Number(s.unitPrice),
      total: Number(s.total),
    }));

    // Add 4% shop supplies (always on RO invoices) and a 10% fleet discount on
    // services for fleet customers. Both are removable later by editing.
    const extraItems = buildAdjustmentItems(baseItems, {
      addShopSupplies: true,
      fleetDiscount: !!ro.customer?.fleetDiscount,
    }).map((e) => ({
      description: e.description,
      itemType: e.itemType,
      quantity: e.quantity,
      unitPrice: e.unitPrice,
      total:
        e.itemType === 'DISCOUNT'
          ? -Math.abs(e.quantity * e.unitPrice)
          : e.quantity * e.unitPrice,
    }));

    const items = [...baseItems, ...extraItems];
    const subtotal = items.reduce(
      (sum: number, i: any) => sum + Number(i.total),
      0
    );
    // CASH_NO_TAX (noTax) is an untaxed cash sale: zero out GST/PST so the
    // recorded total matches the cash actually collected. Mirrors the regular
    // invoice flow (invoices.service.ts, GA-30).
    const gstRate = noTax ? 0 : 0.05;
    const pstRate = noTax ? 0 : ro.customer?.pstExempt ? 0 : 0.07;
    const gstAmount = subtotal * gstRate;
    const pstAmount = subtotal * pstRate;
    const total = subtotal + gstAmount + pstAmount;

    return { items, subtotal, gstRate, pstRate, gstAmount, pstAmount, total };
  }

  /** True once any money has been collected against the invoice. */
  private invoiceHasPayment(invoice: any): boolean {
    return (
      !!invoice &&
      (invoice.status === 'PAID' ||
        invoice.status === 'PARTIALLY_PAID' ||
        Number(invoice.amountPaid ?? 0) > 0)
    );
  }

  async closeAndConvert(
    id: string,
    companyId: string,
    roleName: string,
    userId: string,
    feeItemId?: string,
    paymentMethod?: string
  ): Promise<any> {
    if (roleName !== 'ADMIN' && roleName !== 'SUPERVISOR') {
      throw new ForbiddenException(
        'Only admin or supervisor can close a repair order'
      );
    }

    const ro = await this.prisma.repairOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        services: { where: { status: 'COMPLETED' } },
        invoice: true,
        // Fetch all inspections (not just uninvoiced ones) so we can both find a
        // billable inspection AND detect one already linked to the existing invoice.
        inspections: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, invoiceId: true, status: true },
        },
      },
    });

    if (!ro) throw new NotFoundException('Repair order not found');

    const existingInvoice = ro.invoice;
    // A reopened RO keeps its (unpaid) invoice linked. Re-closing re-syncs that
    // invoice in place. Once any payment has been recorded, the invoice is
    // locked — money is on the books and its line items must not be rewritten.
    if (this.invoiceHasPayment(existingInvoice)) {
      throw new BadRequestException(
        "This repair order's invoice already has a recorded payment and cannot be regenerated"
      );
    }

    // If the existing invoice was generated from an inspection, its fee item is
    // not stored on the RO services, so we can't safely rebuild it here. Block the
    // re-sync and tell the user to edit the invoice directly.
    if (
      existingInvoice &&
      ro.inspections.some((i: any) => i.invoiceId === existingInvoice.id)
    ) {
      throw new BadRequestException(
        "This repair order's invoice was generated from an inspection. Edit the invoice directly to change it."
      );
    }

    // When a completed, not-yet-invoiced inspection is linked, the inspection
    // drives the invoice: its fee becomes a line item alongside any completed RO
    // services/parts. Delegate so tax rules, the PST-exempt gate, numbering, and
    // the inspection<->invoice<->RO linkage all stay consistent in one place.
    // (Only for the initial close — a re-sync with an existing invoice is handled
    // by the guard above.)
    const linkedInspection = ro.inspections.find(
      (i: any) =>
        !i.invoiceId && (i.status === 'COMPLETED' || i.status === 'FINALIZED')
    );
    if (!existingInvoice && linkedInspection) {
      if (!feeItemId) {
        throw new BadRequestException(
          'Select an inspection fee to invoice this repair order'
        );
      }
      return this.inspectionsService.generateInvoice(
        linkedInspection.id,
        { feeItemId, companyId },
        userId,
        roleName
      );
    }

    const noTax = paymentMethod === 'CASH_NO_TAX';
    const { items, subtotal, gstRate, pstRate, gstAmount, pstAmount, total } =
      this.buildRoInvoiceTotals(ro, noTax);

    // Re-sync path: reopened RO with an existing unpaid invoice. Rebuild its line
    // items and totals in place, keeping the same invoice id/number and PENDING
    // status so any external references to the invoice stay valid. The RO's
    // chosen payment method is tagged on; payment is still recorded later.
    if (existingInvoice) {
      return this.prisma.$transaction(async (tx) => {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: existingInvoice.id },
        });
        const invoice = await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            subtotal,
            taxRate: gstRate + pstRate,
            taxAmount: gstAmount + pstAmount,
            gstRate,
            gstAmount,
            pstRate,
            pstAmount,
            total,
            status: 'PENDING',
            paymentMethod: (paymentMethod as any) ?? null,
            items: { create: items as any },
          },
        });
        await tx.repairOrder.update({
          where: { id },
          data: { status: ROStatus.INVOICED, closedAt: new Date() },
        });
        return invoice;
      });
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: ro.customerId,
        vehicleId: ro.vehicleId ?? undefined,
        companyId,
        appointmentId: ro.appointmentId,
        repairOrderId: ro.id,
        subtotal,
        taxRate: gstRate + pstRate,
        taxAmount: gstAmount + pstAmount,
        gstRate,
        gstAmount,
        pstRate,
        pstAmount,
        total,
        // The RO's chosen payment method is tagged on the invoice, but it stays
        // PENDING — payment is recorded later through the invoice payment flow.
        status: 'PENDING',
        paymentMethod: (paymentMethod as any) ?? undefined,
        createdBy: 'system',
        items: {
          create: items as any,
        },
      },
    });

    await this.prisma.repairOrder.update({
      where: { id },
      data: { status: ROStatus.INVOICED, closedAt: new Date() },
    });

    return invoice;
  }

  /**
   * Reopen a closed/invoiced repair order (e.g. it was closed by accident) so its
   * services can be edited and its invoice re-synced. Only allowed while no
   * payment has been recorded against the invoice. The linked invoice is kept
   * (and later rebuilt on re-close by closeAndConvert). A completed appointment
   * is pulled back to IN_PROGRESS.
   */
  async reopen(id: string, roleName: string): Promise<any> {
    if (roleName !== 'ADMIN' && roleName !== 'SUPERVISOR') {
      throw new ForbiddenException(
        'Only admin or supervisor can reopen a repair order'
      );
    }

    const ro = await this.prisma.repairOrder.findUnique({
      where: { id },
      include: {
        invoice: { select: { id: true, status: true, amountPaid: true } },
        appointment: { select: { id: true, status: true } },
      },
    });

    if (!ro) throw new NotFoundException('Repair order not found');

    if (ro.status !== ROStatus.CLOSED && ro.status !== ROStatus.INVOICED) {
      throw new BadRequestException(
        'Only a closed repair order can be reopened'
      );
    }

    if (this.invoiceHasPayment(ro.invoice)) {
      throw new BadRequestException(
        "Cannot reopen: a payment has already been recorded on this repair order's invoice"
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.repairOrder.update({
        where: { id },
        data: { status: ROStatus.IN_PROGRESS, closedAt: null },
        include: this.roInclude,
      });

      // If the appointment had already flipped to COMPLETED, bring it back so the
      // job reads as active again. (Normally it's still IN_PROGRESS when unpaid.)
      if (ro.appointment && ro.appointment.status === 'COMPLETED') {
        await tx.appointment.updateMany({
          where: { id: ro.appointment.id, status: 'COMPLETED' },
          data: { status: 'IN_PROGRESS' },
        });
      }

      return this.applyMediaSasUrls(updated);
    });
  }

  // ---- Helpers ----

  private async assertExists(id: string): Promise<void> {
    const ro = await this.prisma.repairOrder.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!ro) throw new NotFoundException(`Repair order ${id} not found`);
  }

  private async generateInvoiceNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}`;

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let sequence = 1;
    if (lastInvoice?.invoiceNumber) {
      sequence =
        (parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10) || 0) +
        1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  private async generateRoNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `RO-${year}${month}-`;

    const latest = await this.prisma.repairOrder.findFirst({
      where: { roNumber: { startsWith: prefix } },
      orderBy: { roNumber: 'desc' },
      select: { roNumber: true },
    });

    let seq = 1;
    if (latest?.roNumber) {
      const parts = latest.roNumber.split('-');
      seq = (parseInt(parts[parts.length - 1], 10) || 0) + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  // ---- Service catalog (managed list for the "Choose a Service" dialog) ----

  async getCatalog(): Promise<any[]> {
    return this.prisma.serviceCatalogItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async createCatalogItem(dto: CreateServiceCatalogItemDto): Promise<any> {
    return this.prisma.serviceCatalogItem.create({
      data: {
        name: dto.name.trim(),
        category: dto.category?.trim() || null,
        type: dto.type ?? 'LABOR',
        labourHours: dto.labourHours ?? 1,
        unitPrice: dto.unitPrice ?? 0,
      },
    });
  }

  async updateCatalogItem(
    id: string,
    dto: UpdateServiceCatalogItemDto
  ): Promise<any> {
    const existing = await this.prisma.serviceCatalogItem.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing)
      throw new NotFoundException('Service catalog item not found');

    return this.prisma.serviceCatalogItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.category !== undefined
          ? { category: dto.category?.trim() || null }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.labourHours !== undefined
          ? { labourHours: dto.labourHours }
          : {}),
        ...(dto.unitPrice !== undefined ? { unitPrice: dto.unitPrice } : {}),
      },
    });
  }

  async removeCatalogItem(id: string): Promise<void> {
    const existing = await this.prisma.serviceCatalogItem.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing)
      throw new NotFoundException('Service catalog item not found');
    await this.prisma.serviceCatalogItem.delete({ where: { id } });
  }
}
