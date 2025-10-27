import { VendorDto, CreateVendorDto, UpdateVendorDto, VendorListResponse } from '@gt-automotive/data';
export type Vendor = VendorDto;
export type { CreateVendorDto, UpdateVendorDto, VendorListResponse };
declare const vendorService: {
    getAll(page?: number, limit?: number): Promise<VendorListResponse>;
    getById(id: string): Promise<Vendor>;
    search(query: string, limit?: number): Promise<Vendor[]>;
    getActive(): Promise<Vendor[]>;
    create(data: CreateVendorDto): Promise<Vendor>;
    update(id: string, data: UpdateVendorDto): Promise<Vendor>;
    delete(id: string): Promise<Vendor>;
};
export default vendorService;
//# sourceMappingURL=vendor.service.d.ts.map