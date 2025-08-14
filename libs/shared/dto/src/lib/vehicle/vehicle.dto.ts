export class CreateVehicleDto {
  customerId!: string;
  make!: string;
  model!: string;
  year!: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
}

export class UpdateVehicleDto {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
}

export class VehicleDto {
  id!: string;
  customerId!: string;
  make!: string;
  model!: string;
  year!: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
  createdAt!: Date;
  updatedAt!: Date;
}