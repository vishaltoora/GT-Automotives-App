import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findDefault() {
    return this.prisma.company.findFirst({
      where: { isDefault: true },
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * Update the terms & conditions printed at the foot of this company's
   * invoices. Kept editable from admin settings because the wording is a
   * liability statement owned by the business, not by the code.
   */
  async updateTermsAndConditions(
    id: string,
    termsAndConditions: string | null
  ) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const trimmed = termsAndConditions?.trim();
    return this.prisma.company.update({
      where: { id },
      // Blank input clears the block entirely rather than printing an empty box.
      data: { termsAndConditions: trimmed ? trimmed : null },
    });
  }

  /**
   * Update the shop-hours window the employee time clock honours.
   *
   * Rejects a closing time at or before the opening time: that would describe a
   * window spanning midnight, which nothing here supports and which would leave
   * the clock shut all day.
   */
  async updateTimeClockHours(
    id: string,
    hours: {
      timeClockWindowEnabled?: boolean;
      timeClockOpensAt?: string;
      timeClockClosesAt?: string;
    }
  ) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const opensAt = hours.timeClockOpensAt ?? company.timeClockOpensAt;
    const closesAt = hours.timeClockClosesAt ?? company.timeClockClosesAt;

    if (closesAt <= opensAt) {
      throw new BadRequestException('The time clock must close after it opens');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        timeClockWindowEnabled: hours.timeClockWindowEnabled,
        timeClockOpensAt: hours.timeClockOpensAt,
        timeClockClosesAt: hours.timeClockClosesAt,
      },
    });
  }
}
