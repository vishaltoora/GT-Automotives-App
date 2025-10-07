import { ServiceDto, CreateServiceDto, UpdateServiceDto } from '@gt-automotive/data';
declare class ServiceService {
    getAll(): Promise<ServiceDto[]>;
    create(data: CreateServiceDto): Promise<ServiceDto>;
    update(id: string, data: UpdateServiceDto): Promise<ServiceDto>;
    delete(id: string): Promise<void>;
}
export declare const serviceService: ServiceService;
export default ServiceService;
//# sourceMappingURL=service.service.d.ts.map