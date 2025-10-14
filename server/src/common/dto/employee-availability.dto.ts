import { IsString, IsInt, IsBoolean, IsOptional, IsDate, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM 24-hour format

export class SetAvailabilityDto {
  @IsString()
  employeeId!: string;

  @IsInt()
  @Min(0) // Sunday
  @Max(6) // Saturday
  dayOfWeek!: number;

  @IsString()
  @Matches(TIME_FORMAT_REGEX, { message: 'Start time must be in HH:MM format (24-hour)' })
  startTime!: string;

  @IsString()
  @Matches(TIME_FORMAT_REGEX, { message: 'End time must be in HH:MM format (24-hour)' })
  endTime!: string;

  @IsBoolean()
  isAvailable!: boolean;
}

export class TimeSlotOverrideDto {
  @IsString()
  employeeId!: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsString()
  @Matches(TIME_FORMAT_REGEX, { message: 'Start time must be in HH:MM format (24-hour)' })
  startTime!: string;

  @IsString()
  @Matches(TIME_FORMAT_REGEX, { message: 'End time must be in HH:MM format (24-hour)' })
  endTime!: string;

  @IsBoolean()
  isAvailable!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CheckAvailabilityDto {
  @IsOptional()
  @IsString()
  employeeId?: string; // If null, check all employees

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsInt()
  @Min(15)
  @Max(480)
  duration!: number; // minutes
}

export class AvailableSlot {
  employeeId!: string;
  employeeName!: string;
  startTime!: string;
  endTime!: string;
  available!: boolean;
}

export class BulkAvailabilityDto {
  @IsString()
  employeeId!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @Matches(TIME_FORMAT_REGEX)
  startTime!: string;

  @IsString()
  @Matches(TIME_FORMAT_REGEX)
  endTime!: string;

  @IsBoolean()
  isAvailable!: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(52)
  repeatWeeks?: number; // How many weeks to apply this to
}
