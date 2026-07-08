import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import {
  CreateServiceTypeDto,
  UpdateServiceTypeDto,
  ServiceTypeResponseDto,
} from '@gt-automotive/data';
import { ServiceTypeRepository } from './service-type.repository';

@Injectable()
export class ServiceTypesService {
  constructor(private readonly repository: ServiceTypeRepository) {}

  async findAll(activeOnly = false): Promise<ServiceTypeResponseDto[]> {
    const items = await this.repository.findAll(activeOnly);
    return items.map((item) => this.mapToResponse(item));
  }

  async findOne(id: string): Promise<ServiceTypeResponseDto> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Service type ${id} not found`);
    }
    return this.mapToResponse(item);
  }

  async create(dto: CreateServiceTypeDto): Promise<ServiceTypeResponseDto> {
    const code = this.normalizeCode(dto.code || dto.name);

    const existing = await this.repository.findByCode(code);
    if (existing) {
      throw new ConflictException(
        `A service type with code '${code}' already exists`
      );
    }

    const sortOrder =
      dto.sortOrder ?? (await this.repository.maxSortOrder()) + 1;

    const created = await this.repository.create({
      code,
      name: dto.name,
      duration: dto.duration,
      isActive: dto.isActive ?? true,
      sortOrder,
    });
    return this.mapToResponse(created);
  }

  async update(
    id: string,
    dto: UpdateServiceTypeDto
  ): Promise<ServiceTypeResponseDto> {
    await this.findOne(id);

    // The code is a stable reference stored on historical appointments, so
    // only allow changing it explicitly and guard against collisions.
    let code: string | undefined;
    if (dto.code !== undefined) {
      code = this.normalizeCode(dto.code);
      const existing = await this.repository.findByCode(code);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `A service type with code '${code}' already exists`
        );
      }
    }

    const updated = await this.repository.update(id, {
      ...(code !== undefined && { code }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.duration !== undefined && { duration: dto.duration }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
    });
    return this.mapToResponse(updated);
  }

  async remove(id: string): Promise<ServiceTypeResponseDto> {
    await this.findOne(id);
    const deleted = await this.repository.delete(id);
    return this.mapToResponse(deleted);
  }

  // Derive a stable UPPER_SNAKE code from free text.
  private normalizeCode(input: string): string {
    return input
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private mapToResponse(item: ServiceType): ServiceTypeResponseDto {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      duration: item.duration,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
