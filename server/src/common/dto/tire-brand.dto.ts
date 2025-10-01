import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateTireBrandDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateTireBrandDto implements Partial<CreateTireBrandDto> {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class TireBrandDto {
  id!: string;
  name!: string;
  imageUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
}