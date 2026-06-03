import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { CreatePayoutRuleDto, PayoutRuleResponseDto, UpdatePayoutRuleDto } from '@gt-automotive/data';

const DEFAULT_PERCENTAGE = 0.30;

@Injectable()
export class PayoutRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PayoutRuleResponseDto[]> {
    const rules = await this.prisma.appointmentPayoutRule.findMany({
      orderBy: { triggerAmount: 'asc' },
    });
    return rules.map(this.toDto);
  }

  async findOne(id: string): Promise<PayoutRuleResponseDto> {
    const rule = await this.prisma.appointmentPayoutRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Payout rule not found');
    return this.toDto(rule);
  }

  async create(dto: CreatePayoutRuleDto): Promise<PayoutRuleResponseDto> {
    const existing = await this.prisma.appointmentPayoutRule.findUnique({
      where: { triggerAmount: dto.triggerAmount },
    });
    if (existing) {
      throw new ConflictException(`A rule for trigger amount ${dto.triggerAmount} already exists`);
    }
    const rule = await this.prisma.appointmentPayoutRule.create({
      data: {
        triggerAmount: dto.triggerAmount,
        payoutAmount: dto.payoutAmount,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
    return this.toDto(rule);
  }

  async update(id: string, dto: UpdatePayoutRuleDto): Promise<PayoutRuleResponseDto> {
    const existing = await this.prisma.appointmentPayoutRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Payout rule not found');

    if (dto.triggerAmount !== undefined && Number(dto.triggerAmount) !== Number(existing.triggerAmount)) {
      const collision = await this.prisma.appointmentPayoutRule.findUnique({
        where: { triggerAmount: dto.triggerAmount },
      });
      if (collision) {
        throw new ConflictException(`A rule for trigger amount ${dto.triggerAmount} already exists`);
      }
    }

    const rule = await this.prisma.appointmentPayoutRule.update({
      where: { id },
      data: {
        triggerAmount: dto.triggerAmount,
        payoutAmount: dto.payoutAmount,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
    return this.toDto(rule);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.appointmentPayoutRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Payout rule not found');
    await this.prisma.appointmentPayoutRule.delete({ where: { id } });
  }

  /**
   * Compute the total payout pool for a given appointment payment amount.
   * Looks up an exact active rule first, otherwise falls back to 30%.
   */
  async calculatePayout(amount: number): Promise<number> {
    if (!amount || amount <= 0) return 0;
    const rule = await this.prisma.appointmentPayoutRule.findFirst({
      where: { triggerAmount: amount, isActive: true },
    });
    if (rule) return Number(rule.payoutAmount);
    return Math.round(amount * DEFAULT_PERCENTAGE * 100) / 100;
  }

  private toDto(rule: any): PayoutRuleResponseDto {
    return {
      id: rule.id,
      triggerAmount: Number(rule.triggerAmount),
      payoutAmount: Number(rule.payoutAmount),
      description: rule.description ?? undefined,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
