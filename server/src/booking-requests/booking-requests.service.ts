import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { EmailService } from '../email/email.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { UpdateBookingRequestDto } from './dto/update-booking-request.dto';

const SERVICE_TYPE_LABELS: Record<string, string> = {
  TIRE_CHANGE: 'Tire Mount Balance',
  TIRE_ROTATION: 'Tire Rotation',
  TIRE_REPAIR: 'Tire Repair',
  TIRE_SWAP: 'Tire Swap',
  TIRE_BALANCE: 'Tire Balance',
  OIL_CHANGE: 'Oil Change',
  BRAKE_SERVICE: 'Brake Service',
  MECHANICAL_WORK: 'Mechanical Work',
  ENGINE_DIAGNOSTIC: 'Engine Diagnostic',
  OTHER: 'Other Service',
};

@Injectable()
export class BookingRequestsService {
  private readonly logger = new Logger(BookingRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateBookingRequestDto) {
    this.logger.log(`Processing booking request from ${dto.firstName} ${dto.lastName}`);

    try {
      // Save booking request to database
      const bookingRequest = await this.prisma.bookingRequest.create({
        data: {
          appointmentType: dto.appointmentType as any,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          serviceType: dto.serviceType,
          requestedDate: dto.requestedDate,
          requestedTime: dto.requestedTime,
          notes: dto.notes,
          status: 'PENDING',
        },
      });

      this.logger.log(`✅ Booking request saved with ID: ${bookingRequest.id}`);

      // Get all staff and admin users to notify
      const users = await this.prisma.user.findMany({
        where: {
          role: {
            name: {
              in: ['ADMIN', 'STAFF'],
            },
          },
        },
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      this.logger.log(`Found ${users.length} users to notify`);

      // Send email notifications to all staff/admin users (non-blocking)
      const emailPromises = users.map(async (user) => {
        try {
          await this.emailService.sendBookingRequestNotification({
            recipientEmail: user.email,
            recipientName: `${user.firstName} ${user.lastName}`,
            bookingRequest: {
              appointmentType: dto.appointmentType,
              customerName: `${dto.firstName} ${dto.lastName}`,
              phone: dto.phone,
              email: dto.email,
              address: dto.address,
              serviceType: SERVICE_TYPE_LABELS[dto.serviceType] || dto.serviceType,
              requestedDate: dto.requestedDate,
              requestedTime: dto.requestedTime,
              notes: dto.notes || 'None',
            },
          });
          this.logger.log(`✅ Email sent to ${user.email}`);
        } catch (error) {
          this.logger.error(`Failed to send email to ${user.email}:`, error);
          // Don't throw - continue sending to other users
        }
      });

      // Fire and forget email notifications
      Promise.allSettled(emailPromises);

      this.logger.log('Booking request processed successfully');
      return {
        success: true,
        message: 'Booking request submitted successfully. We will contact you shortly.',
      };
    } catch (error) {
      this.logger.error('Failed to process booking request:', error);
      throw new Error('Failed to submit booking request. Please try again or call us directly.');
    }
  }

  async findAll() {
    return this.prisma.bookingRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
        appointment: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        appointment: true,
      },
    });
  }

  async update(id: string, dto: UpdateBookingRequestDto) {
    this.logger.log(`Updating booking request ${id} with status: ${dto.status}`);
    return this.prisma.bookingRequest.update({
      where: { id },
      data: {
        status: dto.status as any,
      },
    });
  }

  async delete(id: string) {
    this.logger.log(`Deleting booking request ${id}`);
    return this.prisma.bookingRequest.delete({
      where: { id },
    });
  }
}
