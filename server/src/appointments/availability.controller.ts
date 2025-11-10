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

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Set or update recurring availability for an employee (ADMIN and SUPERVISOR)
   * Roles: ADMIN, SUPERVISOR
   */
  @Post('recurring')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
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
   * Set or update own recurring availability (STAFF secure endpoint)
   * Uses authenticated user's ID from token
   */
  @Post('my-recurring')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  async setMyRecurring(@Body() dto: Omit<SetAvailabilityDto, 'employeeId'>, @CurrentUser() user: any) {
    // Always use the authenticated user's ID from token
    const secureDto: SetAvailabilityDto = {
      ...dto,
      employeeId: user.id,
    };
    return this.availabilityService.setRecurringAvailability(secureDto);
  }

  /**
   * Get employee's recurring availability (ADMIN and SUPERVISOR)
   * Roles: ADMIN, SUPERVISOR
   */
  @Get('recurring/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  async getRecurring(@Param('employeeId') employeeId: string) {
    return this.availabilityService.getEmployeeAvailability(employeeId);
  }

  /**
   * Get own recurring availability (STAFF secure endpoint)
   * Uses authenticated user's ID from token
   */
  @Get('my-recurring')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  async getMyRecurring(@CurrentUser() user: any) {
    return this.availabilityService.getEmployeeAvailability(user.id);
  }

  /**
   * Add a time slot override (ADMIN and SUPERVISOR)
   * Roles: ADMIN, SUPERVISOR
   */
  @Post('override')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  async addOverride(@Body() dto: TimeSlotOverrideDto) {
    return this.availabilityService.addOverride(dto);
  }

  /**
   * Add own time slot override (STAFF secure endpoint)
   * Uses authenticated user's ID from token
   */
  @Post('my-override')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  async addMyOverride(@Body() dto: Omit<TimeSlotOverrideDto, 'employeeId'>, @CurrentUser() user: any) {
    // Always use the authenticated user's ID from token
    const secureDto: TimeSlotOverrideDto = {
      ...dto,
      employeeId: user.id,
    };
    return this.availabilityService.addOverride(secureDto);
  }

  /**
   * Get overrides for an employee within a date range (ADMIN and SUPERVISOR)
   * Roles: ADMIN, SUPERVISOR
   */
  @Get('override/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
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
   * Get own overrides within a date range (STAFF secure endpoint)
   * Uses authenticated user's ID from token
   */
  @Get('my-overrides')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  async getMyOverrides(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any
  ) {
    return this.availabilityService.getOverrides(
      user.id,
      new Date(startDate),
      new Date(endDate)
    );
  }

  /**
   * Delete a recurring availability slot (ADMIN or owner only)
   * Roles: ADMIN, STAFF
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
   * Delete an override (ADMIN or owner only)
   * Roles: ADMIN, STAFF
   */
  @Delete('override/:overrideId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async deleteOverride(@Param('overrideId') overrideId: string, @CurrentUser() user: any) {
    return this.availabilityService.deleteOverride(overrideId);
  }

  /**
   * Check available time slots for a specific date and duration
   * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER (for booking)
   */
  @Post('check')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.availabilityService.checkAvailableSlots(dto);
  }

  /**
   * Check if specific employee is available at a specific time
   * Roles: ADMIN, SUPERVISOR, STAFF
   */
  @Get('check/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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
