import { TireResponseDto } from './tire-response.dto';

export class TireSearchResultDto {
  items!: TireResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
  hasMore!: boolean;
}
