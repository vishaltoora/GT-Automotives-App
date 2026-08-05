import { IsOptional, IsString, MaxLength } from 'class-validator';

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
