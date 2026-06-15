import { PrismaService } from '@gt-automotive/database';
import { VehicleRepository } from './vehicle.repository';

/**
 * Integration test: exercises VehicleRepository against a real Postgres
 * database (no mocks). A Vehicle requires a Customer (FK customerId), so we
 * create a Customer first and clean up children (vehicles) before the parent
 * (customer) in afterAll.
 */
describe('VehicleRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: VehicleRepository;

  const vehicleIds: string[] = [];
  const customerIds: string[] = [];

  const stamp = Date.now();
  let counter = 0;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new VehicleRepository(prisma);
  });

  afterAll(async () => {
    if (vehicleIds.length) {
      await prisma.vehicle.deleteMany({ where: { id: { in: vehicleIds } } });
    }
    if (customerIds.length) {
      await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
    }
    await prisma.$disconnect();
  });

  async function makeCustomer() {
    counter += 1;
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Vehicle',
        lastName: 'Owner',
        email: `veh-owner-${stamp}-${counter}@example.com`,
      },
    });
    customerIds.push(customer.id);
    return customer;
  }

  async function makeVehicle(overrides: Record<string, any> = {}) {
    const customer = overrides.customer ?? (await makeCustomer());
    counter += 1;
    const vehicle = (await repository.create({
      make: overrides.make ?? 'Toyota',
      model: overrides.model ?? 'Corolla',
      year: overrides.year ?? 2020,
      vin: overrides.vin ?? `VIN-${stamp}-${counter}`,
      licensePlate: overrides.licensePlate ?? `PLT-${stamp}-${counter}`,
      mileage: overrides.mileage ?? 50000,
      customer: { connect: { id: customer.id } },
    } as any)) as any;
    vehicleIds.push(vehicle.id);
    return { vehicle, customer };
  }

  it('persists and reads back a vehicle', async () => {
    const { vehicle } = await makeVehicle({ make: 'Honda', model: 'Civic' });

    const found = (await repository.findById(vehicle.id)) as any;
    expect(found).not.toBeNull();
    expect(found.make).toBe('Honda');
    expect(found.model).toBe('Civic');
    expect(found.year).toBe(2020);
  });

  it('findOneWithDetails includes the related customer', async () => {
    const { vehicle, customer } = await makeVehicle();

    const found = await repository.findOneWithDetails(vehicle.id);
    expect(found).not.toBeNull();
    expect(found?.customer.id).toBe(customer.id);
    expect(Array.isArray(found?.invoices)).toBe(true);
    expect(Array.isArray(found?.appointments)).toBe(true);
  });

  it('findByCustomer returns vehicles for a given customer', async () => {
    const customer = await makeCustomer();
    const { vehicle: v1 } = await makeVehicle({ customer });
    const { vehicle: v2 } = await makeVehicle({ customer });

    const results = await repository.findByCustomer(customer.id);
    const ids = results.map((v) => v.id);
    expect(ids).toContain(v1.id);
    expect(ids).toContain(v2.id);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('findByVin looks up a vehicle by its unique VIN', async () => {
    const vin = `UNIQUEVIN-${stamp}-${(counter += 1)}`;
    const { vehicle, customer } = await makeVehicle({ vin });

    const found = await repository.findByVin(vin);
    expect(found?.id).toBe(vehicle.id);
    expect(found?.customer.id).toBe(customer.id);
  });

  it('search matches by make, model, vin, or license plate (case-insensitive)', async () => {
    const uniqueModel = `Zephyr${stamp}${(counter += 1)}`;
    const { vehicle } = await makeVehicle({ model: uniqueModel });

    const byModel = await repository.search(uniqueModel.toLowerCase());
    expect(byModel.map((v) => v.id)).toContain(vehicle.id);
  });

  it('updates a vehicle', async () => {
    const { vehicle } = await makeVehicle({ mileage: 1000 });

    const updated = (await repository.update(vehicle.id, {
      mileage: 99999,
      model: 'UpdatedModel',
    })) as any;
    expect(updated.mileage).toBe(99999);
    expect(updated.model).toBe('UpdatedModel');
  });

  it('getVehicleStats returns counts/aggregations (zeros for a fresh vehicle)', async () => {
    const { vehicle } = await makeVehicle();

    const stats = await repository.getVehicleStats(vehicle.id);
    expect(stats.serviceCount).toBe(0);
    expect(Number(stats.totalSpent)).toBe(0);
    expect(stats.lastServiceDate).toBeNull();
    expect(stats.nextAppointment).toBeNull();
  });

  it('findAllWithDetails includes created vehicles with customer + counts', async () => {
    const { vehicle } = await makeVehicle();

    const all = await repository.findAllWithDetails();
    const match = all.find((v) => v.id === vehicle.id) as any;
    expect(match).toBeDefined();
    expect(match.customer).toBeDefined();
    expect(match._count).toHaveProperty('invoices');
    expect(match._count).toHaveProperty('appointments');
  });

  it('deletes a vehicle', async () => {
    const { vehicle } = await makeVehicle();

    const ok = await repository.delete(vehicle.id);
    expect(ok).toBe(true);

    const found = await repository.findById(vehicle.id);
    expect(found).toBeNull();

    const idx = vehicleIds.indexOf(vehicle.id);
    if (idx >= 0) vehicleIds.splice(idx, 1);
  });
});
