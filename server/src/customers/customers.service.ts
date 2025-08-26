import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CustomerRepository } from './repositories/customer.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly userRepository: UserRepository,
    private readonly auditRepository: AuditRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, createdBy: string) {
    // First, create the user account
    const existingUser = await this.userRepository.findByEmail(createCustomerDto.email);

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists');
    }

    // Get customer role
    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    if (!customerRole) {
      throw new BadRequestException('Customer role not found');
    }

    // Create user and customer in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          clerkId: `customer_${Date.now()}`, // Temporary ID, should be updated by Clerk webhook
          email: createCustomerDto.email,
          firstName: createCustomerDto.firstName,
          lastName: createCustomerDto.lastName,
          roleId: customerRole.id,
        },
      });

      // Create customer profile
      const customer = await prisma.customer.create({
        data: {
          userId: user.id,
          phone: createCustomerDto.phone,
          address: createCustomerDto.address,
          businessName: createCustomerDto.businessName,
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      });

      // Log the action
      await this.auditRepository.create({
        userId: createdBy,
        action: 'CREATE_CUSTOMER',
        resource: 'customer',
        resourceId: customer.id,
        newValue: customer,
      });

      return customer;
    });

    return result;
  }

  async findAll(userId: string, userRole: string) {
    // Customers can only see their own profile
    if (userRole === 'customer') {
      const customer = await this.customerRepository.findByUserId(userId);
      return customer ? [customer] : [];
    }

    // Staff and admin can see all customers
    return this.customerRepository.findAllWithDetails();
  }

  async findOne(id: string, userId: string, userRole: string) {
    const customer = await this.customerRepository.findOneWithDetails(id);

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Customers can only see their own profile
    if (userRole === 'customer' && customer.userId !== userId) {
      throw new ForbiddenException('You can only view your own customer profile');
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

    // Customers can only update their own profile
    if (userRole === 'customer' && customer.userId !== userId) {
      throw new ForbiddenException('You can only update your own customer profile');
    }

    // Update user and customer data in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update user data if provided
      if (updateCustomerDto.email || updateCustomerDto.firstName || updateCustomerDto.lastName) {
        await prisma.user.update({
          where: { id: customer.userId },
          data: {
            ...(updateCustomerDto.email && { email: updateCustomerDto.email }),
            ...(updateCustomerDto.firstName && { firstName: updateCustomerDto.firstName }),
            ...(updateCustomerDto.lastName && { lastName: updateCustomerDto.lastName }),
          },
        });
      }

      // Update customer data
      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          ...(updateCustomerDto.phone && { phone: updateCustomerDto.phone }),
          ...(updateCustomerDto.address !== undefined && { address: updateCustomerDto.address }),
          ...(updateCustomerDto.businessName !== undefined && { businessName: updateCustomerDto.businessName }),
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
          vehicles: true,
        },
      });

      // Log the action if not a self-update
      if (userRole !== 'customer') {
        await this.auditRepository.create({
          userId,
          action: 'UPDATE_CUSTOMER',
          resource: 'customer',
          resourceId: id,
          oldValue: customer,
          newValue: updatedCustomer,
        });
      }

      return updatedCustomer;
    });

    return result;
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
        'Cannot delete customer with existing invoices or appointments. Please deactivate the user instead.',
      );
    }

    // Delete customer and user in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Delete customer (vehicles will be cascade deleted)
      await prisma.customer.delete({
        where: { id },
      });

      // Deactivate user instead of deleting
      await prisma.user.update({
        where: { id: customer.userId },
        data: { isActive: false },
      });

      // Log the action
      await this.auditRepository.create({
        userId,
        action: 'DELETE_CUSTOMER',
        resource: 'customer',
        resourceId: id,
        oldValue: customer,
      });
    });

    return { message: 'Customer deleted successfully' };
  }

  async search(searchTerm: string, userId: string, userRole: string) {
    // Customers cannot search for other customers
    if (userRole === 'customer') {
      throw new ForbiddenException('You are not authorized to search customers');
    }

    return this.customerRepository.search(searchTerm);
  }

  async getMyProfile(userId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      // User exists but doesn't have a customer profile yet
      // This can happen for staff/admin users
      return null;
    }

    const stats = await this.customerRepository.getCustomerStats(customer.id);

    return {
      ...customer,
      stats,
    };
  }
}