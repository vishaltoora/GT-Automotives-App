import { VendorRepository } from './vendor.repository';
import { CreateVendorDto, UpdateVendorDto, VendorResponseDto } from '../common/dto/vendor.dto';
export declare class VendorsService {
    private vendorRepository;
    constructor(vendorRepository: VendorRepository);
    create(createVendorDto: CreateVendorDto): Promise<VendorResponseDto>;
    findAll(page?: number, limit?: number): Promise<{
        data: VendorResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<VendorResponseDto>;
    search(query: string, limit?: number): Promise<VendorResponseDto[]>;
    findActive(): Promise<VendorResponseDto[]>;
    update(id: string, updateVendorDto: UpdateVendorDto): Promise<VendorResponseDto>;
    remove(id: string): Promise<VendorResponseDto>;
    private mapToResponse;
}
//# sourceMappingURL=vendors.service.d.ts.map