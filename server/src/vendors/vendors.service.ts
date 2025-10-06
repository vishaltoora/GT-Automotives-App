import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import { CreateVendorDto, UpdateVendorDto, VendorResponseDto } from '../common/dto/vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private vendorRepository: VendorRepository) {}

  async create(createVendorDto: CreateVendorDto): Promise<VendorResponseDto> {
    // Check if vendor with same name already exists
    const existing = await this.vendorRepository.findByName(createVendorDto.name);
    if (existing) {
      throw new ConflictException(`Vendor with name '${createVendorDto.name}' already exists`);
    }

    const vendor = await this.vendorRepository.create(createVendorDto);
    return this.mapToResponse(vendor);
  }

  async findAll(page: number = 1, limit: number = 100): Promise<{
    data: VendorResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      this.vendorRepository.findAll(skip, limit),
      this.vendorRepository.count(),
    ]);

    return {
      data: vendors.map(v => this.mapToResponse(v)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<VendorResponseDto> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return this.mapToResponse(vendor);
  }

  async search(query: string, limit: number = 10): Promise<VendorResponseDto[]> {
    const vendors = await this.vendorRepository.search(query, limit);
    return vendors.map(v => this.mapToResponse(v));
  }

  async findActive(): Promise<VendorResponseDto[]> {
    const vendors = await this.vendorRepository.findActive();
    return vendors.map(v => this.mapToResponse(v));
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<VendorResponseDto> {
    // Check if vendor exists
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    // If updating name, check for duplicates
    if (updateVendorDto.name && updateVendorDto.name !== vendor.name) {
      const existing = await this.vendorRepository.findByName(updateVendorDto.name);
      if (existing) {
        throw new ConflictException(`Vendor with name '${updateVendorDto.name}' already exists`);
      }
    }

    const updated = await this.vendorRepository.update(id, updateVendorDto);
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<VendorResponseDto> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    const deleted = await this.vendorRepository.delete(id);
    return this.mapToResponse(deleted);
  }

  private mapToResponse(vendor: any): VendorResponseDto {
    return {
      id: vendor.id,
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      taxId: vendor.taxId,
      paymentTerms: vendor.paymentTerms,
      isActive: vendor.isActive,
      notes: vendor.notes,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
      _count: vendor._count,
    };
  }
}
