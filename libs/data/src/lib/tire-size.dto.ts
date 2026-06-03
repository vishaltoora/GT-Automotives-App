import { IsOptional, IsString } from 'class-validator';

export class CreateTireSizeDto {
  @IsString()
  size!: string;
}

export class UpdateTireSizeDto {
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
