import { AppointmentsService } from './appointments.service';

/**
 * Whether moving an appointment texts the customer. A move the shop makes for
 * its own reasons — unfinished work carried over to the next day — must stay
 * silent, while an ordinary reschedule still tells the customer.
 */
describe('AppointmentsService update — customer notification', () => {
  let service: AppointmentsService;
  let prisma: any;
  let smsService: any;

  const existing = {
    id: 'apt-1',
    customerId: 'cust-1',
    scheduledDate: new Date('2026-08-17T00:00:00.000Z'),
    scheduledTime: '13:00',
    status: 'IN_PROGRESS',
    employees: [],
    employeeId: null,
    paymentAmount: null,
    expectedAmount: null,
  };

  beforeEach(() => {
    prisma = {
      appointment: {
        findUnique: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockResolvedValue({ ...existing }),
      },
      appointmentEmployee: { deleteMany: jest.fn(), createMany: jest.fn() },
    };
    smsService = {
      sendAppointmentUpdate: jest.fn().mockResolvedValue(undefined),
    };
    service = new AppointmentsService(
      prisma,
      {} as any,
      smsService,
      {} as any,
      {} as any,
      {} as any
    );
  });

  it('texts the customer when the appointment is moved to another day', async () => {
    await service.update('apt-1', {
      scheduledDate: '2026-08-18',
      scheduledTime: '09:00',
    } as any);

    expect(smsService.sendAppointmentUpdate).toHaveBeenCalledWith('apt-1');
  });

  it('stays silent when the caller opts out', async () => {
    await service.update('apt-1', {
      scheduledDate: '2026-08-18',
      scheduledTime: '09:00',
      notifyCustomer: false,
    } as any);

    expect(smsService.sendAppointmentUpdate).not.toHaveBeenCalled();
  });

  it('never writes notifyCustomer to the database — it is not a column', async () => {
    await service.update('apt-1', {
      scheduledDate: '2026-08-18',
      notifyCustomer: false,
    } as any);

    const [[{ data }]] = prisma.appointment.update.mock.calls;
    expect(data).not.toHaveProperty('notifyCustomer');
  });
});
