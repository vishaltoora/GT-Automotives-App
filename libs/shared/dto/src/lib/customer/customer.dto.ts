export class CreateCustomerDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  phone!: string;
  address?: string;
}

export class UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export class CustomerDto {
  id!: string;
  userId!: string;
  email!: string;
  firstName?: string;
  lastName?: string;
  phone!: string;
  address?: string;
  vehicleCount?: number;
  createdAt!: Date;
  updatedAt!: Date;
}