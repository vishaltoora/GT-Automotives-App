export class CreateCustomerDto {
  firstName!: string;
  lastName!: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
}

export class UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
}

export class CustomerDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  vehicleCount?: number;
  createdAt!: Date;
  updatedAt!: Date;
}