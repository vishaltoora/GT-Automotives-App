import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  CalendarQueryDto,
} from '../common/dto/appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Create a new appointment
   * Roles: ADMIN, STAFF, CUSTOMER
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentsService.create(createAppointmentDto, user.id);
  }

  /**
   * Get all appointments with filters
   * Roles: ADMIN, STAFF (staff see only their assigned appointments)
   */
  @Get()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async findAll(@Query() query: AppointmentQueryDto, @CurrentUser() user: any) {
    return this.appointmentsService.findAll(query, user);
  }

  /**
   * Get calendar view
   * Roles: ADMIN, STAFF (staff see only their assigned appointments)
   */
  @Get('calendar')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async getCalendar(@Query() query: CalendarQueryDto, @CurrentUser() user: any) {
    return this.appointmentsService.getCalendar(query, user);
  }

  /**
   * Get today's appointments
   * Roles: ADMIN, STAFF (staff see only their assigned appointments)
   */
  @Get('today')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async getToday(@CurrentUser() user: any) {
    return this.appointmentsService.getTodayAppointments(user);
  }

  /**
   * Get customer's upcoming appointments
   * Roles: ADMIN, STAFF, CUSTOMER (customers can only see their own)
   */
  @Get('customer/:customerId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  async getCustomerAppointments(@Param('customerId') customerId: string, @CurrentUser() user: any) {
    // TODO: Add permission check for customers to only see their own appointments
    return this.appointmentsService.getCustomerUpcoming(customerId);
  }

  /**
   * Get a single appointment by ID
   * Roles: ADMIN, STAFF, CUSTOMER
   */
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /**
   * Update an appointment
   * Roles: ADMIN, STAFF
   */
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  /**
   * Cancel an appointment
   * Roles: ADMIN, STAFF, CUSTOMER
   */
  @Patch(':id/cancel')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  /**
   * Delete an appointment (hard delete)
   * Roles: ADMIN only
   */
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
