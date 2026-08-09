import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * Update the invoice terms & conditions for a company. The wording is a
 * liability statement authored by the business, so it lives in the database and
 * is editable from admin settings rather than being baked into the templates.
 */
export class UpdateCompanyTermsDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000, {
    message: 'Terms and conditions cannot exceed 4000 characters',
  })
  termsAndConditions?: string | null;
}

/**
 * Update the window the employee time clock is open for.
 *
 * Times are business-timezone wall-clock (HH:mm) rather than instants: the shop
 * opens at 8 AM local whatever the server's clock says, and daylight saving
 * must not shift it.
 */
export class UpdateCompanyTimeClockHoursDto {
  @IsOptional()
  @IsBoolean()
  timeClockWindowEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Opening time must be a 24-hour time in HH:mm format',
  })
  timeClockOpensAt?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Closing time must be a 24-hour time in HH:mm format',
  })
  timeClockClosesAt?: string;
}
