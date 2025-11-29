import { IsEnum, IsOptional } from 'class-validator';

export class UpdateBookingRequestDto {
  @IsOptional()
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'PROCESSED'])
  status?: string;
}
