import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { AppointmentStatus } from '@prisma/client';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  CalendarQueryDto,
} from '../common/dto/appointment.dto';
import { AvailabilityService } from './availability.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService
  ) {}

  /**
   * Create a new appointment
   */
  async create(dto: CreateAppointmentDto, bookedBy: string) {
    console.log('[CREATE APPOINTMENT] Request received:', {
      customerId: dto.customerId,
      employeeId: dto.employeeId || 'AUTO-ASSIGN',
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      duration: dto.duration,
    });

    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${dto.customerId} not found`);
    }

    // Validate vehicle if provided
    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
      }
      // Ensure vehicle belongs to customer
      if (vehicle.customerId !== dto.customerId) {
        throw new BadRequestException('Vehicle does not belong to the specified customer');
      }
    }

    // Auto-assign employee if not provided
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const foundEmployeeId = await this.findAvailableEmployee(dto.scheduledDate, dto.scheduledTime, dto.duration);
      if (!foundEmployeeId) {
        throw new ConflictException('No available employees for the requested time slot');
      }
      employeeId = foundEmployeeId;
    } else {
      // Validate provided employee exists and is available
      const employee = await this.prisma.user.findUnique({
        where: { id: employeeId },
        include: { role: true },
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }
      if (employee.role.name !== 'STAFF') {
        throw new BadRequestException('Selected user is not a staff member');
      }

      // Check availability
      const isAvailable = await this.availabilityService.isEmployeeAvailable(
        employeeId,
        dto.scheduledDate,
        dto.scheduledTime,
        dto.duration
      );
      if (!isAvailable) {
        throw new ConflictException('Employee is not available at the requested time');
      }
    }

    // Normalize scheduledDate to midnight UTC for consistent date comparison
    const normalizedDate = new Date(dto.scheduledDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Calculate end time
    const endTime = this.calculateEndTime(dto.scheduledTime, dto.duration);

    // Create appointment
    return this.prisma.appointment.create({
      data: {
        customerId: dto.customerId,
        vehicleId: dto.vehicleId,
        employeeId,
        scheduledDate: normalizedDate,
        scheduledTime: dto.scheduledTime,
        endTime,
        duration: dto.duration,
        serviceType: dto.serviceType,
        notes: dto.notes,
        status: AppointmentStatus.SCHEDULED,
        bookedBy,
        reminderSent: false,
      },
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find all appointments with optional filters
   * STAFF users see only their assigned appointments
   * ADMIN users see all appointments
   */
  async findAll(query: AppointmentQueryDto, user?: any) {
    const where: any = {};

    // STAFF users can only see their own appointments
    if (user && user.role?.name === 'STAFF') {
      where.employeeId = user.id;
    }

    if (query.startDate || query.endDate) {
      where.scheduledDate = {};
      if (query.startDate) {
        where.scheduledDate.gte = query.startDate;
      }
      if (query.endDate) {
        where.scheduledDate.lte = query.endDate;
      }
    }

    // Only apply employeeId filter if not already set by STAFF role
    if (query.employeeId && !where.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });
  }

  /**
   * Get calendar view data
   * STAFF users see only their assigned appointments
   * ADMIN users see all appointments
   */
  async getCalendar(query: CalendarQueryDto, user?: any) {
    const where: any = {
      scheduledDate: {
        gte: query.startDate,
        lte: query.endDate,
      },
      status: {
        in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
      },
    };

    // STAFF users can only see their own appointments
    if (user && user.role?.name === 'STAFF') {
      where.employeeId = user.id;
    } else if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });

    // Group by date and employee
    const calendar: Record<string, any[]> = {};

    appointments.forEach((appointment) => {
      const dateKey = appointment.scheduledDate.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(appointment);
    });

    return calendar;
  }

  /**
   * Find one appointment by ID
   */
  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  /**
   * Update an appointment
   */
  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    // Normalize scheduledDate if provided
    if (dto.scheduledDate) {
      const normalizedDate = new Date(dto.scheduledDate);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      dto.scheduledDate = normalizedDate;
    }

    // If rescheduling or changing employee, check availability
    if (dto.employeeId || dto.scheduledDate || dto.scheduledTime || dto.duration) {
      const employeeId = dto.employeeId || appointment.employeeId;
      const scheduledDate = dto.scheduledDate || appointment.scheduledDate;
      const scheduledTime = dto.scheduledTime || appointment.scheduledTime;
      const duration = dto.duration || appointment.duration;

      if (employeeId) {
        const isAvailable = await this.availabilityService.isEmployeeAvailable(
          employeeId,
          scheduledDate,
          scheduledTime,
          duration,
          id // Exclude current appointment from conflict check
        );
        if (!isAvailable) {
          throw new ConflictException('Employee is not available at the requested time');
        }
      }

      // Recalculate end time if time or duration changed
      if (dto.scheduledTime || dto.duration) {
        const newEndTime = this.calculateEndTime(scheduledTime, duration);
        dto['endTime'] = newEndTime;
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Cancel an appointment
   */
  async cancel(id: string) {
    const appointment = await this.findOne(id);

    if (appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(`Cannot cancel appointment with status: ${appointment.status}`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete an appointment (hard delete - admin only)
   */
  async remove(id: string) {
    // Verify appointment exists before deleting
    await this.findOne(id);
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  /**
   * Get today's appointments for printing/display
   * STAFF users see only their assigned appointments
   * ADMIN users see all appointments
   */
  async getTodayAppointments(user?: any) {
    console.log('[GET TODAY APPOINTMENTS] User:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      roleName: user?.role?.name,
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: any = {
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
      },
    };

    // STAFF users can only see their own appointments
    if (user && user.role?.name === 'STAFF') {
      console.log('[GET TODAY APPOINTMENTS] Filtering for STAFF user:', user.id);
      where.employeeId = user.id;
    } else {
      console.log('[GET TODAY APPOINTMENTS] No filtering - showing all appointments');
    }

    console.log('[GET TODAY APPOINTMENTS] Query where:', where);

    const result = await this.prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    console.log('[GET TODAY APPOINTMENTS] Found appointments:', result.length);
    if (result.length > 0) {
      console.log('[GET TODAY APPOINTMENTS] First appointment:', {
        id: result[0].id,
        scheduledDate: result[0].scheduledDate,
        scheduledTime: result[0].scheduledTime,
        employee: result[0].employee?.firstName + ' ' + result[0].employee?.lastName,
      });
    }

    return result;
  }

  /**
   * Get upcoming appointments for a customer
   */
  async getCustomerUpcoming(customerId: string) {
    const now = new Date();

    return this.prisma.appointment.findMany({
      where: {
        customerId,
        scheduledDate: {
          gte: now,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
        },
      },
      include: {
        vehicle: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });
  }

  /**
   * Helper: Find an available employee for a time slot
   */
  private async findAvailableEmployee(date: Date, startTime: string, duration: number): Promise<string | null> {
    // Get all staff users
    const staffUsers = await this.prisma.user.findMany({
      where: {
        role: { name: 'STAFF' },
        isActive: true,
      },
    });

    // Check each staff member's availability
    for (const staff of staffUsers) {
      const isAvailable = await this.availabilityService.isEmployeeAvailable(
        staff.id,
        date,
        startTime,
        duration
      );
      if (isAvailable) {
        return staff.id;
      }
    }

    return null;
  }

  /**
   * Helper: Calculate end time from start time and duration
   */
  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + duration;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }
}
