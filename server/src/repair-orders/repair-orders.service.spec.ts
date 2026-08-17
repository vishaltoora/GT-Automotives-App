import { RepairOrdersService } from './repair-orders.service';

/**
 * Unit tests for the RO -> Vehicle mileage sync. Prisma is mocked; the focus is
 * that an odometer reading recorded on an RO reaches the vehicle, and that it
 * can only ever move the vehicle's mileage forward.
 */
describe('RepairOrdersService vehicle mileage sync', () => {
  let service: RepairOrdersService;
  let tx: any;
  let prisma: any;

  beforeEach(() => {
    tx = {
      repairOrder: {
        create: jest.fn().mockResolvedValue({ id: 'ro-1' }),
        update: jest.fn().mockResolvedValue({ id: 'ro-1' }),
        findUnique: jest.fn().mockResolvedValue({ vehicleId: 'veh-1' }),
      },
      appointment: { updateMany: jest.fn() },
      rOEmployee: { deleteMany: jest.fn(), createMany: jest.fn() },
      vehicle: { updateMany: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
      repairOrder: {
        findUnique: jest.fn().mockResolvedValue({ id: 'ro-1' }),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    service = new RepairOrdersService(
      prisma,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
    // generateRoNumber hits the DB for a sequence; not what these tests cover.
    jest
      .spyOn(service as any, 'generateRoNumber')
      .mockResolvedValue('RO-000001');
  });

  describe('on create', () => {
    it('pushes the arrival reading onto the vehicle', async () => {
      await service.create({
        customerId: 'cust-1',
        vehicleId: 'veh-1',
        mileageIn: 90000,
      } as any);

      expect(tx.vehicle.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'veh-1',
          OR: [{ mileage: null }, { mileage: { lt: 90000 } }],
        },
        data: { mileage: 90000 },
      });
    });

    it('guards the update so a lower reading cannot overwrite a higher one', async () => {
      await service.create({
        customerId: 'cust-1',
        vehicleId: 'veh-1',
        mileageIn: 5,
      } as any);

      // The `lt` guard is what makes this safe — it is applied in the query, so
      // a stale or mistyped reading matches no rows and writes nothing.
      const { where } = tx.vehicle.updateMany.mock.calls[0][0];
      expect(where.OR).toEqual([{ mileage: null }, { mileage: { lt: 5 } }]);
    });

    it('does nothing when no mileage was entered', async () => {
      await service.create({
        customerId: 'cust-1',
        vehicleId: 'veh-1',
      } as any);

      expect(tx.vehicle.updateMany).not.toHaveBeenCalled();
    });

    it('does nothing for a vehicle-less RO', async () => {
      await service.create({
        customerId: 'cust-1',
        mileageIn: 90000,
      } as any);

      expect(tx.vehicle.updateMany).not.toHaveBeenCalled();
    });

    it('syncs before creating the RO so the returned vehicle is current', async () => {
      await service.create({
        customerId: 'cust-1',
        vehicleId: 'veh-1',
        mileageIn: 90000,
      } as any);

      const syncOrder = tx.vehicle.updateMany.mock.invocationCallOrder[0];
      const createOrder = tx.repairOrder.create.mock.invocationCallOrder[0];
      expect(syncOrder).toBeLessThan(createOrder);
    });
  });

  describe('on update', () => {
    it('syncs the arrival reading', async () => {
      await service.update('ro-1', { mileageIn: 91000 } as any, 'ADMIN');

      expect(tx.vehicle.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { mileage: 91000 } })
      );
    });

    it('prefers mileage out when both are set — it is the reading on departure', async () => {
      await service.update(
        'ro-1',
        { mileageIn: 91000, mileageOut: 91050 } as any,
        'ADMIN'
      );

      expect(tx.vehicle.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { mileage: 91050 } })
      );
    });

    it('resolves the vehicle from the RO when the update does not name one', async () => {
      await service.update('ro-1', { mileageOut: 91050 } as any, 'ADMIN');

      expect(tx.vehicle.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'veh-1' }),
        })
      );
    });

    it('does not touch the vehicle on an update that carries no mileage', async () => {
      await service.update(
        'ro-1',
        { technicianNotes: 'Replaced pads' } as any,
        'ADMIN'
      );

      expect(tx.vehicle.updateMany).not.toHaveBeenCalled();
      expect(tx.repairOrder.findUnique).not.toHaveBeenCalled();
    });
  });
});

