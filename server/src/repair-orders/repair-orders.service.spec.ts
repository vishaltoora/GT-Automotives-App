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
