import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '@gt-automotive/database';
import { CarfaxService } from './carfax.service';

@Controller('carfax')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN', 'FOREMAN')
export class CarfaxController {
  constructor(
    private readonly carfaxService: CarfaxService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * CARFAX sync history (admin only).
   */
  @Get('history')
  async getHistory(
    @Query('status') status?: string,
    @Query('limit') limit = '50'
  ) {
    return this.prisma.carfaxSync.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
      },
      include: {
        invoice: {
          select: { invoiceNumber: true, total: true, invoiceDate: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit, 10),
    });
  }

  /**
   * Aggregate sync statistics (admin only).
   */
  @Get('statistics')
  async getStatistics() {
    const byStatus = await this.prisma.carfaxSync.groupBy({
      by: ['status'],
      _count: true,
    });

    const total = await this.prisma.carfaxSync.count();

    return { total, byStatus };
  }

  /**
   * Manually re-send a single invoice to CARFAX (admin only).
   */
  @Post('resync/:invoiceId')
  async resync(@Param('invoiceId') invoiceId: string) {
    await this.carfaxService.reportInvoice(invoiceId, true);
    const sync = await this.prisma.carfaxSync.findUnique({
      where: { invoiceId },
    });
    return { success: sync?.status === 'SENT', sync };
  }

  /**
   * Retry all FAILED records (admin only).
   */
  @Post('retry-failed')
  async retryFailed() {
    const attempted = await this.carfaxService.retryFailed();
    return { attempted };
  }
}