/**
 * Deleting a repair order raised by mistake. The guards matter more than the
 * delete itself: an RO carrying real work must survive the attempt, and the
 * appointment behind it is only removed when the caller asks.
 */
describe('RepairOrdersService remove', () => {
  let service: RepairOrdersService;
  let tx: any;
  let prisma: any;

  const emptyRO = {
    id: 'ro-1',
    appointmentId: 'apt-1',
    vehicleId: null,
    noVehicle: false,
    quotationId: null,
    services: [],
    inspections: [],
    invoice: null,
    media: [],
  };

  // An appointment nobody has worked yet: no payment, no invoice, no payroll.
  const untouchedAppointment = {
    status: 'IN_PROGRESS',
    paymentAmount: null,
    productSaleAmount: null,
    invoice: null,
    jobs: [],
  };

  const setup = (ro: any, appointment: any = untouchedAppointment) => {
    tx = {
      repairOrder: { delete: jest.fn() },
      appointment: { delete: jest.fn(), updateMany: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
      repairOrder: { findUnique: jest.fn().mockResolvedValue(ro) },
      appointment: { findUnique: jest.fn().mockResolvedValue(appointment) },
    };
    service = new RepairOrdersService(
      prisma,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
  };

  it('deletes the RO and leaves the appointment behind, back on the schedule', async () => {
    setup(emptyRO);

    const result = await service.remove('ro-1', false);

    expect(tx.repairOrder.delete).toHaveBeenCalledWith({
      where: { id: 'ro-1' },
    });
    expect(tx.appointment.delete).not.toHaveBeenCalled();
    expect(tx.appointment.updateMany).toHaveBeenCalledWith({
      where: { id: 'apt-1', status: 'IN_PROGRESS' },
      data: { status: 'SCHEDULED' },
    });
    expect(result).toEqual({ deleted: true, appointmentDeleted: false });
  });

  it('deletes the appointment when asked, taking the RO with it', async () => {
    setup(emptyRO);

    const result = await service.remove('ro-1', true);

    expect(tx.appointment.delete).toHaveBeenCalledWith({
      where: { id: 'apt-1' },
    });
    // The RO cascades from the appointment; deleting it directly would be a
    // second delete of a row that is already gone.
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
    expect(result).toEqual({ deleted: true, appointmentDeleted: true });
  });

  it('refuses an RO that has a vehicle on it', async () => {
    setup({ ...emptyRO, vehicleId: 'veh-1' });

    await expect(service.remove('ro-1', false)).rejects.toThrow(/no vehicle/i);
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });

  it('refuses an RO that has services on it', async () => {
    setup({ ...emptyRO, services: [{ id: 'svc-1' }] });

    await expect(service.remove('ro-1', false)).rejects.toThrow(/no services/i);
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });

  it('refuses an RO that has been invoiced', async () => {
    setup({ ...emptyRO, invoice: { id: 'inv-1' } });

    await expect(service.remove('ro-1', false)).rejects.toThrow(/invoice/i);
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });

  it('refuses an RO that has an inspection', async () => {
    setup({ ...emptyRO, inspections: [{ id: 'insp-1' }] });

    await expect(service.remove('ro-1', false)).rejects.toThrow(/inspection/i);
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });

  it('refuses an RO that has a quotation', async () => {
    setup({ ...emptyRO, quotationId: 'quo-1' });

    await expect(service.remove('ro-1', false)).rejects.toThrow(/quotation/i);
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });

  it('refuses an RO that does not exist', async () => {
    setup(null);

    await expect(service.remove('ro-1', false)).rejects.toThrow(/not found/i);
  });
});

/**
 * Deleting the appointment along with the RO. The appointment has to clear its
 * own bar: money is recorded against it, not against the RO, so the RO being
 * empty says nothing about whether the booking has been worked.
 */
describe('RepairOrdersService remove — deleting the appointment too', () => {
  let service: RepairOrdersService;
  let tx: any;
  let prisma: any;

  const emptyRO = {
    id: 'ro-1',
    appointmentId: 'apt-1',
    vehicleId: null,
    noVehicle: false,
    quotationId: null,
    services: [],
    inspections: [],
    invoice: null,
    media: [],
  };

  const setup = (appointment: any) => {
    tx = {
      repairOrder: { delete: jest.fn() },
      appointment: { delete: jest.fn(), updateMany: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
      repairOrder: { findUnique: jest.fn().mockResolvedValue(emptyRO) },
      appointment: { findUnique: jest.fn().mockResolvedValue(appointment) },
    };
    service = new RepairOrdersService(
      prisma,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
  };

  const untouched = {
    status: 'IN_PROGRESS',
    paymentAmount: null,
    productSaleAmount: null,
    invoice: null,
    jobs: [],
  };

  it('deletes a booking nobody has worked', async () => {
    setup(untouched);

    await service.remove('ro-1', true);

    expect(tx.appointment.delete).toHaveBeenCalledWith({
      where: { id: 'apt-1' },
    });
  });

  it('refuses a booking that has taken money — the RO being empty does not make the cash disappear', async () => {
    setup({ ...untouched, paymentAmount: 240 });

    await expect(service.remove('ro-1', true)).rejects.toThrow(/payment/i);
    expect(tx.appointment.delete).not.toHaveBeenCalled();
  });

  it('refuses a booking with a product sale recorded', async () => {
    setup({ ...untouched, productSaleAmount: 80 });

    await expect(service.remove('ro-1', true)).rejects.toThrow(/payment/i);
    expect(tx.appointment.delete).not.toHaveBeenCalled();
  });

  it('refuses a completed booking', async () => {
    setup({ ...untouched, status: 'COMPLETED' });

    await expect(service.remove('ro-1', true)).rejects.toThrow(/completed/i);
    expect(tx.appointment.delete).not.toHaveBeenCalled();
  });

  it('refuses a booking that has been invoiced', async () => {
    setup({ ...untouched, invoice: { id: 'inv-1' } });

    await expect(service.remove('ro-1', true)).rejects.toThrow(/invoice/i);
    expect(tx.appointment.delete).not.toHaveBeenCalled();
  });

  it('refuses a booking staff have been paid out for', async () => {
    setup({ ...untouched, jobs: [{ id: 'job-1' }] });

    await expect(service.remove('ro-1', true)).rejects.toThrow(/payroll/i);
    expect(tx.appointment.delete).not.toHaveBeenCalled();
  });

  it('leaves the appointment alone entirely when it is not being deleted', async () => {
    setup({ ...untouched, paymentAmount: 240, status: 'COMPLETED' });

    // A paid booking blocks deleting the booking, not deleting the RO.
    await service.remove('ro-1', false);

    expect(tx.repairOrder.delete).toHaveBeenCalled();
    expect(tx.appointment.delete).not.toHaveBeenCalled();
  });
});

/**
 * The guard on the RO itself. Photos and the deliberate no-vehicle flag both
 * mean the RO is real, not raised by mistake.
 */
describe('RepairOrdersService remove — RO carries something', () => {
  let service: RepairOrdersService;
  let tx: any;
  let prisma: any;

  const setup = (ro: any) => {
    tx = {
      repairOrder: { delete: jest.fn() },
      appointment: { delete: jest.fn(), updateMany: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn((cb: any) => cb(tx)),
      repairOrder: { findUnique: jest.fn().mockResolvedValue(ro) },
      appointment: { findUnique: jest.fn() },
    };
    service = new RepairOrdersService(
      prisma,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
  };

  const base = {
    id: 'ro-1',
    appointmentId: 'apt-1',
    vehicleId: null,
    noVehicle: false,
    quotationId: null,
    services: [],
    inspections: [],
    invoice: null,
    media: [],
  };

  it('refuses an RO with photos — their blobs would be orphaned', async () => {
    setup({ ...base, media: [{ id: 'media-1' }] });

    await expect(service.remove('ro-1', false)).rejects.toThrow(/photos/i);
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });

  it('refuses a counter-service RO deliberately marked as having no vehicle', async () => {
    setup({ ...base, noVehicle: true });

    await expect(service.remove('ro-1', false)).rejects.toThrow(
      /counter service/i
    );
    expect(tx.repairOrder.delete).not.toHaveBeenCalled();
  });
});
