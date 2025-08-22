import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VehicleRepository } from './repositories/vehicle.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuditRepository } from '../audit/repositories/audit.repository';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly auditRepository: AuditRepository,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string, userRole: string) {
    // Verify customer exists
    const customer = await this.customerRepository.findById(createVehicleDto.customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Customers can only add vehicles to their own profile
    if (userRole === 'customer' && customer.userId !== userId) {
      throw new ForbiddenException('You can only add vehicles to your own profile');
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
      resource: 'vehicle',
      resourceId: vehicle.id,
      newValue: vehicle,
    });

    return this.vehicleRepository.findOneWithDetails(vehicle.id);
  }

  async findAll(userId: string, userRole: string) {
    // Customers can only see their own vehicles
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer) {
        return [];
      }
      return this.vehicleRepository.findByCustomer(customer.id);
    }

    // Staff and admin can see all vehicles
    return this.vehicleRepository.findAllWithDetails();
  }

  async findByCustomer(customerId: string, userId: string, userRole: string) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Customers can only see their own vehicles
    if (userRole === 'customer' && customer.userId !== userId) {
      throw new ForbiddenException('You can only view your own vehicles');
    }

    return this.vehicleRepository.findByCustomer(customerId);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findOneWithDetails(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Customers can only see their own vehicles
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer || vehicle.customerId !== customer.id) {
        throw new ForbiddenException('You can only view your own vehicles');
      }
    }

    // Get vehicle statistics
    const stats = await this.vehicleRepository.getVehicleStats(id);

    return {
      ...vehicle,
      stats,
    };
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findOne({ id });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Customers can only update their own vehicles
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer || vehicle.customerId !== customer.id) {
        throw new ForbiddenException('You can only update your own vehicles');
      }
    }

    // Check for duplicate VIN if updating
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const existingVehicle = await this.vehicleRepository.findByVin(updateVehicleDto.vin);
      if (existingVehicle) {
        throw new BadRequestException('A vehicle with this VIN already exists');
      }
    }

    const updatedVehicle = await this.vehicleRepository.update(
      { id },
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
    if (userRole !== 'customer') {
      await this.auditRepository.create({
        userId,
        action: 'UPDATE_VEHICLE',
        resource: 'vehicle',
        resourceId: id,
        oldValue: vehicle,
        newValue: updatedVehicle,
      });
    }

    return this.vehicleRepository.findOneWithDetails(id);
  }

  async remove(id: string, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findOne({ id });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Only admin can delete vehicles, or customers can delete their own
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer || vehicle.customerId !== customer.id) {
        throw new ForbiddenException('You can only delete your own vehicles');
      }
    } else if (userRole !== 'admin') {
      throw new ForbiddenException('Only administrators can delete vehicles');
    }

    // Check for existing invoices or appointments
    const hasInvoices = await this.vehicleRepository.prisma.invoice.count({
      where: { vehicleId: id },
    });

    const hasAppointments = await this.vehicleRepository.prisma.appointment.count({
      where: { vehicleId: id },
    });

    if (hasInvoices > 0 || hasAppointments > 0) {
      throw new BadRequestException(
        'Cannot delete vehicle with existing service history. Please contact an administrator.',
      );
    }

    await this.vehicleRepository.delete({ id });

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'DELETE_VEHICLE',
      resource: 'vehicle',
      resourceId: id,
      oldValue: vehicle,
    });

    return { message: 'Vehicle deleted successfully' };
  }

  async search(searchTerm: string, userId: string, userRole: string) {
    const vehicles = await this.vehicleRepository.search(searchTerm);

    // Filter results for customers
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer) {
        return [];
      }
      return vehicles.filter(v => v.customerId === customer.id);
    }

    return vehicles;
  }

  async updateMileage(id: string, mileage: number, userId: string, userRole: string) {
    const vehicle = await this.vehicleRepository.findOne({ id });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Validate mileage (cannot decrease)
    if (vehicle.mileage && mileage < vehicle.mileage) {
      throw new BadRequestException('Mileage cannot be decreased');
    }

    // Customers can only update their own vehicles
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      if (!customer || vehicle.customerId !== customer.id) {
        throw new ForbiddenException('You can only update your own vehicles');
      }
    }

    const updatedVehicle = await this.vehicleRepository.update(
      { id },
      { mileage }
    );

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'UPDATE_VEHICLE_MILEAGE',
      resource: 'vehicle',
      resourceId: id,
      oldValue: { mileage: vehicle.mileage },
      newValue: { mileage },
    });

    return updatedVehicle;
  }
}