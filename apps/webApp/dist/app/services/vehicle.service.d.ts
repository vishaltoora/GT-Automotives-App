export interface Vehicle {
    id: string;
    customerId: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
    customer?: {
        id: string;
        user: {
            id: string;
            email: string;
            firstName?: string;
            lastName?: string;
        };
    };
    _count?: {
        invoices: number;
        appointments: number;
    };
    stats?: {
        serviceCount: number;
        totalSpent: number;
        lastServiceDate: Date | null;
        nextAppointment: any | null;
    };
    createdAt: string;
    updatedAt: string;
}
export interface CreateVehicleDto {
    customerId: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
}
export interface UpdateVehicleDto {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
}
declare class VehicleService {
    private getAuthHeader;
    getAllVehicles(): Promise<Vehicle[]>;
    getVehicle(id: string): Promise<Vehicle>;
    getCustomerVehicles(customerId: string): Promise<Vehicle[]>;
    createVehicle(data: CreateVehicleDto): Promise<Vehicle>;
    updateVehicle(id: string, data: UpdateVehicleDto): Promise<Vehicle>;
    updateMileage(id: string, mileage: number): Promise<Vehicle>;
    deleteVehicle(id: string): Promise<void>;
    searchVehicles(searchTerm: string): Promise<Vehicle[]>;
}
export declare const vehicleService: VehicleService;
export {};
//# sourceMappingURL=vehicle.service.d.ts.map