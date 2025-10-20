import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import {
  SetAvailabilityDto,
  TimeSlotOverrideDto,
  CheckAvailabilityDto,
  AvailableSlot,
} from '../common/dto/employee-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Set or update recurring weekly availability for an employee
   */
  async setRecurringAvailability(dto: SetAvailabilityDto) {
    // Validate time format
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check if employee exists
    const employee = await this.prisma.user.findUnique({
      where: { id: dto.employeeId },
      include: { role: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    // Upsert availability (update if exists, create if not)
    return this.prisma.employeeAvailability.upsert({
      where: {
        employeeId_dayOfWeek_startTime: {
          employeeId: dto.employeeId,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
        },
      },
      update: {
        endTime: dto.endTime,
        isAvailable: dto.isAvailable,
        updatedAt: new Date(),
      },
      create: {
        employeeId: dto.employeeId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isAvailable: dto.isAvailable,
      },
    });
  }

  /**
   * Get all recurring availability for an employee
   */
  async getEmployeeAvailability(employeeId: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return this.prisma.employeeAvailability.findMany({
      where: { employeeId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Delete a recurring availability slot
   * Both ADMIN and STAFF can delete any availability
   */
  async deleteRecurringAvailability(availabilityId: string, user: any) {
    // First, get the availability to verify it exists
    const availability = await this.prisma.employeeAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException(`Availability slot not found`);
    }

    // Both ADMIN and STAFF can delete any availability (no restriction)

    return this.prisma.employeeAvailability.delete({
      where: { id: availabilityId },
    });
  }

  /**
   * Add a time slot override (vacation, sick day, extra shift)
   */
  async addOverride(dto: TimeSlotOverrideDto) {
    // Validate time format
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check if employee exists
    const employee = await this.prisma.user.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    return this.prisma.timeSlotOverride.create({
      data: {
        employeeId: dto.employeeId,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isAvailable: dto.isAvailable,
        reason: dto.reason,
      },
    });
  }

  /**
   * Get all overrides for an employee within a date range
   */
  async getOverrides(employeeId: string, startDate: Date, endDate: Date) {
    return this.prisma.timeSlotOverride.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Delete an override
   */
  async deleteOverride(overrideId: string) {
    return this.prisma.timeSlotOverride.delete({
      where: { id: overrideId },
    });
  }

  /**
   * Check available time slots for a specific date and duration
   */
  async checkAvailableSlots(dto: CheckAvailabilityDto): Promise<AvailableSlot[]> {
    const dayOfWeek = dto.date.getDay();
    const dateOnly = new Date(dto.date);
    dateOnly.setUTCHours(0, 0, 0, 0);

    console.log('[CHECK AVAILABLE SLOTS] Checking for date:', {
      input: dto.date,
      normalized: dateOnly,
      iso: dateOnly.toISOString(),
    });

    // Get employees to check (specific employee or all)
    let employees;
    if (dto.employeeId) {
      const employee = await this.prisma.user.findUnique({
        where: { id: dto.employeeId },
        include: { role: true },
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
      }
      employees = [employee];
    } else {
      // Get all STAFF and ADMIN users
      employees = await this.prisma.user.findMany({
        where: {
          role: { name: { in: ['STAFF', 'ADMIN'] } },
          isActive: true,
        },
        include: { role: true },
      });
    }

    const availableSlots: AvailableSlot[] = [];

    for (const employee of employees) {
      // Get recurring availability for this day of week
      const recurringSlots = await this.prisma.employeeAvailability.findMany({
        where: {
          employeeId: employee.id,
          dayOfWeek,
          isAvailable: true,
        },
      });

      // Get overrides for this specific date
      const overrides = await this.prisma.timeSlotOverride.findMany({
        where: {
          employeeId: employee.id,
          date: dateOnly,
        },
      });

      // Get existing appointments for this date (check both old employeeId and new employees relation)
      const appointments = await this.prisma.appointment.findMany({
        where: {
          scheduledDate: dateOnly,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          OR: [
            { employeeId: employee.id },
            { employees: { some: { employeeId: employee.id } } }
          ],
        },
      });


      // Calculate the day start and end times from the recurring slots
      let dayStart = '09:00';
      let dayEnd = '17:00';

      if (recurringSlots.length > 0) {
        // Find the earliest start time and latest end time
        const startTimes = recurringSlots.map(s => s.startTime);
        const endTimes = recurringSlots.map(s => s.endTime);
        dayStart = startTimes.sort()[0]; // Earliest start
        dayEnd = endTimes.sort().reverse()[0]; // Latest end
      }


      // Generate time slots (every 15 minutes)
      const slots = this.generateTimeSlots(
        dayStart,
        dayEnd,
        15,
        recurringSlots,
        overrides,
        appointments,
        dto.duration
      );

      slots.forEach((slot) => {
        availableSlots.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.available,
        });
      });
    }

    return availableSlots;
  }

  /**
   * Check if a specific employee is available at a specific time
   */
  async isEmployeeAvailable(
    employeeId: string,
    date: Date,
    startTime: string,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<boolean | { available: false; reason: string; suggestion: string }> {
    const dayOfWeek = date.getDay();

    // Normalize date to start of day in UTC to match Prisma DateTime storage
    const dateOnly = new Date(date);
    dateOnly.setUTCHours(0, 0, 0, 0);

    console.log('[AVAILABILITY] Date normalization:', {
      inputDate: date,
      normalized: dateOnly,
      iso: dateOnly.toISOString(),
    });

    // Calculate end time
    const endTime = this.addMinutesToTime(startTime, duration);

    // 1. Check for date-specific overrides first (they take precedence)
    const overrides = await this.prisma.timeSlotOverride.findMany({
      where: {
        employeeId,
        date: dateOnly,
      },
    });

    // Check if time is blocked by an override
    for (const override of overrides) {
      if (!override.isAvailable && this.timeOverlaps(startTime, endTime, override.startTime, override.endTime)) {
        return {
          available: false,
          reason: `Employee has time off from ${override.startTime} to ${override.endTime}`,
          suggestion: override.reason || 'Employee is unavailable during this time',
        };
      }
    }

    // Check if there's an available override that covers this time
    const hasAvailableOverride = overrides.some(
      (override) =>
        override.isAvailable && this.timeInRange(startTime, duration, override.startTime, override.endTime)
    );

    // 2. Check recurring availability
    const recurringSlots = await this.prisma.employeeAvailability.findMany({
      where: {
        employeeId,
        dayOfWeek,
        isAvailable: true,
      },
    });

    console.log(`[AVAILABILITY] Checking time ${startTime} for ${duration} min (end: ${endTime})`);
    console.log(`[AVAILABILITY] Found ${recurringSlots.length} recurring slots:`);
    recurringSlots.forEach(slot => {
      const fits = this.timeInRange(startTime, duration, slot.startTime, slot.endTime);
      console.log(`  - Slot: ${slot.startTime} - ${slot.endTime}, Fits: ${fits}`);
    });

    const withinRecurringSlot = recurringSlots.some((slot) =>
      this.timeInRange(startTime, duration, slot.startTime, slot.endTime)
    );

    console.log(`[AVAILABILITY] Within recurring slot: ${withinRecurringSlot}`);

    // If no override and not in recurring slot, not available
    if (!hasAvailableOverride && !withinRecurringSlot) {
      const availableSlots = recurringSlots.map(s => `${s.startTime}-${s.endTime}`).join(', ');
      console.log(`[AVAILABILITY] ❌ NOT AVAILABLE - No recurring slot match`);
      return {
        available: false,
        reason: `Employee's working hours on this day: ${availableSlots || 'Not scheduled to work'}`,
        suggestion: availableSlots
          ? `Please choose a time within: ${availableSlots}`
          : 'Employee is not scheduled to work on this day',
      };
    }

    // 3. Check for appointment conflicts (double-booking)
    // Check both old employeeId and new employees relation
    const whereClause: any = {
      scheduledDate: dateOnly,
      status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      OR: [
        { employeeId },
        { employees: { some: { employeeId } } }
      ],
    };

    // Exclude the current appointment if updating (don't conflict with itself)
    if (excludeAppointmentId) {
      whereClause.id = { not: excludeAppointmentId };
    }

    console.log('[AVAILABILITY] Querying appointments with:', {
      whereClause,
      dateOnly: dateOnly.toISOString(),
    });

    const conflictingAppointments = await this.prisma.appointment.findMany({
      where: whereClause,
    });

    console.log(`[AVAILABILITY CHECK] Employee ${employeeId} on ${dateOnly.toISOString().split('T')[0]} at ${startTime}:`);
    console.log(`  - Found ${conflictingAppointments.length} existing appointments`);
    console.log(`  - Requested slot: ${startTime} - ${endTime} (${duration} min)`);

    if (conflictingAppointments.length > 0) {
      console.log('  - Existing appointments in DB:', conflictingAppointments.map(a => ({
        id: a.id,
        date: a.scheduledDate,
        time: a.scheduledTime,
      })));
    }

    for (const appointment of conflictingAppointments) {
      const appointmentEnd = appointment.endTime || this.addMinutesToTime(appointment.scheduledTime, appointment.duration);
      console.log(`  - Existing appointment: ${appointment.scheduledTime} - ${appointmentEnd}`);
      const overlaps = this.timeOverlaps(startTime, endTime, appointment.scheduledTime, appointmentEnd);
      console.log(`  - Checking overlap: ${startTime}-${endTime} vs ${appointment.scheduledTime}-${appointmentEnd} = ${overlaps}`);
      if (overlaps) {
        console.log(`  ❌ CONFLICT DETECTED! Overlaps with appointment ${appointment.id}`);
        return {
          available: false,
          reason: `Employee already has an appointment from ${appointment.scheduledTime} to ${appointmentEnd}`,
          suggestion: `Please choose a time after ${appointmentEnd}`,
        };
      }
    }

    console.log(`  ✅ No conflicts found - employee is available!`);

    return true;
  }

  /**
   * Helper: Generate time slots for a day
   */
  private generateTimeSlots(
    dayStart: string,
    dayEnd: string,
    incrementMinutes: number,
    recurringSlots: Array<{ startTime: string; endTime: string; isAvailable: boolean }>,
    overrides: Array<{ startTime: string; endTime: string; isAvailable: boolean }>,
    appointments: Array<{ scheduledTime: string; endTime?: string | null; duration: number }>,
    duration: number
  ) {
    const slots: { startTime: string; endTime: string; available: boolean }[] = [];
    let currentTime = dayStart;

    while (currentTime < dayEnd) {
      const slotEnd = this.addMinutesToTime(currentTime, duration);

      // Check if this slot is available
      const isRecurring = recurringSlots.some((slot) =>
        this.timeInRange(currentTime, duration, slot.startTime, slot.endTime)
      );

      const isOverrideBlocked = overrides.some(
        (override) => !override.isAvailable && this.timeOverlaps(currentTime, slotEnd, override.startTime, override.endTime)
      );

      const isOverrideAvailable = overrides.some(
        (override) => override.isAvailable && this.timeInRange(currentTime, duration, override.startTime, override.endTime)
      );

      const hasConflict = appointments.some((appt) => {
        const apptEnd = appt.endTime || this.addMinutesToTime(appt.scheduledTime, appt.duration);
        return this.timeOverlaps(currentTime, slotEnd, appt.scheduledTime, apptEnd);
      });

      const available = !isOverrideBlocked && (isOverrideAvailable || isRecurring) && !hasConflict;

      slots.push({
        startTime: currentTime,
        endTime: slotEnd,
        available,
      });

      currentTime = this.addMinutesToTime(currentTime, incrementMinutes);
    }

    return slots;
  }

  /**
   * Helper: Check if a time range is within a slot
   */
  private timeInRange(startTime: string, duration: number, slotStart: string, slotEnd: string): boolean {
    const endTime = this.addMinutesToTime(startTime, duration);
    return startTime >= slotStart && endTime <= slotEnd;
  }

  /**
   * Helper: Check if two time ranges overlap
   * Two appointments overlap if one starts before the other ends AND ends after the other starts
   * However, if one ends exactly when the other starts, they DO NOT overlap (back-to-back is allowed)
   */
  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    // Allow back-to-back appointments: 9:00-10:00 and 10:00-11:00 should NOT overlap
    // Overlapping means: start1 < end2 (starts before the other ends) AND end1 > start2 (ends after the other starts)
    // But we exclude the edge case where end1 === start2 or end2 === start1 (back-to-back)
    return start1 < end2 && end1 > start2 && !(end1 === start2 || end2 === start1);
  }

  /**
   * Helper: Add minutes to a time string
   */
  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }
}
