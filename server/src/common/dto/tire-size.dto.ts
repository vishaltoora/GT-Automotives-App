import { IsString, IsOptional } from 'class-validator';

export class CreateTireSizeDto {
  @IsString()
  size!: string;
}

export class UpdateTireSizeDto implements Partial<CreateTireSizeDto> {
  @IsOptional()
  @IsString()
  size?: string;
}

export class TireSizeDto {
  id!: string;
  size!: string;
  createdAt!: Date;
  updatedAt!: Date;
}