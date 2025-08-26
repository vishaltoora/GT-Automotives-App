import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomerRepository } from './repositories/customer.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly auditRepository: AuditRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, createdBy: string) {
    // Check for existing customer with same email if provided
    if (createCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findByEmail(createCustomerDto.email);
      if (existingCustomer) {
        throw new BadRequestException('A customer with this email already exists');
      }
    }

    // Create customer directly without user account
    const customer = await this.prisma.customer.create({
      data: {
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        address: createCustomerDto.address,
        businessName: createCustomerDto.businessName,
      },
    });

    // Log the action
    await this.auditRepository.create({
      userId: createdBy,
      action: 'CREATE_CUSTOMER',
      entityType: 'customer',
      entityId: customer.id,
      details: customer,
    });

    return customer;
  }

  async findAll(userId: string, userRole: string) {
    // Only staff and admin can see all customers
    return this.customerRepository.findAllWithDetails();
  }

  async findOne(id: string, userId: string, userRole: string) {
    const customer = await this.customerRepository.findOneWithDetails(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Get customer statistics
    const stats = await this.customerRepository.getCustomerStats(id);

    return {
      ...customer,
      stats,
    };
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string, userRole: string) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Update customer data directly
    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(updateCustomerDto.firstName && { firstName: updateCustomerDto.firstName }),
        ...(updateCustomerDto.lastName && { lastName: updateCustomerDto.lastName }),
        ...(updateCustomerDto.email !== undefined && { email: updateCustomerDto.email }),
        ...(updateCustomerDto.phone !== undefined && { phone: updateCustomerDto.phone }),
        ...(updateCustomerDto.address !== undefined && { address: updateCustomerDto.address }),
        ...(updateCustomerDto.businessName !== undefined && { businessName: updateCustomerDto.businessName }),
      },
      include: {
        vehicles: true,
      },
    });

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'UPDATE_CUSTOMER',
      entityType: 'customer',
      entityId: id,
      details: { old: customer, new: updatedCustomer },
    });

    return updatedCustomer;
  }

  async remove(id: string, userId: string) {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check for existing invoices or appointments
    const hasInvoices = await this.prisma.invoice.count({
      where: { customerId: id },
    });

    const hasAppointments = await this.prisma.appointment.count({
      where: { customerId: id },
    });

    if (hasInvoices > 0 || hasAppointments > 0) {
      throw new BadRequestException(
        'Cannot delete customer with existing invoices or appointments.',
      );
    }

    // Delete customer (vehicles will be cascade deleted)
    await this.prisma.customer.delete({
      where: { id },
    });

    // Log the action
    await this.auditRepository.create({
      userId,
      action: 'DELETE_CUSTOMER',
      entityType: 'customer',
      entityId: id,
      details: customer,
    });

    return { message: 'Customer deleted successfully' };
  }

  async search(searchTerm: string, userId: string, userRole: string) {
    return this.customerRepository.search(searchTerm);
  }

}