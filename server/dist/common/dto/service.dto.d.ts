export declare class CreateServiceDto {
    name: string;
    description?: string;
    unitPrice: number;
}
export declare class UpdateServiceDto implements Partial<CreateServiceDto> {
    name?: string;
    description?: string;
    unitPrice?: number;
}
export declare class ServiceDto {
    id: string;
    name: string;
    description?: string;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=service.dto.d.ts.map