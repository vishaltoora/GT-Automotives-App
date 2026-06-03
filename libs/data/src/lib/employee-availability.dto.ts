import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class SetAvailabilityDto {
  @IsString()
  employeeId!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
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
  employeeId?: string;

  @Type(() => Date)
  @IsDate()
  date!: Date;

  @IsInt()
  @Min(15)
  @Max(480)
  @Type(() => Number)
  duration!: number;
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
  @Type(() => Number)
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
  @Type(() => Number)
  repeatWeeks?: number;
}
