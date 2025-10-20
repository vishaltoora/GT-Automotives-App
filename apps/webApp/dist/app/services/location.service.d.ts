export interface Location {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateLocationDto {
    name: string;
}
export interface UpdateLocationDto {
    name?: string;
}
export declare class LocationService {
    private static readonly BASE_URL;
    static getAll(): Promise<Location[]>;
    static getLocations(): Promise<string[]>;
    static create(data: CreateLocationDto): Promise<Location>;
    static update(id: string, data: UpdateLocationDto): Promise<Location>;
    static delete(id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=location.service.d.ts.map