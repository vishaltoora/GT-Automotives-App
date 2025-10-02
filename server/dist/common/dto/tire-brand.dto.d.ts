export declare class CreateTireBrandDto {
    name: string;
    imageUrl?: string;
}
export declare class UpdateTireBrandDto implements Partial<CreateTireBrandDto> {
    name?: string;
    imageUrl?: string;
}
export declare class TireBrandDto {
    id: string;
    name: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=tire-brand.dto.d.ts.map