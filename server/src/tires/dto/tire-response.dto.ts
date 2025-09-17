import { CreateTireDto } from './create-tire.dto';

export class TireResponseDto extends CreateTireDto {
  id!: string;
  inStock!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  createdBy!: string;
}
