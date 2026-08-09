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
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  clockIn(@Body() dto: ClockInDto, @CurrentUser() user: any) {
    return this.timeClockService.clockIn(user.id, dto);
  }

  /**
   * Clock someone in on their behalf. Deliberately exempt from the shop-hours
   * window: this is how a shift that genuinely ran outside it gets recorded.
   */
  @Post('employees/:employeeId/clock-in')
  @Roles('ADMIN', 'FOREMAN')
  adminClockIn(
    @Param('employeeId') employeeId: string,
    @Body() dto: ClockInDto
  ) {
    return this.timeClockService.clockIn(employeeId, dto, false);
  }

  /**
   * The shop-hours window and whether the clock is open right now, so the
   * clock-in button can disable itself and say why rather than letting someone
   * press it and take an error.
   */
  @Get('shop-hours')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  getShopHours() {
    return this.timeClockService.getShopHoursStatus();
  }

  @Post('employees/:employeeId/clock-out')
  @Roles('ADMIN', 'FOREMAN')
  adminClockOut(
    @Param('employeeId') employeeId: string,
    @Body() dto: ClockOutDto
  ) {
    return this.timeClockService.clockOut(employeeId, dto);
  }

  @Post('start-break')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  startBreak(@Body() dto: StartBreakDto, @CurrentUser() user: any) {
    return this.timeClockService.startBreak(user.id, dto);
  }

  @Post('end-break')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  endBreak(@CurrentUser() user: any) {
    return this.timeClockService.endBreak(user.id);
  }

  @Post('clock-out')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  clockOut(@Body() dto: ClockOutDto, @CurrentUser() user: any) {
    return this.timeClockService.clockOut(user.id, dto);
  }

  @Get('my-current')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  getMyCurrent(@CurrentUser() user: any) {
    return this.timeClockService.getCurrentForEmployee(user.id);
  }

  @Get('my-entries')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
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
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF')
  getMyCompensation(@CurrentUser() user: any) {
    return this.timeClockService.getCompensation(user.id);
  }

  @Get('current')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  getCurrentEntries() {
    return this.timeClockService.getCurrentEntries();
  }

  // ACCOUNTANT is read-only on these routes: they need hours to raise pay
  // stubs, but approving and adjusting stay with ADMIN/FOREMAN. Processing is
  // the exception — raising a stub pays the hours it covers, and the accountant
  // raises stubs, so that path processes on their behalf (see PayStubsService).
  @Get('entries')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'ACCOUNTANT')
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
  @Roles('ADMIN', 'FOREMAN')
  createEntry(@Body() dto: CreateTimeEntryDto, @CurrentUser() user: any) {
    return this.timeClockService.createManualEntry(dto, user.id);
  }

  @Patch('entries/:id')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  updateEntry(
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
    @CurrentUser() user: any
  ) {
    return this.timeClockService.updateEntry(id, dto, user.id);
  }

  @Post('entries/:id/approve')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  approveEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timeClockService.approveEntry(id, user.id);
  }

  @Post('entries/:id/unapprove')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  unapproveEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timeClockService.unapproveEntry(id, user.id);
  }

  @Post('entries/:id/void')
  @Roles('ADMIN', 'FOREMAN')
  voidEntry(
    @Param('id') id: string,
    @Body('reason') reason: string | undefined,
    @CurrentUser() user: any
  ) {
    return this.timeClockService.voidEntry(id, user.id, reason);
  }

  @Delete('entries/:id')
  @Roles('ADMIN', 'FOREMAN')
  deleteEntry(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timeClockService.deleteEntry(id, user.id);
  }

  @Get('employees/:employeeId/compensation')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'ACCOUNTANT')
  getCompensation(@Param('employeeId') employeeId: string) {
    return this.timeClockService.getCompensation(employeeId);
  }

  // Compensation & bonus management is admin-only (hidden for foreman).
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
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
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
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'ACCOUNTANT')
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

  /**
   * Approved and unapproved hours per employee for a pay period — the figures
   * behind the time clock's employee cards.
   *
   * Open to every payroll role, including STAFF: the service narrows anyone not
   * trusted with the team down to their own row, which is what lets an employee
   * see their own card in the same design.
   */
  @Get('pay-period-hours')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'ACCOUNTANT', 'STAFF')
  getPayPeriodHours(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.timeClockService.getPayPeriodHours(startDate, endDate, user);
  }

  /**
   * Approved hours and gross pay per employee over a period. Read-only — this
   * is what the accountant's hours view and the pay stub form pre-fill read,
   * and it must never stamp entries the way POST process-payroll does.
   *
   * `unprocessedOnly=true` excludes hours a pay stub has already paid, which is
   * what the stub form asks for so the same shift cannot be paid twice.
   */
  @Get('payroll-hours')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'ACCOUNTANT')
  getPayrollHours(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('employeeId') employeeId?: string,
    @Query('unprocessedOnly') unprocessedOnly?: string
  ) {
    return this.timeClockService.getPayrollHours(
      startDate,
      endDate,
      employeeId,
      {
        unprocessedOnly: unprocessedOnly === 'true',
      }
    );
  }
}
