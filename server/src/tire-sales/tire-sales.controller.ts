import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TireSalesService } from './tire-sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateTireSaleDto,
  TireSaleResponseDto,
  TireSaleFiltersDto,
  CommissionReportDto,
  CommissionFiltersDto,
} from '../common/dto/tire-sale.dto';

@Controller('tire-sales')
@UseGuards(JwtAuthGuard, RoleGuard)
export class TireSalesController {
  constructor(private readonly tireSalesService: TireSalesService) {}

  /**
   * Create a new tire sale
   * POST /api/tire-sales
   */
  @Post()
  @Roles('STAFF', 'SUPERVISOR', 'ADMIN')
  async create(
    @Body() createDto: CreateTireSaleDto,
    @Request() req: any,
  ): Promise<TireSaleResponseDto> {
    const userId = req.user?.id;
    return this.tireSalesService.create(createDto, userId);
  }

  /**
   * Get all tire sales (with filters)
   * GET /api/tire-sales
   */
  @Get()
  @Roles('SUPERVISOR', 'ADMIN', 'ACCOUNTANT')
  async findAll(@Query() filters: TireSaleFiltersDto): Promise<{
    items: TireSaleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.tireSalesService.findAll(filters);
  }

  /**
   * Get my tire sales (staff view)
   * GET /api/tire-sales/my-sales
   */
  @Get('my-sales')
  @Roles('STAFF', 'SUPERVISOR', 'ADMIN')
  async findMySales(
    @Request() req: any,
    @Query() filters: TireSaleFiltersDto,
  ): Promise<{
    items: TireSaleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const userId = req.user?.id;
    return this.tireSalesService.findMySales(userId, filters);
  }

  /**
   * Get my monthly stats (for commission progress)
   * GET /api/tire-sales/my-stats
   */
  @Get('my-stats')
  @Roles('STAFF', 'SUPERVISOR', 'ADMIN')
  async getMyStats(
    @Request() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<{
    totalTiresSold: number;
    currentRate: number;
    nextThreshold: number | null;
    tiresToNextThreshold: number | null;
  }> {
    const userId = req.user?.id;
    return this.tireSalesService.getMonthlyStats(
      userId,
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }

  /**
   * Get commission report
   * GET /api/tire-sales/reports/commissions
   */
  @Get('reports/commissions')
  @Roles('ADMIN', 'ACCOUNTANT')
  async getCommissionReport(
    @Query() filters: CommissionFiltersDto,
  ): Promise<CommissionReportDto> {
    return this.tireSalesService.getCommissionReport(filters);
  }

  /**
   * Get single tire sale
   * GET /api/tire-sales/:id
   */
  @Get(':id')
  @Roles('STAFF', 'SUPERVISOR', 'ADMIN', 'ACCOUNTANT')
  async findOne(@Param('id') id: string): Promise<TireSaleResponseDto> {
    return this.tireSalesService.findOne(id);
  }

  /**
   * Approve commission for payment
   * POST /api/tire-sales/:id/approve-commission
   */
  @Post(':id/approve-commission')
  @Roles('ADMIN')
  async approveCommission(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<TireSaleResponseDto> {
    const userId = req.user?.id;
    return this.tireSalesService.approveCommission(id, userId);
  }

  /**
   * Process all pending commissions for an employee (creates ONE job)
   * POST /api/tire-sales/process-commissions/:employeeId
   */
  @Post('process-commissions/:employeeId')
  @Roles('ADMIN')
  async processEmployeeCommissions(
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Request() req?: any,
  ): Promise<{ jobId: string; totalAmount: number; salesCount: number }> {
    const adminUserId = req.user?.id;
    return this.tireSalesService.processEmployeeCommissions(
      employeeId,
      adminUserId,
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }
}
