import { IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name!: string;
}

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class LocationDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}

export class LocationResponseDto extends LocationDto {}
