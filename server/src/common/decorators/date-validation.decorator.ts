/**
 * Date Validation Decorators for DTOs
 *
 * CRITICAL TIMEZONE RULES:
 * 1. NEVER use @Type(() => Date) on date fields in DTOs
 * 2. ALWAYS use @IsDateString() for required date fields
 * 3. ALWAYS use @IsOptionalDateString() for optional date fields
 * 4. Date fields in DTOs must be string type, not Date type
 *
 * Why: @Type(() => Date) converts "2025-11-18" to "2025-11-18T00:00:00.000Z"
 * This UTC conversion causes timezone bugs where dates shift by ±1 day
 *
 * Business Timezone: America/Vancouver (PST/PDT)
 */

import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, IsOptional } from 'class-validator';

/**
 * Validates YYYY-MM-DD date strings (REQUIRED field)
 *
 * USE THIS instead of: @Type(() => Date) @IsDate()
 *
 * @example
 * export class CreateAppointmentDto {
 *   @IsDateString()
 *   scheduledDate!: string; // ✅ Correct
 *
 *   // ❌ WRONG - causes timezone conversion:
 *   // @Type(() => Date)
 *   // @IsDate()
 *   // scheduledDate!: Date;
 * }
 *
 * @returns Composite decorator for required date string validation
 */
export function IsDateString() {
  return applyDecorators(
    IsString({ message: 'Date must be a string' }),
    Matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-18)'
    })
  );
}

/**
 * Validates YYYY-MM-DD date strings (OPTIONAL field)
 *
 * USE THIS for optional date fields in DTOs
 *
 * @example
 * export class AppointmentQueryDto {
 *   @IsOptionalDateString()
 *   startDate?: string; // ✅ Correct
 *
 *   @IsOptionalDateString()
 *   endDate?: string; // ✅ Correct
 * }
 *
 * @returns Composite decorator for optional date string validation
 */
export function IsOptionalDateString() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: 'Date must be a string' }),
    Matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format (e.g., 2025-11-18)'
    })
  );
}

/**
 * Validates ISO 8601 timestamp strings (REQUIRED field)
 *
 * USE THIS for timestamp fields (date + time)
 *
 * Format: YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss.sssZ
 *
 * @example
 * export class CreateEventDto {
 *   @IsTimestampString()
 *   eventDateTime!: string; // ✅ "2025-11-18T14:30:00"
 * }
 *
 * @returns Composite decorator for required timestamp string validation
 */
export function IsTimestampString() {
  return applyDecorators(
    IsString({ message: 'Timestamp must be a string' }),
    Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, {
      message: 'Timestamp must be in ISO 8601 format (e.g., 2025-11-18T14:30:00)'
    })
  );
}

/**
 * Validates ISO 8601 timestamp strings (OPTIONAL field)
 *
 * USE THIS for optional timestamp fields
 *
 * @example
 * export class UpdateEventDto {
 *   @IsOptionalTimestampString()
 *   eventDateTime?: string;
 * }
 *
 * @returns Composite decorator for optional timestamp string validation
 */
export function IsOptionalTimestampString() {
  return applyDecorators(
    IsOptional(),
    IsString({ message: 'Timestamp must be a string' }),
    Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, {
      message: 'Timestamp must be in ISO 8601 format (e.g., 2025-11-18T14:30:00)'
    })
  );
}
