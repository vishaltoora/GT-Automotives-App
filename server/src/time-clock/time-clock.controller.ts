import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ClockInDto,
  ClockOutDto,
  CreatePayrollAdjustmentDto,
  CreateTimeEntryDto,
  ProcessPayrollDto,
  StartBreakDto,
  TimeEntryStatus,
  UpdateTimeEntryDto,
  UpsertEmployeeCompensationDto,
} from '@gt-automotive/data';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { TimeClockService } from './time-clock.service';

@Controller('time-clock')
@UseGuards(RoleGuard)
export class TimeClockController {
  constructor(private readonly timeClockService: TimeClockService) {}

  @Post('clock-in')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  clockIn(@Body() dto: ClockInDto, @CurrentUser() user: any) {
    return this.timeClockService.clockIn(user.id, dto);
  }

  @Post('employees/:employeeId/clock-in')
  @Roles('ADMIN')
  adminClockIn(
    @Param('employeeId') employeeId: string,
    @Body() dto: ClockInDto
  ) {
    return this.timeClockService.clockIn(employeeId, dto);
  }

  @Post('employees/:employeeId/clock-out')
  @Roles('ADMIN')
  adminClockOut(
    @Param('employeeId') employeeId: string,
    @Body() dto: ClockOutDto
  ) {
    return this.timeClockService.clockOut(employeeId, dto);
  }

  @Post('start-break')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  startBreak(@Body() dto: StartBreakDto, @CurrentUser() user: any) {
    return this.timeClockService.startBreak(user.id, dto);
  }

  @Post('end-break')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  endBreak(@CurrentUser() user: any) {
    return this.timeClockService.endBreak(user.id);
  }

  @Post('clock-out')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  clockOut(@Body() dto: ClockOutDto, @CurrentUser() user: any) {
    return this.timeClockService.clockOut(user.id, dto);
  }

  @Get('my-current')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getMyCurrent(@CurrentUser() user: any) {
    return this.timeClockService.getCurrentForEmployee(user.id);
  }

  @Get('my-entries')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getMyEntries(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: TimeEntryStatus
  ) {
    return this.timeClockService.getEntries(
      { startDate, endDate, status },
      { ...user, role: { name: 'STAFF' } }
    );
  }

  @Get('my-compensation')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getMyCompensation(@CurrentUser() user: any) {
    return this.timeClockService.getCompensation(user.id);
  }

  @Get('current')
  @Roles('ADMIN', 'SUPERVISOR')
  getCurrentEntries() {
    return this.timeClockService.getCurrentEntries();
  }

  @Get('entries')
  @Roles('ADMIN', 'SUPERVISOR')
  getEntries(
    @CurrentUser() user: any,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: TimeEntryStatus
  ) {
    return this.timeClockService.getEntries(
      { employeeId, startDate, endDate, status },
      user
    );
  }

  @Post('entries')
  @Roles('ADMIN')
  createEntry(@Body() dto: CreateTimeEntryDto, @CurrentUser() user: any) {
    return this.timeClockService.createManualEntry(dto, user.id);
  }

  @Patch('entries/:id')
  @Roles('ADMIN', 'SUPERVISOR')
  updateEntry(
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
    @CurrentUser() user: any
  ) {
    return this.timeClockService.updateEntry(id, dto, user.id);
  }

  @Post('entries/:id/approve')
  @Roles('ADMIN', 'SUPERVISOR')
  approveEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timeClockService.approveEntry(id, user.id);
  }

  @Post('entries/:id/unapprove')
  @Roles('ADMIN', 'SUPERVISOR')
  unapproveEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timeClockService.unapproveEntry(id, user.id);
  }

  @Post('entries/:id/void')
  @Roles('ADMIN')
  voidEntry(
    @Param('id') id: string,
    @Body('reason') reason: string | undefined,
    @CurrentUser() user: any
  ) {
    return this.timeClockService.voidEntry(id, user.id, reason);
  }

  @Delete('entries/:id')
  @Roles('ADMIN')
  deleteEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timeClockService.deleteEntry(id, user.id);
  }

  @Get('employees/:employeeId/compensation')
  @Roles('ADMIN', 'SUPERVISOR')
  getCompensation(@Param('employeeId') employeeId: string) {
    return this.timeClockService.getCompensation(employeeId);
  }

  @Post('employees/:employeeId/compensation')
  @Roles('ADMIN')
  upsertCompensation(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpsertEmployeeCompensationDto,
    @CurrentUser() user: any
  ) {
    return this.timeClockService.upsertCompensation(employeeId, dto, user.id);
  }

  @Post('adjustments')
  @Roles('ADMIN')
  createAdjustment(
    @Body() dto: CreatePayrollAdjustmentDto,
    @CurrentUser() user: any
  ) {
    return this.timeClockService.createAdjustment(dto, user.id);
  }

  @Get('adjustments')
  @Roles('ADMIN', 'SUPERVISOR')
  getAdjustments(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.timeClockService.getAdjustments({
      employeeId,
      startDate,
      endDate,
    });
  }

  @Post('process-payroll')
  @Roles('ADMIN')
  processPayroll(@Body() dto: ProcessPayrollDto, @CurrentUser() user: any) {
    return this.timeClockService.processPayroll(dto, user.id);
  }

  @Get('payroll-summary')
  @Roles('ADMIN', 'SUPERVISOR')
  getPayrollSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('employeeId') employeeId?: string
  ) {
    return this.timeClockService.getPayrollSummary(
      startDate,
      endDate,
      employeeId
    );
  }
}
