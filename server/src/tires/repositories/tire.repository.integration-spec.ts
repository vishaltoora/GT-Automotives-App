import { PrismaService } from '@gt-automotive/database';
import { TireType, TireCondition } from '@prisma/client';
import { TireRepository } from './tire.repository';

/**
 * Integration test: exercises TireRepository against a real Postgres database
 * (no mocks). A Tire requires a TireBrand and a TireSize (FKs), and may
 * optionally reference a Location. We create those reference rows first and
 * clean everything up (children before parents) in afterAll.
 */
describe('TireRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: TireRepository;

  const tireIds: string[] = [];
  const brandIds: string[] = [];
  const sizeIds: string[] = [];
  const locationIds: string[] = [];

  const stamp = Date.now();
  let counter = 0;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new TireRepository(prisma);
  });

  afterAll(async () => {
    if (tireIds.length) {
      await prisma.tire.deleteMany({ where: { id: { in: tireIds } } });
    }
    if (brandIds.length) {
      await prisma.tireBrand.deleteMany({ where: { id: { in: brandIds } } });
    }
    if (sizeIds.length) {
      await prisma.tireSize.deleteMany({ where: { id: { in: sizeIds } } });
    }
    if (locationIds.length) {
      await prisma.location.deleteMany({ where: { id: { in: locationIds } } });
    }
    await prisma.$disconnect();
  });

  async function makeBrand(name?: string) {
    counter += 1;
    const brand = await prisma.tireBrand.create({
      data: { name: name ?? `IntBrand-${stamp}-${counter}` },
    });
    brandIds.push(brand.id);
    return brand;
  }

  async function makeSize(size?: string) {
    counter += 1;
    const tireSize = await prisma.tireSize.create({
      data: { size: size ?? `IntSize-${stamp}-${counter}` },
    });
    sizeIds.push(tireSize.id);
    return tireSize;
  }

  async function makeLocation(name?: string) {
    counter += 1;
    const location = await prisma.location.create({
      data: { name: name ?? `IntLoc-${stamp}-${counter}` },
    });
    locationIds.push(location.id);
    return location;
  }

  async function makeTire(overrides: Record<string, any> = {}) {
    const brand = overrides.brand ?? (await makeBrand());
    const size = overrides.size ?? (await makeSize());
    const tire = await repository.create({
      type: overrides.type ?? TireType.ALL_SEASON,
      condition: overrides.condition ?? TireCondition.NEW,
      quantity: overrides.quantity ?? 10,
      price: overrides.price ?? 199.99,
      cost: overrides.cost ?? 120.0,
      minStock: overrides.minStock ?? 5,
      name: overrides.name,
      sku: overrides.sku,
      brand: { connect: { id: brand.id } },
      size: { connect: { id: size.id } },
      ...(overrides.locationId
        ? { location: { connect: { id: overrides.locationId } } }
        : {}),
    } as any);
    tireIds.push(tire.id);
    return { tire, brand, size };
  }

  it('persists and reads back a tire with brand/size includes', async () => {
    const { tire, brand, size } = await makeTire({
      name: 'Persisted Tire',
      quantity: 8,
      price: 250.5,
    });

    const found = (await repository.findById(tire.id)) as any;
    expect(found).not.toBeNull();
    expect(found.name).toBe('Persisted Tire');
    expect(found.quantity).toBe(8);
    expect(parseFloat(found.price.toString())).toBe(250.5);
    expect(found.brand.id).toBe(brand.id);
    expect(found.size.id).toBe(size.id);
  });

  it('updates a tire', async () => {
    const { tire } = await makeTire({ quantity: 4 });

    const updated = (await repository.update(tire.id, {
      quantity: 42,
      name: 'Updated Name',
    })) as any;

    expect(updated.quantity).toBe(42);
    expect(updated.name).toBe('Updated Name');

    const reread = (await repository.findById(tire.id)) as any;
    expect(reread.quantity).toBe(42);
  });

  it('adjustStock adds, removes (floored at 0), and sets quantity', async () => {
    const { tire } = await makeTire({ quantity: 10 });

    const added = await repository.adjustStock(tire.id, {
      quantity: 5,
      type: 'add',
    });
    expect(added.quantity).toBe(15);

    const removed = await repository.adjustStock(tire.id, {
      quantity: 100,
      type: 'remove',
    });
    expect(removed.quantity).toBe(0);

    const set = await repository.adjustStock(tire.id, {
      quantity: 7,
      type: 'set',
    });
    expect(set.quantity).toBe(7);
  });

  it('findBySizeAndType filters by size and optional type', async () => {
    const size = await makeSize();
    const { tire: winterTire } = await makeTire({
      size,
      type: TireType.WINTER,
    });
    const { tire: summerTire } = await makeTire({
      size,
      type: TireType.SUMMER,
    });

    const allForSize = await repository.findBySizeAndType(size.size);
    const idsAll = allForSize.map((t) => t.id);
    expect(idsAll).toContain(winterTire.id);
    expect(idsAll).toContain(summerTire.id);

    const winterOnly = await repository.findBySizeAndType(
      size.size,
      TireType.WINTER
    );
    const idsWinter = winterOnly.map((t) => t.id);
    expect(idsWinter).toContain(winterTire.id);
    expect(idsWinter).not.toContain(summerTire.id);
  });

  it('findByBrandAndModel finds tires by brand name (case-insensitive)', async () => {
    const brand = await makeBrand();
    const { tire } = await makeTire({ brand });

    const results = await repository.findByBrandAndModel(
      brand.name.toLowerCase(),
      'ignored'
    );
    expect(results.map((t) => t.id)).toContain(tire.id);
  });

  it('search returns paginated results matching the search term', async () => {
    const uniqueBrandName = `Searchify-${stamp}-${(counter += 1)}`;
    const brand = await makeBrand(uniqueBrandName);
    const { tire } = await makeTire({ brand });

    const result = await repository.search({ search: uniqueBrandName } as any);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.items.map((i) => i.id)).toContain(tire.id);
    expect(result.page).toBe(1);
    expect(result.items[0].brand).toBe(uniqueBrandName);
  });

  it('search filters by type', async () => {
    const brand = await makeBrand();
    const { tire } = await makeTire({ brand, type: TireType.OFF_ROAD });

    const result = await repository.search({
      brand: brand.name,
      type: TireType.OFF_ROAD,
    } as any);

    expect(result.items.map((i) => i.id)).toContain(tire.id);
    result.items.forEach((i) => expect(i.type).toBe(TireType.OFF_ROAD));
  });

  it('findLowStock returns tires at or below minStock', async () => {
    const { tire } = await makeTire({ quantity: 1, minStock: 5 });

    const lowStock = await repository.findLowStock();
    expect(lowStock.map((t) => t.id)).toContain(tire.id);
  });

  it('getInventoryReport aggregates totals across created tires', async () => {
    const brand = await makeBrand();
    await makeTire({ brand, quantity: 3, price: 100, cost: 50 });
    await makeTire({ brand, quantity: 2, price: 200, cost: 80 });

    const report = await repository.getInventoryReport();
    expect(report.totalItems).toBeGreaterThanOrEqual(5);
    expect(report.totalValue).toBeGreaterThanOrEqual(3 * 100 + 2 * 200);
    expect(report.totalCost).toBeGreaterThanOrEqual(3 * 50 + 2 * 80);
    expect(typeof report.byBrand).toBe('object');
    expect(typeof report.byType).toBe('object');
  });

  it('exposes brands and sizes lists', async () => {
    const brand = await makeBrand();
    const size = await makeSize();

    const brands = await repository.getBrands();
    const sizes = await repository.getSizes();

    expect(brands).toContain(brand.name);
    expect(sizes).toContain(size.size);
  });

  it('connects an optional location', async () => {
    const location = await makeLocation();
    const { tire } = await makeTire({ locationId: location.id });

    const found = (await repository.findById(tire.id)) as any;
    expect(found.location?.id).toBe(location.id);
  });

  it('deletes a tire and returns true', async () => {
    const { tire } = await makeTire();

    const ok = await repository.delete(tire.id);
    expect(ok).toBe(true);

    const found = await repository.findById(tire.id);
    expect(found).toBeNull();

    // Already deleted — remove from tracking so afterAll doesn't double-delete.
    const idx = tireIds.indexOf(tire.id);
    if (idx >= 0) tireIds.splice(idx, 1);
  });
});
