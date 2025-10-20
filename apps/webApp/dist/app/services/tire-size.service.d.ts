export interface TireSize {
    id: string;
    size: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateTireSizeDto {
    size: string;
}
export interface UpdateTireSizeDto {
    size?: string;
}
export declare class TireSizeService {
    private static readonly BASE_URL;
    static getAll(): Promise<TireSize[]>;
    static getSizes(): Promise<string[]>;
    static create(data: CreateTireSizeDto): Promise<TireSize>;
    static update(id: string, data: UpdateTireSizeDto): Promise<TireSize>;
    static delete(id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=tire-size.service.d.ts.map