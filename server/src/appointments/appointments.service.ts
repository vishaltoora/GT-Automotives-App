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
import { EmailService } from '../email/email.service';
import { getCurrentBusinessDateTime, getCurrentBusinessDate, extractBusinessDate, POSTGRES_TIMEZONE } from '../config/timezone.config';

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
    private smsService: SmsService,
    private emailService: EmailService
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

    // Handle scheduledDate - convert YYYY-MM-DD string to Date for database storage
    // dto.scheduledDate is now always a string (YYYY-MM-DD format) to avoid timezone conversion in DTOs
    // MUST do this BEFORE availability checks since they expect a Date object
    // CRITICAL: Use Date.UTC() to create date at midnight UTC, not local midnight
    // This ensures consistent date storage regardless of server timezone
    const [year, month, day] = dto.scheduledDate.split('-').map(Number);
    const normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Auto-assign employee if none provided
    let finalEmployeeIds = employeeIds;
    if (finalEmployeeIds.length === 0) {
      const foundEmployeeId = await this.findAvailableEmployee(normalizedDate, dto.scheduledTime, dto.duration);
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

        // Check availability - use normalizedDate (Date object) not dto.scheduledDate (string)
        const availabilityCheck = await this.availabilityService.isEmployeeAvailable(
          empId,
          normalizedDate,
          dto.scheduledTime,
          dto.duration
        );
        if (availabilityCheck !== true) {
          const error = availabilityCheck as { available: false; reason: string; suggestion: string };
          throw new ConflictException(`${employee.firstName} ${employee.lastName}: ${error.reason}. ${error.suggestion}`);
        }
      }
    }

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

    // Send EMAIL alert to assigned employees (replacing SMS)
    for (const assignedEmployee of appointment.employees) {
      const employee = assignedEmployee.employee;

      // Only send email if employee has an email address
      if (!employee.email) {
        console.warn(`Employee ${employee.firstName} ${employee.lastName} has no email address. Skipping notification.`);
        continue;
      }

      // Prepare email data
      const vehicleInfo = appointment.vehicle
        ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
        : 'No vehicle specified';

      const customerName = `${appointment.customer.firstName} ${appointment.customer.lastName}`;

      // Format date as YYYY-MM-DD to avoid timezone issues in email
      const scheduledDateStr = extractBusinessDate(appointment.scheduledDate);

      await this.emailService.sendAppointmentAssignment({
        employeeEmail: employee.email,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        appointmentId: appointment.id,
        customerName: customerName,
        customerPhone: appointment.customer.phone || undefined,
        vehicleInfo: vehicleInfo,
        serviceType: appointment.serviceType,
        scheduledDate: scheduledDateStr,
        scheduledTime: appointment.scheduledTime,
        duration: appointment.duration,
        appointmentType: appointment.appointmentType as 'AT_GARAGE' | 'MOBILE_SERVICE',
        address: appointment.appointmentType === 'MOBILE_SERVICE' ? (appointment.customer.address || undefined) : undefined,
        notes: appointment.notes || undefined,
      }).catch(err => {
        console.error(`Failed to send appointment assignment email to ${employee.email}:`, err);
        // Don't throw error - appointment was created successfully
      });
    }

    return appointment;
  }

  /**
   * Find all appointments with optional filters
   * All users (STAFF and ADMIN) can see all appointments
   * Uses DATE-only comparison to avoid timezone issues
   */
  async findAll(query: AppointmentQueryDto, user?: any) {
    // If date filtering is needed, use raw SQL with DATE() comparison in Pacific Time
    if (query.startDate || query.endDate) {
      // Build date conditions for raw SQL
      const dateConditions: string[] = [];
      const params: any[] = [];

      if (query.startDate) {
        const dateOnly = extractBusinessDate(query.startDate);
        // Compare in Pacific Time to ensure correct business day
        dateConditions.push(`DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE $${params.length + 1}) >= DATE($${params.length + 2})`);
        params.push(POSTGRES_TIMEZONE);
        params.push(dateOnly);
      }

      if (query.endDate) {
        const dateOnly = extractBusinessDate(query.endDate);
        // Compare in Pacific Time to ensure correct business day
        dateConditions.push(`DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE $${params.length + 1}) <= DATE($${params.length + 2})`);
        params.push(POSTGRES_TIMEZONE);
        params.push(dateOnly);
      }

      // Build additional filters
      const additionalConditions: string[] = [];
      let fromClause = '"Appointment" a';

      if (query.employeeId) {
        // CRITICAL: Join with AppointmentEmployee table for employee filtering
        // The deprecated employeeId field is not used anymore
        fromClause = '"Appointment" a INNER JOIN "AppointmentEmployee" ae ON a."id" = ae."appointmentId"';
        additionalConditions.push(`ae."employeeId" = $${params.length + 1}`);
        params.push(query.employeeId);
      }

      if (query.customerId) {
        additionalConditions.push(`a."customerId" = $${params.length + 1}`);
        params.push(query.customerId);
      }
      if (query.status) {
        additionalConditions.push(`a."status" = $${params.length + 1}`);
        params.push(query.status);
      }

      // Combine all conditions
      const allConditions = [...dateConditions, ...additionalConditions];
      const whereClause = allConditions.length > 0 ? `WHERE ${allConditions.join(' AND ')}` : '';

      console.log('[FIND ALL] Using DATE() comparison:', {
        startDate: query.startDate,
        endDate: query.endDate,
        employeeId: query.employeeId,
        whereClause,
        params,
      });

      // Get appointment IDs using raw SQL with proper employee join
      // CRITICAL: PostgreSQL requires ORDER BY columns in SELECT when using DISTINCT
      const appointments = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT DISTINCT a."id", a."scheduledDate", a."scheduledTime"
         FROM ${fromClause} ${whereClause}
         ORDER BY a."scheduledDate" ASC, a."scheduledTime" ASC`,
        ...params
      );

      const appointmentIds = appointments.map(a => a.id);
      if (appointmentIds.length === 0) {
        return [];
      }

      // Fetch full appointments with relations
      return this.prisma.appointment.findMany({
        where: { id: { in: appointmentIds } },
        include: this.appointmentInclude,
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      });
    }

    // No date filtering - use standard Prisma query
    const where: any = {};

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
   * Uses DATE-only comparison to avoid timezone issues
   */
  async getCalendar(query: CalendarQueryDto, user?: any) {
    // Extract date-only strings in Pacific Time
    const startDateOnly = extractBusinessDate(query.startDate);
    const endDateOnly = extractBusinessDate(query.endDate);

    // Build conditions with Pacific Time comparison
    const conditions: string[] = [
      `DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE $1) >= DATE($2)`,
      `DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE $1) <= DATE($3)`,
      `a."status" IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')`,
    ];
    const params: any[] = [POSTGRES_TIMEZONE, startDateOnly, endDateOnly];

    if (query.employeeId) {
      conditions.push(`a."employeeId" = $${params.length + 1}`);
      params.push(query.employeeId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    console.log('[GET CALENDAR] Using DATE() comparison:', {
      startDate: query.startDate,
      endDate: query.endDate,
      whereClause,
      params,
    });

    // Get appointment IDs using raw SQL
    const appointmentRecords = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT a."id" FROM "Appointment" a ${whereClause} ORDER BY a."scheduledDate" ASC, a."scheduledTime" ASC`,
      ...params
    );

    const appointmentIds = appointmentRecords.map(a => a.id);
    if (appointmentIds.length === 0) {
      return {};
    }

    // Fetch full appointments with relations
    const appointments = await this.prisma.appointment.findMany({
      where: { id: { in: appointmentIds } },
      include: this.appointmentInclude,
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });

    // Group by date and employee
    const calendar: Record<string, any[]> = {};

    appointments.forEach((appointment) => {
      // Use extractBusinessDate to avoid timezone conversion issues
      const dateKey = extractBusinessDate(appointment.scheduledDate);
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

    // Normalize scheduledDate if provided - convert YYYY-MM-DD string to Date for database storage
    // dto.scheduledDate is now always a string (YYYY-MM-DD format) to avoid timezone conversion in DTOs
    // CRITICAL: Use Date.UTC() to create date at midnight UTC, not local midnight
    // This ensures consistent date storage regardless of server timezone
    let normalizedDate: Date | undefined;
    if (dto.scheduledDate) {
      const [year, month, day] = dto.scheduledDate.split('-').map(Number);
      normalizedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }

    // If rescheduling or changing employee, check availability
    if (employeeIds || dto.scheduledDate || dto.scheduledTime || dto.duration) {
      const scheduledDate = normalizedDate || appointment.scheduledDate;
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
      // Replace string scheduledDate with normalized Date object for database
      ...(normalizedDate && { scheduledDate: normalizedDate }),
      updatedAt: new Date(),
    };

    // CRITICAL FIX FOR DAY SUMMARY:
    // If payment information is being updated (amount, breakdown, or notes),
    // ALWAYS update paymentDate to current date for accurate daily cash reporting
    // This ensures:
    // 1. New payments appear in today's Day Summary
    // 2. Past appointments processed today appear in today's Day Summary (not the appointment's original date)
    // 3. Re-processed payments update to today's date
    const isPaymentUpdate =
      dto.paymentAmount !== undefined ||
      dto.paymentBreakdown !== undefined ||
      dto.paymentNotes !== undefined;

    if (isPaymentUpdate && dto.paymentAmount && dto.paymentAmount > 0) {
      // ALWAYS set paymentDate to NOW when processing a payment
      // Use business timezone (PST/PDT) to ensure correct day for EOD reports
      // Store the actual current time, not midnight, for accurate timestamping
      // Date comparisons in queries will use AT TIME ZONE to extract correct business day
      const businessDateTime = getCurrentBusinessDateTime();
      updateData.paymentDate = businessDateTime;

      console.log('[UPDATE APPOINTMENT] Setting paymentDate to current business time:', {
        appointmentId: id,
        oldPayment: appointment.paymentAmount || 0,
        newPayment: dto.paymentAmount,
        paymentDate: updateData.paymentDate.toISOString(),
        businessTimezone: POSTGRES_TIMEZONE,
        businessDateString: extractBusinessDate(businessDateTime),
        businessTimeString: businessDateTime.toLocaleString('en-US', {
          timeZone: POSTGRES_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        scheduledDate: appointment.scheduledDate,
        isReprocess: (appointment.paymentAmount || 0) > 0,
      });
    }

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
   * Get appointments by payment date (for daily cash reports)
   * Returns appointments where payment was processed on the specified date
   *
   * TIMEZONE HANDLING:
   * - Accepts paymentDate as YYYY-MM-DD string (e.g., "2025-11-13")
   * - All date comparisons use Pacific Time (PST/PDT) via AT TIME ZONE
   * - This ensures payments show on the correct business day regardless of server timezone
   *
   * BACKWARDS COMPATIBILITY:
   * - If paymentDate exists: Use paymentDate (new behavior - accurate processing date)
   * - If paymentDate is NULL: Fall back to scheduledDate + COMPLETED status (old appointments)
   */
  async getByPaymentDate(paymentDate: string) {
    // extractBusinessDate handles YYYY-MM-DD strings by returning them as-is
    const dateOnly = extractBusinessDate(paymentDate);

    console.log('[GET BY PAYMENT DATE] Query:', {
      input: paymentDate,
      dateOnly,
      businessTimezone: POSTGRES_TIMEZONE,
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Use raw SQL with AT TIME ZONE to compare dates in Pacific Time
    // This ensures morning/evening payments appear on the correct business day
    //
    // CRITICAL: PostgreSQL AT TIME ZONE works as follows:
    // 1. "paymentDate" AT TIME ZONE 'UTC' - treats the timestamp as if it's in UTC
    // 2. AT TIME ZONE 'America/Vancouver' - converts to Pacific Time
    // 3. DATE() - extracts the date portion in Pacific Time
    //
    // This prevents timezone issues where:
    // - Morning payments (8am PST = 4pm UTC previous day) would show on wrong day
    // - Evening payments (8pm PST = 4am UTC next day) would show on wrong day
    const appointments = await this.prisma.$queryRaw<any[]>`
      SELECT a.*
      FROM "Appointment" a
      WHERE a."paymentAmount" >= 0
        AND (
          -- New behavior: Payment was processed on this date (paymentDate is set)
          -- Compare in Pacific Time to ensure correct business day
          (
            a."paymentDate" IS NOT NULL
            AND DATE(a."paymentDate" AT TIME ZONE 'UTC' AT TIME ZONE ${POSTGRES_TIMEZONE}) = DATE(${dateOnly})
          )
          OR
          -- Old behavior: Appointment was scheduled on this date and completed (paymentDate is NULL)
          -- Also compare in Pacific Time for consistency
          (
            a."paymentDate" IS NULL
            AND DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE ${POSTGRES_TIMEZONE}) = DATE(${dateOnly})
            AND a."status" = 'COMPLETED'
          )
        )
      ORDER BY a."scheduledTime" ASC
    `;

    // Manually fetch relations since we used raw SQL
    const appointmentIds = appointments.map(a => a.id);

    if (appointmentIds.length === 0) {
      return [];
    }

    // Fetch full appointments with relations
    return this.prisma.appointment.findMany({
      where: {
        id: {
          in: appointmentIds,
        },
      },
      include: this.appointmentInclude,
      orderBy: [{ scheduledTime: 'asc' }],
    });
  }

  /**
   * Get today's appointments for printing/display
   * All users (STAFF and ADMIN) can see all appointments
   * Uses DATE-only comparison to avoid timezone issues
   */
  async getTodayAppointments(user?: any) {
    console.log('[GET TODAY APPOINTMENTS] User:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      roleName: user?.role?.name,
    });

    // Get today's date in Pacific Time
    const todayDateOnly = getCurrentBusinessDate();

    console.log('[GET TODAY APPOINTMENTS] Using Pacific Time DATE() comparison:', {
      todayDateOnly,
      businessTimezone: POSTGRES_TIMEZONE,
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Use raw SQL with Pacific Time comparison to ensure correct business day
    const appointmentRecords = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT a."id"
       FROM "Appointment" a
       WHERE DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE $1) = DATE($2)
         AND a."status" IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')
       ORDER BY a."scheduledTime" ASC`,
      POSTGRES_TIMEZONE,
      todayDateOnly
    );

    const appointmentIds = appointmentRecords.map(a => a.id);
    if (appointmentIds.length === 0) {
      console.log('[GET TODAY APPOINTMENTS] Found appointments: 0');
      return [];
    }

    // Fetch full appointments with relations
    const result = await this.prisma.appointment.findMany({
      where: { id: { in: appointmentIds } },
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
   * Uses Pacific Time DATE comparison to ensure correct business day
   */
  async getCustomerUpcoming(customerId: string) {
    // Get today's date in Pacific Time
    const todayDateOnly = getCurrentBusinessDate();

    console.log('[GET CUSTOMER UPCOMING] Using Pacific Time DATE() comparison:', {
      customerId,
      todayDateOnly,
      businessTimezone: POSTGRES_TIMEZONE,
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    // Use raw SQL with Pacific Time comparison to ensure correct business day
    const appointmentRecords = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT a."id"
       FROM "Appointment" a
       WHERE a."customerId" = $1
         AND DATE(a."scheduledDate" AT TIME ZONE 'UTC' AT TIME ZONE $2) >= DATE($3)
         AND a."status" IN ('SCHEDULED', 'CONFIRMED')
       ORDER BY a."scheduledDate" ASC, a."scheduledTime" ASC`,
      customerId,
      POSTGRES_TIMEZONE,
      todayDateOnly
    );

    const appointmentIds = appointmentRecords.map(a => a.id);
    if (appointmentIds.length === 0) {
      return [];
    }

    // Fetch full appointments with relations
    return this.prisma.appointment.findMany({
      where: { id: { in: appointmentIds } },
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

