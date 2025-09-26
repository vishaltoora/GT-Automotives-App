import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VehicleRepository } from './repositories/vehicle.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { CreateVehicleDto } from '../common/dto/vehicle.dto';
import { UpdateVehicleDto } from '../common/dto/vehicle.dto';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly auditRepository: AuditRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string, userRole: string) {
    // Verify customer exists
    const customer = await this.customerRepository.findById(createVehicleDto.customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Customer role validation would require proper customer-user mapping
    // For now, only staff and admin can create vehicles
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle creation needs proper customer context implementation');
    }

    // Check for duplicate VIN if provided
    if (createVehicleDto.vin) {
      const existingVehicle = await this.vehicleRepository.findByVin(createVehicleDto.vin);
      if (existingVehicle) {
        throw new BadRequestException('A vehicle with this VIN already exists');
      }
    }

    const vehicle = await this.vehicleRepository.create({
      customer: { connect: { id: createVehicleDto.customerId } },
      make: createVehicleDto.make,
      model: createVehicleDto.model,
      year: createVehicleDto.year,
      vin: createVehicleDto.vin,
      licensePlate: createVehicleDto.licensePlate,
      mileage: createVehicleDto.mileage,
    });

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'CREATE_VEHICLE',
      entityType: 'vehicle',
      entityId: vehicle.id,
      newValue: vehicle as any,
    });

    return this.vehicleRepository.findOneWithDetails(vehicle.id);
  }

  async findAll(userId: string, userRole: string) {
    // Customer role access requires proper customer-user context mapping
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle access needs proper customer context implementation');
    }

    // Staff and admin can see all vehicles
    return this.vehicleRepository.findAllWithDetails();
  }

  async findByCustomer(customerId: string, userId: string, userRole: string) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Customer role validation requires proper customer context
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle access needs proper customer context implementation');
    }

    return this.vehicleRepository.findByCustomer(customerId);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findOneWithDetails(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Customer role validation requires proper customer context
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle access needs proper customer context implementation');
    }

    // Get vehicle statistics
    const stats = await this.vehicleRepository.getVehicleStats(id);

    return {
      ...vehicle,
      stats,
    };
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Customer role validation requires proper customer context
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle updates need proper customer context implementation');
    }

    // Check for duplicate VIN if updating
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const existingVehicle = await this.vehicleRepository.findByVin(updateVehicleDto.vin);
      if (existingVehicle) {
        throw new BadRequestException('A vehicle with this VIN already exists');
      }
    }

    const updatedVehicle = await this.vehicleRepository.update(
      id,
      {
        ...(updateVehicleDto.make && { make: updateVehicleDto.make }),
        ...(updateVehicleDto.model && { model: updateVehicleDto.model }),
        ...(updateVehicleDto.year && { year: updateVehicleDto.year }),
        ...(updateVehicleDto.vin !== undefined && { vin: updateVehicleDto.vin }),
        ...(updateVehicleDto.licensePlate !== undefined && { licensePlate: updateVehicleDto.licensePlate }),
        ...(updateVehicleDto.mileage !== undefined && { mileage: updateVehicleDto.mileage }),
      }
    );

    // Log the action if not a self-update
    if (userRole !== 'CUSTOMER') {
      await this.auditRepository.create({
        userId,
        action: 'UPDATE_VEHICLE',
        entityType: 'vehicle',
        resourceId: id,
        oldValue: vehicle as any,
        newValue: updatedVehicle,
      });
    }

    return this.vehicleRepository.findOneWithDetails(id);
  }

  async remove(id: string, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Customer role validation requires proper customer context
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle deletion needs proper customer context implementation');
    } else if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete vehicles');
    }

    // Check for existing invoices or appointments
    const hasInvoices = await this.prisma.invoice.count({
      where: { vehicleId: id },
    });

    const hasAppointments = await this.prisma.appointment.count({
      where: { vehicleId: id },
    });

    if (hasInvoices > 0 || hasAppointments > 0) {
      throw new BadRequestException(
        'Cannot delete vehicle with existing service history. Please contact an administrator.',
      );
    }

    await this.vehicleRepository.delete(id);

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'DELETE_VEHICLE',
      entityType: 'vehicle',
      entityId: id,
      oldValue: vehicle as any,
    });

    return { message: 'Vehicle deleted successfully' };
  }

  async search(searchTerm: string, userId: string, userRole: string) {
    const vehicles = await this.vehicleRepository.search(searchTerm);

    // Filter results for customers
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle search needs proper customer context implementation');
    }

    return vehicles;
  }

  async updateMileage(id: string, mileage: number, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Validate mileage (cannot decrease)
    if (vehicle.mileage && mileage < vehicle.mileage) {
      throw new BadRequestException('Mileage cannot be decreased');
    }

    // Customer role validation requires proper customer context
    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException('Customer vehicle updates need proper customer context implementation');
    }

    const updatedVehicle = await this.vehicleRepository.update(
      id,
      { mileage }
    );

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'UPDATE_VEHICLE_MILEAGE',
      entityType: 'vehicle',
      entityId: id,
      oldValue: { mileage: vehicle.mileage },
      newValue: { mileage },
    });

    return updatedVehicle;
  }
}