import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExpenseReportFilterDto, ExpenseReportResponseDto } from '../common/dto/expense-report.dto';
import { TaxReportFilterDto, TaxReportResponseDto, GstPaidReportResponseDto } from '../common/dto/tax-report.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('expenses')
  @Roles('ADMIN', 'ACCOUNTANT')
  async getExpenseReport(
    @Query(ValidationPipe) filterDto: ExpenseReportFilterDto,
  ): Promise<ExpenseReportResponseDto> {
    return this.reportsService.getExpenseReport(filterDto);
  }

  @Get('analytics')
  @Roles('ADMIN', 'ACCOUNTANT', 'SUPERVISOR', 'STAFF')
  async getAnalytics() {
    return this.reportsService.getAnalytics();
  }

  @Get('purchase-report')
  @Roles('ADMIN', 'ACCOUNTANT')
  async getPurchaseReport(
    @Query(ValidationPipe) filterDto: ExpenseReportFilterDto,
  ): Promise<ExpenseReportResponseDto> {
    // Reuse the expense report service (it includes both purchase and expense invoices)
    return this.reportsService.getExpenseReport(filterDto);
  }

  @Get('tax-report')
  @Roles('ADMIN', 'ACCOUNTANT')
  async getTaxReport(
    @Query(ValidationPipe) filterDto: TaxReportFilterDto,
  ): Promise<TaxReportResponseDto> {
    return this.reportsService.getTaxReport(filterDto);
  }

  @Get('gst-paid-report')
  @Roles('ADMIN', 'ACCOUNTANT')
  async getGstPaidReport(
    @Query(ValidationPipe) filterDto: TaxReportFilterDto,
  ): Promise<GstPaidReportResponseDto> {
    return this.reportsService.getGstPaidReport(filterDto);
  }
}
