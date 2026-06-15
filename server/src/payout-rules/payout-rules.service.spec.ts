import { ConflictException, NotFoundException } from '@nestjs/common';
import { PayoutRulesService } from './payout-rules.service';

/**
 * Unit tests for PayoutRulesService.
 * The service is instantiated directly with a mocked PrismaService so the focus
 * is on the calculatePayout math, the conflict/not-found branches, and toDto
 * mapping (Decimal -> number).
 */
describe('PayoutRulesService', () => {
  let service: PayoutRulesService;
  let appointmentPayoutRule: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    appointmentPayoutRule = {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const prisma = { appointmentPayoutRule } as any;
    service = new PayoutRulesService(prisma);
  });

  describe('findAll', () => {
    it('maps rules to DTOs with numeric amounts', async () => {
      appointmentPayoutRule.findMany.mockResolvedValue([
        {
          id: 'r1',
          triggerAmount: { toString: () => '100' } as any,
          payoutAmount: { toString: () => '30' } as any,
          description: 'desc',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ]);

      const result = await service.findAll();
      expect(result).toEqual([
        {
          id: 'r1',
          triggerAmount: 100,
          payoutAmount: 30,
          description: 'desc',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('returns DTO when found', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue({
        id: 'r1',
        triggerAmount: 100,
        payoutAmount: 30,
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });
      const result = await service.findOne('r1');
      expect(result.id).toBe('r1');
      expect(result.description).toBeUndefined();
    });
  });

  describe('create', () => {
    it('throws ConflictException when a rule for the trigger amount exists', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ triggerAmount: 100, payoutAmount: 30 } as any)
      ).rejects.toBeInstanceOf(ConflictException);
      expect(appointmentPayoutRule.create).not.toHaveBeenCalled();
    });

    it('creates with isActive defaulting to true', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue(null);
      appointmentPayoutRule.create.mockResolvedValue({
        id: 'r1',
        triggerAmount: 100,
        payoutAmount: 30,
        description: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create({ triggerAmount: 100, payoutAmount: 30 } as any);

      const arg = appointmentPayoutRule.create.mock.calls[0][0];
      expect(arg.data.isActive).toBe(true);
    });

    it('respects an explicit isActive=false', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue(null);
      appointmentPayoutRule.create.mockResolvedValue({
        id: 'r1',
        triggerAmount: 100,
        payoutAmount: 30,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create({
        triggerAmount: 100,
        payoutAmount: 30,
        isActive: false,
      } as any);
      const arg = appointmentPayoutRule.create.mock.calls[0][0];
      expect(arg.data.isActive).toBe(false);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when rule missing', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue(null);
      await expect(
        service.update('x', { payoutAmount: 50 } as any)
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException when changing triggerAmount collides', async () => {
      appointmentPayoutRule.findUnique
        .mockResolvedValueOnce({ id: 'r1', triggerAmount: 100 }) // existing
        .mockResolvedValueOnce({ id: 'other', triggerAmount: 200 }); // collision
      await expect(
        service.update('r1', { triggerAmount: 200 } as any)
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('updates when triggerAmount is unchanged (no collision check)', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValueOnce({
        id: 'r1',
        triggerAmount: 100,
      });
      appointmentPayoutRule.update.mockResolvedValue({
        id: 'r1',
        triggerAmount: 100,
        payoutAmount: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('r1', {
        triggerAmount: 100,
        payoutAmount: 40,
      } as any);
      // findUnique only called once (no collision lookup since amount unchanged)
      expect(appointmentPayoutRule.findUnique).toHaveBeenCalledTimes(1);
      expect(result.payoutAmount).toBe(40);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when missing', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue(null);
      await expect(service.remove('x')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('deletes when present', async () => {
      appointmentPayoutRule.findUnique.mockResolvedValue({ id: 'r1' });
      appointmentPayoutRule.delete.mockResolvedValue({});
      await service.remove('r1');
      expect(appointmentPayoutRule.delete).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
    });
  });

  describe('calculatePayout', () => {
    it('returns 0 for non-positive amounts', async () => {
      expect(await service.calculatePayout(0)).toBe(0);
      expect(await service.calculatePayout(-5)).toBe(0);
      expect(appointmentPayoutRule.findFirst).not.toHaveBeenCalled();
    });

    it('returns the matching active rule payout amount', async () => {
      appointmentPayoutRule.findFirst.mockResolvedValue({
        payoutAmount: { toString: () => '45' },
      });
      expect(await service.calculatePayout(150)).toBe(45);
    });

    it('falls back to 30% rounded to 2 decimals when no rule matches', async () => {
      appointmentPayoutRule.findFirst.mockResolvedValue(null);
      // 99 * 0.30 = 29.7
      expect(await service.calculatePayout(99)).toBe(29.7);
      // 10.99 * 0.30 = 3.297 -> 3.3
      expect(await service.calculatePayout(10.99)).toBe(3.3);
    });
  });
});
