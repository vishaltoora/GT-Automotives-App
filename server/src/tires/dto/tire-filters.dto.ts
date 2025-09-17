import { IsOptional, IsBoolean } from 'class-validator';
import { TireSearchDto } from './tire-search.dto';

export class TireFiltersDto extends TireSearchDto {
  @IsOptional()
  @IsBoolean()
  includeOutOfStock?: boolean;

  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;
}
