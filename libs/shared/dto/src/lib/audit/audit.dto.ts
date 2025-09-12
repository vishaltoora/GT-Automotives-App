import { 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsDateString,
  IsObject
} from 'class-validator';

// Audit Log DTOs
export class AuditLogDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  action!: string;

  @IsString()
  resource!: string;

  @IsUUID()
  resourceId!: string;

  @IsObject()
  @IsOptional()
  oldValue?: any;

  @IsObject()
  @IsOptional()
  newValue?: any;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsDateString()
  createdAt!: Date;
}

export class CreateAuditLogDto {
  @IsUUID()
  userId!: string;

  @IsString()
  action!: string;

  @IsString()
  resource!: string;

  @IsUUID()
  resourceId!: string;

  @IsObject()
  @IsOptional()
  oldValue?: any;

  @IsObject()
  @IsOptional()
  newValue?: any;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}