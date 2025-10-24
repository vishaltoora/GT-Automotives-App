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
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AppointmentsService {
  // Standard include for appointment queries with multiple employees
  private readonly appointmentInclude = {
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
    employees: {
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    },
  };

  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
    private smsService: SmsService
  ) {}

  /**
   * Create a new appointment
   */
  async create(dto: CreateAppointmentDto, bookedBy: string) {
    // Support both old employeeId and new employeeIds
    const employeeIds = dto.employeeIds || (dto.employeeId ? [dto.employeeId] : []);

    console.log('[CREATE APPOINTMENT] Request received:', {
      customerId: dto.customerId,
      employeeIds: employeeIds.length > 0 ? employeeIds : 'AUTO-ASSIGN',
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

    // Auto-assign employee if none provided
    let finalEmployeeIds = employeeIds;
    if (finalEmployeeIds.length === 0) {
      const foundEmployeeId = await this.findAvailableEmployee(dto.scheduledDate, dto.scheduledTime, dto.duration);
      if (!foundEmployeeId) {
        throw new ConflictException('No available employees for the requested time slot');
      }
      finalEmployeeIds = [foundEmployeeId];
    } else {
      // Validate all provided employees exist and are available
      for (const empId of finalEmployeeIds) {
        const employee = await this.prisma.user.findUnique({
          where: { id: empId },
          include: { role: true },
        });
        if (!employee) {
          throw new NotFoundException(`Employee with ID ${empId} not found`);
        }
        if (employee.role.name !== 'STAFF' && employee.role.name !== 'ADMIN') {
          throw new BadRequestException(`User ${employee.firstName} ${employee.lastName} is not a staff or admin member`);
        }

        // Check availability
        const availabilityCheck = await this.availabilityService.isEmployeeAvailable(
          empId,
          dto.scheduledDate,
          dto.scheduledTime,
          dto.duration
        );
        if (availabilityCheck !== true) {
          const error = availabilityCheck as { available: false; reason: string; suggestion: string };
          throw new ConflictException(`${employee.firstName} ${employee.lastName}: ${error.reason}. ${error.suggestion}`);
        }
      }
    }

    // Normalize scheduledDate to midnight UTC for consistent date comparison
    const normalizedDate = new Date(dto.scheduledDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Calculate end time
    const endTime = this.calculateEndTime(dto.scheduledTime, dto.duration);

    // Create appointment with multiple employees
    const appointment = await this.prisma.appointment.create({
      data: {
        customerId: dto.customerId,
        vehicleId: dto.vehicleId,
        employeeId: finalEmployeeIds[0], // Keep first employee for backward compatibility
        scheduledDate: normalizedDate,
        scheduledTime: dto.scheduledTime,
        endTime,
        duration: dto.duration,
        serviceType: dto.serviceType,
        appointmentType: dto.appointmentType,
        notes: dto.notes,
        status: AppointmentStatus.SCHEDULED,
        bookedBy,
        reminderSent: false,
        employees: {
          create: finalEmployeeIds.map(empId => ({
            employeeId: empId,
          })),
        },
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
        employees: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send SMS confirmation to customer
    await this.smsService.sendAppointmentConfirmation(appointment.id).catch(err => {
      console.error('Failed to send customer confirmation SMS:', err);
      // Don't throw error - appointment was created successfully
    });

    // Send SMS alert to assigned employees
    for (const empId of finalEmployeeIds) {
      await this.smsService.sendStaffAppointmentAlert(appointment.id, empId).catch(err => {
        console.error(`Failed to send staff alert SMS to employee ${empId}:`, err);
        // Don't throw error - appointment was created successfully
      });
    }

    return appointment;
  }

  /**
   * Find all appointments with optional filters
   * All users (STAFF and ADMIN) can see all appointments
   */
  async findAll(query: AppointmentQueryDto, user?: any) {
    const where: any = {};

    if (query.startDate || query.endDate) {
      where.scheduledDate = {};
      if (query.startDate) {
        where.scheduledDate.gte = query.startDate;
      }
      if (query.endDate) {
        where.scheduledDate.lte = query.endDate;
      }
    }

    // Apply employeeId filter from query if provided
    if (query.employeeId) {
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
      include: this.appointmentInclude,
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });
  }

  /**
   * Get calendar view data
   * All users (STAFF and ADMIN) can see all appointments
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

    // Apply employeeId filter from query if provided
    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: this.appointmentInclude,
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
      include: this.appointmentInclude,
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

    console.log('[UPDATE APPOINTMENT] Updating appointment:', id);
    console.log('[UPDATE APPOINTMENT] DTO received:', JSON.stringify(dto, null, 2));
    console.log('[UPDATE APPOINTMENT] Current appointment employees:', appointment.employees);

    // Support both old employeeId and new employeeIds
    const employeeIds = dto.employeeIds || (dto.employeeId ? [dto.employeeId] : undefined);

    // Normalize scheduledDate if provided
    if (dto.scheduledDate) {
      const normalizedDate = new Date(dto.scheduledDate);
      normalizedDate.setUTCHours(0, 0, 0, 0);
      dto.scheduledDate = normalizedDate;
    }

    // If rescheduling or changing employee, check availability
    if (employeeIds || dto.scheduledDate || dto.scheduledTime || dto.duration) {
      const scheduledDate = dto.scheduledDate || appointment.scheduledDate;
      const scheduledTime = dto.scheduledTime || appointment.scheduledTime;
      const duration = dto.duration || appointment.duration;

      // Check if time/date is changing (convert to boolean)
      const isTimeChanging = !!(dto.scheduledDate || dto.scheduledTime || dto.duration);

      // Check availability for employees
      if (employeeIds && employeeIds.length > 0) {
        // Get currently assigned employee IDs
        console.log('[UPDATE APPOINTMENT] Raw appointment.employees:', JSON.stringify(appointment.employees, null, 2));
        console.log('[UPDATE APPOINTMENT] appointment.employeeId:', appointment.employeeId);

        // Get current employees - check both new employees relation and old employeeId field
        let currentEmployeeIds: string[] = [];
        if (appointment.employees && appointment.employees.length > 0) {
          currentEmployeeIds = appointment.employees.map(e => e.employeeId);
        } else if (appointment.employeeId) {
          currentEmployeeIds = [appointment.employeeId];
        }

        console.log('[UPDATE APPOINTMENT] Current employees:', currentEmployeeIds);
        console.log('[UPDATE APPOINTMENT] New employees:', employeeIds);
        console.log('[UPDATE APPOINTMENT] Time changing:', isTimeChanging);

        // CRITICAL DEBUG - Make this visible
        if (currentEmployeeIds.length === 0) {
          console.error('⚠️⚠️⚠️ WARNING: currentEmployeeIds is EMPTY! This will cause all employees to be validated!');
          console.error('⚠️ appointment.employees:', appointment.employees);
          console.error('⚠️ appointment.employeeId:', appointment.employeeId);
        }

        for (const empId of employeeIds) {
          // Only check availability if:
          // 1. Time is changing (all employees need revalidation), OR
          // 2. This is a new employee being added
          const isNewEmployee = !currentEmployeeIds.includes(empId);

          console.log(`[UPDATE APPOINTMENT] Employee ${empId}: isNew=${isNewEmployee}, shouldValidate=${isTimeChanging || isNewEmployee}`);

          if (isTimeChanging || isNewEmployee) {
            const availabilityCheck = await this.availabilityService.isEmployeeAvailable(
              empId,
              scheduledDate,
              scheduledTime,
              duration,
              id // Exclude current appointment from conflict check
            );
            if (availabilityCheck !== true) {
              const error = availabilityCheck as { available: false; reason: string; suggestion: string };
              const employee = await this.prisma.user.findUnique({ where: { id: empId } });
              throw new ConflictException(`${employee?.firstName} ${employee?.lastName}: ${error.reason}. ${error.suggestion}`);
            }
          }
        }
      }

      // Recalculate end time if time or duration changed
      if (dto.scheduledTime || dto.duration) {
        const newEndTime = this.calculateEndTime(scheduledTime, duration);
        dto['endTime'] = newEndTime;
      }
    }

    // Prepare update data
    const updateData: any = {
      ...dto,
      updatedAt: new Date(),
    };

    // Remove employeeIds from direct update (will be handled separately)
    delete updateData.employeeIds;

    // Update appointment and employees if provided
    if (employeeIds && employeeIds.length > 0) {
      // Delete existing employee assignments and create new ones
      await this.prisma.appointmentEmployee.deleteMany({
        where: { appointmentId: id },
      });

      updateData.employees = {
        create: employeeIds.map(empId => ({
          employeeId: empId,
        })),
      };

      // Update employeeId for backward compatibility
      updateData.employeeId = employeeIds[0];
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: this.appointmentInclude,
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

    const updatedAppointment = await this.prisma.appointment.update({
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

    // Send cancellation SMS to customer (non-blocking)
    console.log(`📱 [APPOINTMENTS SERVICE] Calling SMS cancellation for appointment: ${id}`);
    await this.smsService.sendAppointmentCancellation(id).catch(err => {
      console.error('❌ [APPOINTMENTS SERVICE] Failed to send cancellation SMS:', err);
      // Don't throw error - appointment was cancelled successfully
    });
    console.log(`✅ [APPOINTMENTS SERVICE] SMS cancellation call completed for appointment: ${id}`);

    return updatedAppointment;
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
   * All users (STAFF and ADMIN) can see all appointments
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

    console.log('[GET TODAY APPOINTMENTS] No filtering - showing all appointments');
    console.log('[GET TODAY APPOINTMENTS] Query where:', where);

    const result = await this.prisma.appointment.findMany({
      where,
      include: this.appointmentInclude,
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
      include: this.appointmentInclude,
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });
  }

  /**
   * Helper: Find an available employee for a time slot
   */
  private async findAvailableEmployee(date: Date, startTime: string, duration: number): Promise<string | null> {
    // Get all staff and admin users
    const staffUsers = await this.prisma.user.findMany({
      where: {
        role: { name: { in: ['STAFF', 'ADMIN'] } },
        isActive: true,
      },
    });

    // Check each staff/admin member's availability
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

