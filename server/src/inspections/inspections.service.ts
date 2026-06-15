import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InspectionItemKind,
  InspectionItemStatus,
  InspectionOverallStatus,
  InspectionStatus,
  InspectionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';
import {
  CreateInspectionDto,
  UpdateInspectionDto,
  UpdateInspectionResultDto,
} from '@gt-automotive/data';
import { defaultInspectionTemplates, InspectionTemplateSeed } from './peace-of-mind-template';
import { AuditRepository } from '../audit/repositories/audit.repository';

const INSPECTION_INCLUDE = {
  template: {
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: {
          items: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  },
  customer: true,
  vehicle: true,
  appointment: true,
  invoice: true,
  results: {
    orderBy: [{ sortOrder: 'asc' }, { position: 'asc' }],
    include: { media: true },
  },
  media: true,
} satisfies Prisma.InspectionInclude;

@Injectable()
export class InspectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditRepository: AuditRepository,
  ) {}

  async findTemplates(type?: InspectionType) {
    await this.ensureDefaultTemplates();

    return this.prisma.inspectionTemplate.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
  }

  async findAll(userRole: string) {
    this.assertStaffAccess(userRole);

    return this.prisma.inspection.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
        customer: true,
        vehicle: true,
        _count: { select: { results: true, media: true } },
      },
    });
  }

  async findOne(id: string, userRole: string) {
    this.assertStaffAccess(userRole);
    await this.ensureDefaultTemplates();

    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: INSPECTION_INCLUDE,
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return inspection;
  }

  async create(dto: CreateInspectionDto, userId: string, userRole: string) {
    this.assertStaffAccess(userRole);
    await this.ensureDefaultTemplates();

    const [template, customer, vehicle] = await Promise.all([
      this.prisma.inspectionTemplate.findUnique({
        where: { id: dto.templateId },
        include: {
          sections: {
            orderBy: { sortOrder: 'asc' },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      }),
      this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
      dto.vehicleId ? this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } }) : Promise.resolve(null),
    ]);

    if (!template) {
      throw new NotFoundException('Inspection template not found');
    }

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (dto.vehicleId && !vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle && vehicle.customerId !== dto.customerId) {
      throw new BadRequestException('Selected vehicle does not belong to this customer');
    }

    const resultRows = template.sections.flatMap((section) =>
      section.items.flatMap((item) => {
        const options = item.options as { positions?: string[] } | null;
        const positions = options?.positions?.length ? options.positions : ['GENERAL'];

        return positions.map((position, index) => ({
          itemId: item.id,
          position,
          sortOrder: item.sortOrder * 10 + index,
        }));
      })
    );

    const inspection = await this.prisma.inspection.create({
      data: {
        templateId: dto.templateId,
        customerId: dto.customerId,
        vehicleId: dto.vehicleId,
        appointmentId: dto.appointmentId,
        invoiceId: dto.invoiceId,
        repairOrderId: dto.repairOrderId,
        roNumber: dto.roNumber,
        mileage: dto.mileage,
        status: InspectionStatus.IN_PROGRESS,
        createdById: userId,
        results: {
          createMany: {
            data: resultRows,
          },
        },
      },
    });

    return this.findOne(inspection.id, userRole);
  }

  async update(id: string, dto: UpdateInspectionDto, userRole: string) {
    this.assertStaffAccess(userRole);
    await this.ensureInspection(id);

    await this.prisma.inspection.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.overallStatus !== undefined && { overallStatus: dto.overallStatus }),
        ...(dto.mileage !== undefined && { mileage: dto.mileage }),
        ...(dto.technicianNotes !== undefined && { technicianNotes: dto.technicianNotes }),
        ...(dto.customerNotes !== undefined && { customerNotes: dto.customerNotes }),
      },
    });

    return this.findOne(id, userRole);
  }

  async updateResult(
    inspectionId: string,
    resultId: string,
    dto: UpdateInspectionResultDto,
    userRole: string
  ) {
    this.assertStaffAccess(userRole);

    const result = await this.prisma.inspectionItemResult.findFirst({
      where: { id: resultId, inspectionId },
    });

    if (!result) {
      throw new NotFoundException('Inspection result not found');
    }

    await this.prisma.inspectionItemResult.update({
      where: { id: resultId },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.selectedOptions !== undefined && { selectedOptions: dto.selectedOptions }),
      },
    });

    return this.findOne(inspectionId, userRole);
  }

  async complete(id: string, userId: string, userRole: string) {
    this.assertStaffAccess(userRole);

    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: INSPECTION_INCLUDE,
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    const resultsByItemId = new Map<string, typeof inspection.results>();
    for (const result of inspection.results) {
      const existing = resultsByItemId.get(result.itemId) || [];
      existing.push(result);
      resultsByItemId.set(result.itemId, existing);
    }

    const missingRequired = inspection.template.sections.flatMap((section) =>
      section.items.filter((item) => {
        if (!item.isRequired) {
          return false;
        }

        const results = resultsByItemId.get(item.id) || [];
        return results.some((result) => {
          if (item.kind === InspectionItemKind.MEASUREMENT) {
            return !result.value && !result.status;
          }
          return !result.status;
        });
      })
    );

    if (missingRequired.length > 0) {
      throw new BadRequestException(`Complete required inspection items before finishing: ${missingRequired[0].label}`);
    }

    const overallStatus = this.calculateOverallStatus(
      inspection.results.map((result) => result.status)
    );

    await this.prisma.inspection.update({
      where: { id },
      data: {
        status: InspectionStatus.COMPLETED,
        overallStatus,
        completedAt: new Date(),
        finalizedById: userId,
      },
    });

    return this.findOne(id, userRole);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete inspections');
    }

    const inspection = await this.ensureInspection(id);

    // Results and media cascade on delete via the schema relations.
    await this.prisma.inspection.delete({ where: { id } });

    await this.auditRepository.create({
      userId,
      action: 'DELETE_INSPECTION',
      entityType: 'inspection',
      entityId: id,
      oldValue: inspection as any,
    });
  }

  private async ensureInspection(id: string) {
    const inspection = await this.prisma.inspection.findUnique({ where: { id } });
    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }
    return inspection;
  }

  private calculateOverallStatus(statuses: Array<InspectionItemStatus | null>) {
    if (statuses.includes(InspectionItemStatus.POOR)) {
      return InspectionOverallStatus.NEEDS_REPAIR;
    }
    if (statuses.includes(InspectionItemStatus.FAIR)) {
      return InspectionOverallStatus.ATTENTION_SOON;
    }
    return InspectionOverallStatus.GOOD;
  }

  private assertStaffAccess(userRole: string) {
    if (!['ADMIN', 'SUPERVISOR', 'STAFF'].includes(userRole)) {
      throw new ForbiddenException('Inspection access is limited to staff users in this first draft');
    }
  }

  private async ensureDefaultTemplates() {
    for (const template of defaultInspectionTemplates) {
      const existing = await this.prisma.inspectionTemplate.findUnique({
        where: { slug: template.slug },
      });

      if (existing) {
        await this.syncTemplateItemOptions(template);
        continue;
      }

      await this.prisma.inspectionTemplate.create({
        data: {
          name: template.name,
          slug: template.slug,
          type: template.type,
          description: template.description,
          sections: {
            create: template.sections.map((section, sectionIndex) => ({
              title: section.title,
              sortOrder: sectionIndex + 1,
              items: {
                create: section.items.map((item, itemIndex) => ({
                  label: item.label,
                  kind: item.kind,
                  isRequired: Boolean(item.isRequired),
                  sortOrder: itemIndex + 1,
                  positionGroup: item.positionGroup,
                  unit: item.unit,
                  options: item.options,
                })),
              },
            })),
          },
        },
      });
    }
  }

  private async syncTemplateItemOptions(template: InspectionTemplateSeed) {
    const items = template.sections.flatMap((section) => section.items);

    await Promise.all(
      items.map((item) =>
        this.prisma.inspectionItem.updateMany({
          where: {
            label: item.label,
            section: {
              template: {
                slug: template.slug,
              },
            },
          },
          data: {
            options: item.options ?? Prisma.DbNull,
          },
        })
      )
    );
  }
}
