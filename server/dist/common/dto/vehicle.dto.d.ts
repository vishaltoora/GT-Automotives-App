export declare class CreateVehicleDto {
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
    customerId: string;
}
export declare class UpdateVehicleDto {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    mileage?: number;
    customerId?: string;
}
export declare class VehicleResponseDto {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    color?: string;
    customerId: string;
    customer?: any;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=vehicle.dto.d.ts.map