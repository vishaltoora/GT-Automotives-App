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
    vin?: string | null;
    licensePlate?: string | null;
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
export declare class DecodeVinResponseDto {
    vin: string;
    make?: string;
    model?: string;
    year?: number;
    trim?: string;
    bodyClass?: string;
    vehicleType?: string;
    engine?: string;
    fuelType?: string;
    warnings: string[];
    rawProvider: 'NHTSA_VPIC';
}
//# sourceMappingURL=vehicle.dto.d.ts.map