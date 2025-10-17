import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExpenseReportFilterDto, ExpenseReportResponseDto } from '../common/dto/expense-report.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('expenses')
  @Roles('ADMIN')
  async getExpenseReport(
    @Query(ValidationPipe) filterDto: ExpenseReportFilterDto,
  ): Promise<ExpenseReportResponseDto> {
    return this.reportsService.getExpenseReport(filterDto);
  }

  @Get('analytics')
  @Roles('ADMIN', 'STAFF')
  async getAnalytics() {
    return this.reportsService.getAnalytics();
  }
}
