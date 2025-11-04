export interface TireBrand {
    id: string;
    name: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateTireBrandDto {
    name: string;
    imageUrl?: string;
}
export interface UpdateTireBrandDto {
    name?: string;
    imageUrl?: string;
}
export declare class TireBrandService {
    private static readonly BASE_URL;
    static getAll(): Promise<TireBrand[]>;
    static getBrands(): Promise<string[]>;
    static create(data: CreateTireBrandDto): Promise<TireBrand>;
    static update(id: string, data: UpdateTireBrandDto): Promise<TireBrand>;
    static delete(id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=tire-brand.service.d.ts.map