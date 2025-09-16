import { IsEnum, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Core Role Enums
export enum RoleName {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

export enum Resource {
  USERS = 'users',
  CUSTOMERS = 'customers',
  VEHICLES = 'vehicles',
  TIRES = 'tires',
  INVOICES = 'invoices',
  APPOINTMENTS = 'appointments',
  REPORTS = 'reports',
  SETTINGS = 'settings',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  APPROVE = 'approve',
}

// Permission Definition DTO
export class PermissionDefinitionDto {
  @IsEnum(Resource)
  resource!: Resource;

  @IsEnum(Action)
  action!: Action;
}

// Role Permissions Configuration DTO
export class RolePermissionsConfigDto {
  @IsEnum(RoleName)
  role!: RoleName;

  @ValidateNested({ each: true })
  @Type(() => PermissionDefinitionDto)
  @IsArray()
  permissions!: PermissionDefinitionDto[];
}

// Permissions Configuration
export const PERMISSIONS: Record<RoleName, PermissionDefinitionDto[]> = {
  // Customer permissions - limited to own data
  [RoleName.CUSTOMER]: [
    { resource: Resource.CUSTOMERS, action: Action.READ },    // Own data only
    { resource: Resource.VEHICLES, action: Action.READ },     // Own vehicles
    { resource: Resource.VEHICLES, action: Action.CREATE },
    { resource: Resource.VEHICLES, action: Action.UPDATE },
    { resource: Resource.INVOICES, action: Action.READ },     // Own invoices
    { resource: Resource.APPOINTMENTS, action: Action.CREATE },
    { resource: Resource.APPOINTMENTS, action: Action.READ },
    { resource: Resource.APPOINTMENTS, action: Action.UPDATE }, // Own appointments
  ],
  
  // Staff permissions - operational access
  [RoleName.STAFF]: [
    // All customer permissions
    { resource: Resource.CUSTOMERS, action: Action.READ },    // Own data only
    { resource: Resource.VEHICLES, action: Action.READ },     // Own vehicles
    { resource: Resource.VEHICLES, action: Action.CREATE },
    { resource: Resource.VEHICLES, action: Action.UPDATE },
    { resource: Resource.INVOICES, action: Action.READ },     // Own invoices
    { resource: Resource.APPOINTMENTS, action: Action.CREATE },
    { resource: Resource.APPOINTMENTS, action: Action.READ },
    { resource: Resource.APPOINTMENTS, action: Action.UPDATE },
    // Additional staff permissions
    { resource: Resource.CUSTOMERS, action: Action.CREATE },
    { resource: Resource.CUSTOMERS, action: Action.UPDATE },
    { resource: Resource.VEHICLES, action: Action.DELETE },
    { resource: Resource.TIRES, action: Action.READ },
    { resource: Resource.TIRES, action: Action.UPDATE },      // Inventory only
    { resource: Resource.INVOICES, action: Action.CREATE },
    { resource: Resource.INVOICES, action: Action.UPDATE },
    { resource: Resource.APPOINTMENTS, action: Action.DELETE },
  ],
  
  // Admin permissions - full access plus management
  [RoleName.ADMIN]: [
    // All staff permissions
    { resource: Resource.CUSTOMERS, action: Action.READ },
    { resource: Resource.CUSTOMERS, action: Action.CREATE },
    { resource: Resource.CUSTOMERS, action: Action.UPDATE },
    { resource: Resource.VEHICLES, action: Action.READ },
    { resource: Resource.VEHICLES, action: Action.CREATE },
    { resource: Resource.VEHICLES, action: Action.UPDATE },
    { resource: Resource.VEHICLES, action: Action.DELETE },
    { resource: Resource.TIRES, action: Action.READ },
    { resource: Resource.TIRES, action: Action.UPDATE },
    { resource: Resource.INVOICES, action: Action.CREATE },
    { resource: Resource.INVOICES, action: Action.READ },
    { resource: Resource.INVOICES, action: Action.UPDATE },
    { resource: Resource.APPOINTMENTS, action: Action.CREATE },
    { resource: Resource.APPOINTMENTS, action: Action.READ },
    { resource: Resource.APPOINTMENTS, action: Action.UPDATE },
    { resource: Resource.APPOINTMENTS, action: Action.DELETE },
    // Admin-only permissions
    { resource: Resource.USERS, action: Action.CREATE },
    { resource: Resource.USERS, action: Action.READ },
    { resource: Resource.USERS, action: Action.UPDATE },
    { resource: Resource.USERS, action: Action.DELETE },
    { resource: Resource.CUSTOMERS, action: Action.DELETE },
    { resource: Resource.TIRES, action: Action.CREATE },
    { resource: Resource.TIRES, action: Action.DELETE },
    { resource: Resource.INVOICES, action: Action.DELETE },
    { resource: Resource.INVOICES, action: Action.APPROVE },
    { resource: Resource.REPORTS, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.EXPORT },
    { resource: Resource.SETTINGS, action: Action.READ },
    { resource: Resource.SETTINGS, action: Action.UPDATE },
  ],
};

// Invoice-related enums
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  E_TRANSFER = 'E_TRANSFER',
  FINANCING = 'FINANCING',
}

export enum InvoiceItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER',
}