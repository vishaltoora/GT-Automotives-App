import { Vendor } from '@prisma/client';
import { CreateVendorDto, UpdateVendorDto } from '../common/dto/vendor.dto';
export declare class VendorRepository {
    private prisma;
    create(data: CreateVendorDto): Promise<Vendor>;
    findAll(skip?: number, take?: number): Promise<Vendor[]>;
    findById(id: string): Promise<Vendor | null>;
    findByName(name: string): Promise<Vendor | null>;
    search(query: string, limit?: number): Promise<Vendor[]>;
    update(id: string, data: UpdateVendorDto): Promise<Vendor>;
    delete(id: string): Promise<Vendor>;
    count(): Promise<number>;
    findActive(): Promise<Vendor[]>;
}
//# sourceMappingURL=vendor.repository.d.ts.map