export class CreateCustomerDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  phone!: string;
  address?: string;
  businessName?: string;
}

export class UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  businessName?: string;
}

export class CustomerDto {
  id!: string;
  userId!: string;
  email!: string;
  firstName?: string;
  lastName?: string;
  phone!: string;
  address?: string;
  businessName?: string;
  vehicleCount?: number;
  createdAt!: Date;
  updatedAt!: Date;
}