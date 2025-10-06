import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorResponseDto, VendorSearchDto } from '../common/dto/vendor.dto';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    create(createVendorDto: CreateVendorDto): Promise<VendorResponseDto>;
    findAll(page?: string, limit?: string): Promise<{
        data: VendorResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    search(searchDto: VendorSearchDto): Promise<VendorResponseDto[]>;
    findActive(): Promise<VendorResponseDto[]>;
    findOne(id: string): Promise<VendorResponseDto>;
    update(id: string, updateVendorDto: UpdateVendorDto): Promise<VendorResponseDto>;
    remove(id: string): Promise<VendorResponseDto>;
}
//# sourceMappingURL=vendors.controller.d.ts.map