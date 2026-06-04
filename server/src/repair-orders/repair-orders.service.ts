import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { ROStatus } from '@prisma/client';
import {
  CreateRepairOrderDto,
  UpdateRepairOrderDto,
  CreateROServiceDto,
  UpdateROServiceDto,
  ROQueryDto,
  UpdateROMediaDto,
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
        createdAt: true,
        completedAt: true,
      },
    },
    media: { orderBy: { sortOrder: 'asc' as const } },
    invoice: {
      select: { id: true, invoiceNumber: true, status: true, total: true },
    },
  };

  constructor(private prisma: PrismaService) {}

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

    return this.prisma.repairOrder.create({
      data,
      include: this.roInclude,
    });
  }

  async findAll(query: ROQueryDto, roleName: string, userId: string): Promise<any[]> {
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
        { customer: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: query.search, mode: 'insensitive' } } },
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

    return ro;
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
        services: { select: { id: true, description: true, status: true, total: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true, total: true } },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateRepairOrderDto, roleName: string): Promise<any> {
    await this.assertExists(id);

    const data: any = { ...dto };
    if (dto.status === ROStatus.CLOSED || dto.status === ROStatus.INVOICED) {
      if (roleName !== 'ADMIN' && roleName !== 'SUPERVISOR') {
        throw new ForbiddenException('Only admin or supervisor can close a repair order');
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

  async updateService(roId: string, serviceId: string, dto: UpdateROServiceDto, userId: string): Promise<any> {
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
    roServiceId?: string,
  ): Promise<any> {
    await this.assertExists(roId);

    // Determine last sort order
    const lastMedia = await this.prisma.rOMedia.findFirst({
      where: { repairOrderId: roId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const sortOrder = (lastMedia?.sortOrder ?? -1) + 1;

    return this.prisma.rOMedia.create({
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
  }

  async updateMedia(roId: string, mediaId: string, dto: UpdateROMediaDto): Promise<any> {
    const media = await this.prisma.rOMedia.findFirst({
      where: { id: mediaId, repairOrderId: roId },
    });
    if (!media) throw new NotFoundException('Media not found');
    return this.prisma.rOMedia.update({ where: { id: mediaId }, data: dto });
  }

  async removeMedia(roId: string, mediaId: string, azureBlobService: any): Promise<void> {
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

  async closeAndConvert(id: string, companyId: string, roleName: string): Promise<any> {
    if (roleName !== 'ADMIN' && roleName !== 'SUPERVISOR') {
      throw new ForbiddenException('Only admin or supervisor can close a repair order');
    }

    const ro = await this.prisma.repairOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        services: { where: { status: 'COMPLETED' } },
        invoice: true,
      },
    });

    if (!ro) throw new NotFoundException('Repair order not found');
    if (ro.invoice) throw new BadRequestException('Invoice already exists for this repair order');

    const completedServices = ro.services;
    const subtotal = completedServices.reduce((sum: number, s: any) => sum + Number(s.total), 0);
    const gstRate = 0.05;
    const pstRate = 0.07;
    const gstAmount = subtotal * gstRate;
    const pstAmount = subtotal * pstRate;
    const total = subtotal + gstAmount + pstAmount;

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
        status: 'DRAFT',
        createdBy: 'system',
        items: {
          create: completedServices.map((s: any) => ({
            description: s.description,
            itemType: s.type === 'PART' ? 'PART' : 'SERVICE',
            quantity: Number(s.quantity),
            unitPrice: Number(s.unitPrice),
            total: Number(s.total),
          })),
        },
      },
    });

    await this.prisma.repairOrder.update({
      where: { id },
      data: { status: ROStatus.INVOICED, closedAt: new Date() },
    });

    return invoice;
  }

  // ---- Helpers ----

  private async assertExists(id: string): Promise<void> {
    const ro = await this.prisma.repairOrder.findUnique({ where: { id }, select: { id: true } });
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
      sequence = (parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10) || 0) + 1;
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
}
