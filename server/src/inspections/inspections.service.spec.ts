import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  InspectionItemKind,
  InspectionItemStatus,
  InspectionOverallStatus,
  InspectionStatus,
} from '@prisma/client';
import { InspectionsService } from './inspections.service';

/**
 * Unit tests for InspectionsService.
 *
 * Direct instantiation with mocked PrismaService + AuditRepository (no Nest DI).
 * Focus on access-control branches, create/complete validation, overall-status
 * calculation, and the admin-only delete path.
 *
 * Skipped: ensureDefaultTemplates / syncTemplateItemOptions seeding internals
 * (template seed I/O) are exercised indirectly — they're stubbed to no-op by
 * making inspectionTemplate.findUnique return an existing template so the
 * create branch is skipped, and inspectionItem.updateMany resolves.
 */
describe('InspectionsService', () => {
  let service: InspectionsService;
  let prisma: any;
  let audit: any;

  beforeEach(() => {
    prisma = {
      inspectionTemplate: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'seeded' }), // existing -> seeding no-op
        create: jest.fn(),
      },
      inspectionItem: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      inspection: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      inspectionItemResult: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      customer: { findUnique: jest.fn() },
      vehicle: { findUnique: jest.fn() },
    };
    audit = { create: jest.fn().mockResolvedValue({}) };
    service = new InspectionsService(prisma as any, audit as any);
  });

  describe('access control', () => {
    it('findAll forbids non-staff roles', async () => {
      await expect(service.findAll('CUSTOMER')).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });

    it('findAll allows STAFF and queries inspections', async () => {
      prisma.inspection.findMany.mockResolvedValue([{ id: 'i-1' }]);
      const result = await service.findAll('STAFF');
      expect(result).toHaveLength(1);
      expect(prisma.inspection.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFound when inspection missing', async () => {
      prisma.inspection.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x', 'ADMIN')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns the inspection when found', async () => {
      prisma.inspection.findUnique.mockResolvedValue({ id: 'i-1' });
      const result = await service.findOne('i-1', 'ADMIN');
      expect(result).toEqual({ id: 'i-1' });
    });
  });

  describe('create', () => {
    const dto = { templateId: 't-1', customerId: 'c-1' } as any;

    it('forbids non-staff', async () => {
      await expect(
        service.create(dto, 'u-1', 'CUSTOMER')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFound when template missing', async () => {
      prisma.inspectionTemplate.findUnique.mockImplementation((args: any) =>
        args?.where?.id === 't-1'
          ? Promise.resolve(null)
          : Promise.resolve({ id: 'seeded' })
      );
      prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
      await expect(service.create(dto, 'u-1', 'STAFF')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws NotFound when customer missing', async () => {
      prisma.inspectionTemplate.findUnique.mockImplementation((args: any) =>
        args?.where?.id === 't-1'
          ? Promise.resolve({ id: 't-1', sections: [] })
          : Promise.resolve({ id: 'seeded' })
      );
      prisma.customer.findUnique.mockResolvedValue(null);
      await expect(service.create(dto, 'u-1', 'STAFF')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws BadRequest when vehicle belongs to another customer', async () => {
      prisma.inspectionTemplate.findUnique.mockImplementation((args: any) =>
        args?.where?.id === 't-1'
          ? Promise.resolve({ id: 't-1', sections: [] })
          : Promise.resolve({ id: 'seeded' })
      );
      prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
      prisma.vehicle.findUnique.mockResolvedValue({
        id: 'v-1',
        customerId: 'OTHER',
      });
      await expect(
        service.create({ ...dto, vehicleId: 'v-1' }, 'u-1', 'STAFF')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates result rows from template items/positions and returns findOne', async () => {
      prisma.inspectionTemplate.findUnique.mockImplementation((args: any) =>
        args?.where?.id === 't-1'
          ? Promise.resolve({
              id: 't-1',
              sections: [
                {
                  items: [
                    {
                      id: 'item-1',
                      sortOrder: 1,
                      options: { positions: ['LF', 'RF'] },
                    },
                    { id: 'item-2', sortOrder: 2, options: null },
                  ],
                },
              ],
            })
          : Promise.resolve({ id: 'seeded' })
      );
      prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
      prisma.inspection.create.mockResolvedValue({ id: 'new-insp' });
      prisma.inspection.findUnique.mockResolvedValue({
        id: 'new-insp',
        loaded: true,
      });

      const result = await service.create(dto, 'u-1', 'STAFF');

      const createArgs = prisma.inspection.create.mock.calls[0][0];
      const rows = createArgs.data.results.createMany.data;
      // item-1 produces 2 rows (LF/RF), item-2 produces 1 GENERAL row
      expect(rows).toHaveLength(3);
      expect(rows).toEqual(
        expect.arrayContaining([
          { itemId: 'item-1', position: 'LF', sortOrder: 10 },
          { itemId: 'item-1', position: 'RF', sortOrder: 11 },
          { itemId: 'item-2', position: 'GENERAL', sortOrder: 20 },
        ])
      );
      expect(createArgs.data.status).toBe(InspectionStatus.IN_PROGRESS);
      expect(result).toEqual({ id: 'new-insp', loaded: true });
    });
  });

  describe('updateResult', () => {
    it('throws NotFound when result not found', async () => {
      prisma.inspectionItemResult.findFirst.mockResolvedValue(null);
      await expect(
        service.updateResult('i-1', 'r-1', { status: 'GOOD' } as any, 'STAFF')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates only the provided fields', async () => {
      prisma.inspectionItemResult.findFirst.mockResolvedValue({ id: 'r-1' });
      prisma.inspectionItemResult.update.mockResolvedValue({});
      prisma.inspection.findUnique.mockResolvedValue({ id: 'i-1' });

      await service.updateResult(
        'i-1',
        'r-1',
        { status: 'POOR', notes: 'worn' } as any,
        'STAFF'
      );

      expect(prisma.inspectionItemResult.update).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        data: { status: 'POOR', notes: 'worn' },
      });
    });
  });

  describe('complete', () => {
    it('throws NotFound when inspection missing', async () => {
      prisma.inspection.findUnique.mockResolvedValue(null);
      await expect(
        service.complete('x', 'u-1', 'STAFF')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequest when a required item is incomplete', async () => {
      prisma.inspection.findUnique.mockResolvedValue({
        id: 'i-1',
        results: [{ itemId: 'item-1', status: null, value: null }],
        template: {
          sections: [
            {
              items: [
                {
                  id: 'item-1',
                  label: 'Brake pads',
                  isRequired: true,
                  kind: InspectionItemKind.CONDITION,
                },
              ],
            },
          ],
        },
      });
      await expect(
        service.complete('i-1', 'u-1', 'STAFF')
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('completes and sets NEEDS_REPAIR when any result is POOR', async () => {
      prisma.inspection.findUnique.mockResolvedValue({
        id: 'i-1',
        results: [
          { itemId: 'item-1', status: InspectionItemStatus.POOR, value: null },
          { itemId: 'item-1', status: InspectionItemStatus.GOOD, value: null },
        ],
        template: {
          sections: [
            {
              items: [
                {
                  id: 'item-1',
                  label: 'Brake pads',
                  isRequired: true,
                  kind: InspectionItemKind.CONDITION,
                },
              ],
            },
          ],
        },
      });
      prisma.inspection.update.mockResolvedValue({});

      // findOne (returned at the end) re-fetches; provide a value for that call too.
      // The same mock returns the completed inspection each time which is fine here.
      await service.complete('i-1', 'u-1', 'STAFF');

      const updateArgs = prisma.inspection.update.mock.calls[0][0];
      expect(updateArgs.data.status).toBe(InspectionStatus.COMPLETED);
      expect(updateArgs.data.overallStatus).toBe(
        InspectionOverallStatus.NEEDS_REPAIR
      );
      expect(updateArgs.data.finalizedById).toBe('u-1');
      expect(updateArgs.data.completedAt).toBeInstanceOf(Date);
    });

    it('sets ATTENTION_SOON when FAIR but no POOR, and GOOD otherwise', async () => {
      const makeInspection = (status: InspectionItemStatus) => ({
        id: 'i-1',
        results: [{ itemId: 'item-1', status, value: null }],
        template: {
          sections: [
            {
              items: [
                {
                  id: 'item-1',
                  label: 'X',
                  isRequired: false,
                  kind: InspectionItemKind.CONDITION,
                },
              ],
            },
          ],
        },
      });
      prisma.inspection.update.mockResolvedValue({});

      prisma.inspection.findUnique.mockResolvedValue(
        makeInspection(InspectionItemStatus.FAIR)
      );
      await service.complete('i-1', 'u-1', 'STAFF');
      expect(prisma.inspection.update.mock.calls[0][0].data.overallStatus).toBe(
        InspectionOverallStatus.ATTENTION_SOON
      );

      prisma.inspection.update.mockClear();
      prisma.inspection.findUnique.mockResolvedValue(
        makeInspection(InspectionItemStatus.GOOD)
      );
      await service.complete('i-1', 'u-1', 'STAFF');
      expect(prisma.inspection.update.mock.calls[0][0].data.overallStatus).toBe(
        InspectionOverallStatus.GOOD
      );
    });
  });

  describe('remove', () => {
    it('forbids non-admin roles', async () => {
      await expect(
        service.remove('i-1', 'u-1', 'STAFF')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFound when inspection missing', async () => {
      prisma.inspection.findUnique.mockResolvedValue(null);
      await expect(service.remove('x', 'u-1', 'ADMIN')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('deletes and writes an audit record for admins', async () => {
      prisma.inspection.findUnique.mockResolvedValue({ id: 'i-1' });
      prisma.inspection.delete.mockResolvedValue({});
      await service.remove('i-1', 'u-1', 'ADMIN');
      expect(prisma.inspection.delete).toHaveBeenCalledWith({
        where: { id: 'i-1' },
      });
      expect(audit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u-1',
          action: 'DELETE_INSPECTION',
          entityType: 'inspection',
          entityId: 'i-1',
        })
      );
    });
  });

  describe('findTemplates', () => {
    it('returns active templates and applies a type filter', async () => {
      prisma.inspectionTemplate.findMany.mockResolvedValue([{ id: 't-1' }]);
      const result = await service.findTemplates('PEACE_OF_MIND' as any);
      const args = prisma.inspectionTemplate.findMany.mock.calls[0][0];
      expect(args.where.isActive).toBe(true);
      expect(args.where.type).toBe('PEACE_OF_MIND');
      expect(result).toHaveLength(1);
    });
  });
});
