import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CustomerRepository } from './repositories/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from '../common/dto/customer.dto';
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

    // Auto-create SMS preferences if customer has a phone number
    // Use provided preferences or default to opted-in for better user experience
    if (customer.phone) {
      await this.prisma.smsPreference.create({
        data: {
          customer: {
            connect: { id: customer.id },
          },
          optedIn: createCustomerDto.smsOptedIn ?? true,
          appointmentReminders: createCustomerDto.smsAppointmentReminders ?? true,
          serviceUpdates: createCustomerDto.smsServiceUpdates ?? true,
          promotional: createCustomerDto.smsPromotional ?? false,
        },
      }).catch(err => {
        console.error('Failed to create SMS preferences for customer:', err);
        // Don't throw error - customer was created successfully
      });
    }

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
    // Get customers and all stats in parallel - eliminates N+1 query problem
    const [customers, statsMap] = await Promise.all([
      this.customerRepository.findAllWithDetails(),
      this.customerRepository.getAllCustomerStats(),
    ]);

    // Merge stats with customers using the pre-computed stats map
    const customersWithStats = customers.map((customer) => {
      const stats = statsMap.get(customer.id) || {
        totalSpent: 0,
        outstandingBalance: 0,
        vehicleCount: 0,
        appointmentCount: 0,
        upcomingAppointments: 0,
        lastVisitDate: null,
      };
      return {
        ...customer,
        stats,
      };
    });

    return customersWithStats;
  }

  // Lightweight method for dropdowns/autocomplete - no stats, just basic info
  // This is much faster as it avoids N+1 queries for customer stats
  async findAllSimple() {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        businessName: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });
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

    // Update SMS preferences if provided and customer has phone
    if (updatedCustomer.phone && (
      updateCustomerDto.smsOptedIn !== undefined ||
      updateCustomerDto.smsAppointmentReminders !== undefined ||
      updateCustomerDto.smsServiceUpdates !== undefined ||
      updateCustomerDto.smsPromotional !== undefined
    )) {
      // Check if SMS preferences exist
      const existingPrefs = await this.prisma.smsPreference.findUnique({
        where: { customerId: id },
      });

      if (existingPrefs) {
        // Update existing preferences
        await this.prisma.smsPreference.update({
          where: { customerId: id },
          data: {
            ...(updateCustomerDto.smsOptedIn !== undefined && { optedIn: updateCustomerDto.smsOptedIn }),
            ...(updateCustomerDto.smsAppointmentReminders !== undefined && { appointmentReminders: updateCustomerDto.smsAppointmentReminders }),
            ...(updateCustomerDto.smsServiceUpdates !== undefined && { serviceUpdates: updateCustomerDto.smsServiceUpdates }),
            ...(updateCustomerDto.smsPromotional !== undefined && { promotional: updateCustomerDto.smsPromotional }),
          },
        }).catch(err => {
          console.error('Failed to update SMS preferences:', err);
        });
      } else {
        // Create new preferences
        await this.prisma.smsPreference.create({
          data: {
            customer: {
              connect: { id },
            },
            optedIn: updateCustomerDto.smsOptedIn ?? true,
            appointmentReminders: updateCustomerDto.smsAppointmentReminders ?? true,
            serviceUpdates: updateCustomerDto.smsServiceUpdates ?? true,
            promotional: updateCustomerDto.smsPromotional ?? false,
          },
        }).catch(err => {
          console.error('Failed to create SMS preferences:', err);
        });
      }
    }

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