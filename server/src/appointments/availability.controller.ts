import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import {
  SetAvailabilityDto,
  TimeSlotOverrideDto,
  CheckAvailabilityDto,
} from '../common/dto/employee-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Set or update recurring availability for an employee
   * Roles: ADMIN and STAFF can set availability for any employee
   */
  @Post('recurring')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async setRecurring(@Body() dto: SetAvailabilityDto, @CurrentUser() user: any) {
    console.log('[SET RECURRING AVAILABILITY] User:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      roleName: user?.role?.name,
    });
    console.log('[SET RECURRING AVAILABILITY] DTO:', dto);

    console.log('[SET RECURRING AVAILABILITY] ALLOWED: Proceeding with availability update');
    return this.availabilityService.setRecurringAvailability(dto);
  }

  /**
   * Get employee's recurring availability
   * Roles: ADMIN, STAFF (staff can view their own)
   */
  @Get('recurring/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async getRecurring(@Param('employeeId') employeeId: string) {
    return this.availabilityService.getEmployeeAvailability(employeeId);
  }

  /**
   * Add a time slot override (vacation, sick day, extra shift)
   * Roles: ADMIN, STAFF (staff can add their own overrides)
   */
  @Post('override')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async addOverride(@Body() dto: TimeSlotOverrideDto) {
    return this.availabilityService.addOverride(dto);
  }

  /**
   * Get overrides for an employee within a date range
   * Roles: ADMIN, STAFF
   */
  @Get('override/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async getOverrides(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.availabilityService.getOverrides(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  /**
   * Delete a recurring availability slot
   * Roles: ADMIN, STAFF (staff can delete their own)
   */
  @Delete('recurring/:availabilityId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async deleteRecurring(
    @Param('availabilityId') availabilityId: string,
    @CurrentUser() user: any
  ) {
    console.log('[DELETE RECURRING AVAILABILITY] User:', {
      id: user?.id,
      email: user?.email,
      role: user?.role?.name,
    });
    console.log('[DELETE RECURRING AVAILABILITY] Availability ID:', availabilityId);

    return this.availabilityService.deleteRecurringAvailability(availabilityId, user);
  }

  /**
   * Delete an override
   * Roles: ADMIN, STAFF
   */
  @Delete('override/:overrideId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async deleteOverride(@Param('overrideId') overrideId: string) {
    return this.availabilityService.deleteOverride(overrideId);
  }

  /**
   * Check available time slots for a specific date and duration
   * Roles: ADMIN, STAFF, CUSTOMER (for booking)
   */
  @Post('check')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  async checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.availabilityService.checkAvailableSlots(dto);
  }

  /**
   * Check if specific employee is available at a specific time
   * Roles: ADMIN, STAFF
   */
  @Get('check/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async checkEmployeeAvailability(
    @Param('employeeId') employeeId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('duration', ParseIntPipe) duration: number
  ) {
    const isAvailable = await this.availabilityService.isEmployeeAvailable(
      employeeId,
      new Date(date),
      startTime,
      duration
    );
    return { employeeId, date, startTime, duration, available: isAvailable };
  }
}
