import { TireResponseDto } from './tire-response.dto';

export class InventoryReportDto {
  totalTires!: number;
  totalValue!: number;
  lowStockItems!: TireResponseDto[];
  outOfStockItems!: TireResponseDto[];
  topSellingTires!: TireResponseDto[];
  reportDate!: Date;
}
