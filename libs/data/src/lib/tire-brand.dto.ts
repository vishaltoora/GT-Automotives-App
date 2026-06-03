import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTireBrandDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateTireBrandDto {
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
