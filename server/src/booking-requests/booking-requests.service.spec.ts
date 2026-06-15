import { BookingRequestsService } from './booking-requests.service';

/**
 * Unit tests for BookingRequestsService.
 *
 * Direct instantiation with mocked PrismaService + EmailService.
 * Focus: create persistence + service-type label mapping in notifications,
 * non-blocking email behavior, error wrapping, and thin pass-through methods.
 */
describe('BookingRequestsService', () => {
  let service: BookingRequestsService;
  let prisma: any;
  let email: any;

  const baseDto = {
    appointmentType: 'AT_GARAGE',
    firstName: 'John',
    lastName: 'Doe',
    phone: '5551234567',
    email: 'john@example.com',
    address: '123 St',
    serviceType: 'TIRE_CHANGE',
    requestedDate: '2025-01-01',
    requestedTime: '10:00',
    notes: 'urgent',
  };

  beforeEach(() => {
    prisma = {
      bookingRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };
    email = {
      sendBookingRequestNotification: jest.fn().mockResolvedValue(undefined),
    };
    service = new BookingRequestsService(prisma as any, email as any);
    // Silence logger
    jest
      .spyOn((service as any).logger, 'log')
      .mockImplementation(() => undefined);
    jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => undefined);
  });

  describe('create', () => {
    it('persists the booking request with PENDING status and returns success', async () => {
      prisma.bookingRequest.create.mockResolvedValue({ id: 'br-1' });
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.create(baseDto as any);

      expect(prisma.bookingRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          serviceType: 'TIRE_CHANGE',
          status: 'PENDING',
        }),
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('submitted successfully');
    });

    it('maps known service type to a friendly label in notifications', async () => {
      prisma.bookingRequest.create.mockResolvedValue({ id: 'br-1' });
      prisma.user.findMany.mockResolvedValue([
        { email: 'staff@gt.com', firstName: 'Stan', lastName: 'Staff' },
      ]);

      await service.create({ ...baseDto, serviceType: 'TIRE_CHANGE' } as any);
      // allow the fire-and-forget promise to run
      await Promise.resolve();
      await Promise.resolve();

      expect(email.sendBookingRequestNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: 'staff@gt.com',
          recipientName: 'Stan Staff',
          bookingRequest: expect.objectContaining({
            serviceType: 'Tire Mount Balance',
            customerName: 'John Doe',
            notes: 'urgent',
          }),
        })
      );
    });

    it('falls back to raw service type when not in label map and defaults notes', async () => {
      prisma.bookingRequest.create.mockResolvedValue({ id: 'br-1' });
      prisma.user.findMany.mockResolvedValue([
        { email: 'a@gt.com', firstName: 'A', lastName: 'B' },
      ]);

      const { notes, ...noNotes } = baseDto;
      await service.create({ ...noNotes, serviceType: 'UNKNOWN_SVC' } as any);
      await Promise.resolve();
      await Promise.resolve();

      expect(email.sendBookingRequestNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingRequest: expect.objectContaining({
            serviceType: 'UNKNOWN_SVC',
            notes: 'None',
          }),
        })
      );
    });

    it('wraps persistence errors in a generic friendly error', async () => {
      prisma.bookingRequest.create.mockRejectedValue(new Error('db down'));
      await expect(service.create(baseDto as any)).rejects.toThrow(
        'Failed to submit booking request. Please try again or call us directly.'
      );
    });

    it('queries only ADMIN and STAFF users for notifications', async () => {
      prisma.bookingRequest.create.mockResolvedValue({ id: 'br-1' });
      prisma.user.findMany.mockResolvedValue([]);
      await service.create(baseDto as any);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: { name: { in: ['ADMIN', 'STAFF'] } } },
        select: { email: true, firstName: true, lastName: true },
      });
    });
  });

  describe('findAll', () => {
    it('returns requests ordered by createdAt desc with relations', async () => {
      prisma.bookingRequest.findMany.mockResolvedValue([{ id: 'br-1' }]);
      const result = await service.findAll();
      expect(prisma.bookingRequest.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: { customer: true, appointment: true },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('fetches one with relations', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue({ id: 'br-1' });
      await service.findOne('br-1');
      expect(prisma.bookingRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 'br-1' },
        include: { customer: true, appointment: true },
      });
    });
  });

  describe('update', () => {
    it('updates the status', async () => {
      prisma.bookingRequest.update.mockResolvedValue({
        id: 'br-1',
        status: 'ACCEPTED',
      });
      const result = await service.update('br-1', {
        status: 'ACCEPTED',
      } as any);
      expect(prisma.bookingRequest.update).toHaveBeenCalledWith({
        where: { id: 'br-1' },
        data: { status: 'ACCEPTED' },
      });
      expect(result.status).toBe('ACCEPTED');
    });
  });

  describe('delete', () => {
    it('deletes by id', async () => {
      prisma.bookingRequest.delete.mockResolvedValue({ id: 'br-1' });
      await service.delete('br-1');
      expect(prisma.bookingRequest.delete).toHaveBeenCalledWith({
        where: { id: 'br-1' },
      });
    });
  });
});
