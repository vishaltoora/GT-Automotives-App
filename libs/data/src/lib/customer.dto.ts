import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ValidateIf((o) => o.phone !== '' && o.phone !== null && o.phone !== undefined)
  @Matches(/^[\d\s\-\(\)]+$/, { message: 'Phone number can only contain digits, spaces, dashes, and parentheses' })
  @Matches(/\d{10}/, { message: 'Phone number must contain exactly 10 digits' })
  phone?: string;

  @ValidateIf((o) => o.address !== '' && o.address !== null && o.address !== undefined)
  @IsString()
  address?: string;

  @ValidateIf((o) => o.businessName !== '' && o.businessName !== null && o.businessName !== undefined)
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsBoolean()
  smsOptedIn?: boolean;

  @IsOptional()
  @IsBoolean()
  smsAppointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  smsServiceUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  smsPromotional?: boolean;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ValidateIf((o) => o.phone !== '' && o.phone !== null && o.phone !== undefined)
  @Matches(/^[\d\s\-\(\)]+$/, { message: 'Phone number can only contain digits, spaces, dashes, and parentheses' })
  @Matches(/\d{10}/, { message: 'Phone number must contain exactly 10 digits' })
  phone?: string;

  @ValidateIf((o) => o.address !== '' && o.address !== null && o.address !== undefined)
  @IsString()
  address?: string;

  @ValidateIf((o) => o.businessName !== '' && o.businessName !== null && o.businessName !== undefined)
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsBoolean()
  smsOptedIn?: boolean;

  @IsOptional()
  @IsBoolean()
  smsAppointmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  smsServiceUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  smsPromotional?: boolean;
}

export interface SmsPreferenceDto {
  optedIn: boolean;
  appointmentReminders: boolean;
  serviceUpdates: boolean;
  promotional: boolean;
  dailySummary?: boolean;
}

export interface CustomerStatsDto {
  totalSpent: number;
  outstandingBalance: number;
  vehicleCount: number;
  appointmentCount: number;
  upcomingAppointments: number;
  lastVisitDate: string | Date | null;
}

export interface CustomerCountDto {
  invoices: number;
  appointments: number;
  vehicles: number;
}

export interface CustomerVehicleDto {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
  _count?: {
    invoices: number;
    appointments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerInvoiceDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  vehicleId?: string;
  vehicle?: CustomerVehicleDto;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  gstAmount: number;
  total: number;
  invoiceDate?: string;
  createdAt: string;
  updatedAt: string;
  items?: CustomerInvoiceItemDto[];
}

export interface CustomerAppointmentEmployeeDto {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CustomerAppointmentDto {
  id: string;
  customerId: string;
  vehicleId?: string;
  vehicle?: CustomerVehicleDto;
  scheduledDate: string;
  serviceType: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  employees?: CustomerAppointmentEmployeeDto[];
  paymentAmount?: number;
  expectedAmount?: number;
  paymentBreakdown?: unknown;
  createdAt: string;
  updatedAt: string;
}

export class CustomerResponseDto {
  @IsString()
  id!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  vehicles?: CustomerVehicleDto[];

  @IsOptional()
  smsPreference?: SmsPreferenceDto | null;

  @IsOptional()
  _count?: CustomerCountDto;

  @IsOptional()
  stats?: CustomerStatsDto;

  @IsOptional()
  invoices?: CustomerInvoiceDto[];

  @IsOptional()
  appointments?: CustomerAppointmentDto[];

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}

// Legacy type aliases for backward compatibility
export type CustomerDto = CustomerResponseDto;
