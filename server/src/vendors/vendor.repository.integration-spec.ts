import { PrismaService } from '@gt-automotive/database';
import { VendorRepository } from './vendor.repository';

/**
 * Integration test: exercises VendorRepository against a real Postgres
 * database (no mocks). Vendor is a standalone model (no required FKs), so no
 * parent rows are needed. The repository instantiates its own PrismaClient
 * internally; we use a separate PrismaService only for cleanup.
 */
describe('VendorRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: VendorRepository;

  const vendorIds: string[] = [];
  const stamp = Date.now();
  let counter = 0;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new VendorRepository();
  });

  afterAll(async () => {
    if (vendorIds.length) {
      await prisma.vendor.deleteMany({ where: { id: { in: vendorIds } } });
    }
    await prisma.$disconnect();
    // Disconnect the repository's internal PrismaClient too.
    await (repository as any).prisma.$disconnect();
  });

  async function makeVendor(overrides: Record<string, any> = {}) {
    counter += 1;
    const vendor = await repository.create({
      name: overrides.name ?? `IntVendor-${stamp}-${counter}`,
      contactPerson: overrides.contactPerson ?? 'Jane Contact',
      email: overrides.email ?? `vendor-${stamp}-${counter}@example.com`,
      phone: overrides.phone ?? '5551230000',
      address: overrides.address,
      taxId: overrides.taxId,
      paymentTerms: overrides.paymentTerms ?? 'Net 30',
      isActive: overrides.isActive,
      notes: overrides.notes,
    } as any);
    vendorIds.push(vendor.id);
    return vendor;
  }

  it('persists and reads back a vendor (defaults isActive to true)', async () => {
    const vendor = await makeVendor({ name: `Persisted-${stamp}` });

    const found = (await repository.findById(vendor.id)) as any;
    expect(found).not.toBeNull();
    expect(found.name).toBe(`Persisted-${stamp}`);
    expect(found.isActive).toBe(true);
    // findById includes _count of related invoices
    expect(found._count).toHaveProperty('purchaseInvoices');
    expect(found._count).toHaveProperty('expenseInvoices');
  });

  it('findByName looks up a vendor by its unique name', async () => {
    const name = `NamedVendor-${stamp}-${(counter += 1)}`;
    const vendor = await makeVendor({ name });

    const found = await repository.findByName(name);
    expect(found?.id).toBe(vendor.id);
  });

  it('search matches by name, contactPerson, or email (active only)', async () => {
    const token = `Findable${stamp}${(counter += 1)}`;
    const vendor = await makeVendor({ name: `${token} Supplies` });

    const byName = await repository.search(token);
    expect(byName.map((v) => v.id)).toContain(vendor.id);

    const byEmail = await repository.search(vendor.email as string);
    expect(byEmail.map((v) => v.id)).toContain(vendor.id);
  });

  it('search excludes inactive vendors', async () => {
    const token = `Inactive${stamp}${(counter += 1)}`;
    const vendor = await makeVendor({ name: `${token} Co`, isActive: false });

    const results = await repository.search(token);
    expect(results.map((v) => v.id)).not.toContain(vendor.id);
  });

  it('updates a vendor', async () => {
    const vendor = await makeVendor();

    const updated = (await repository.update(vendor.id, {
      contactPerson: 'New Contact',
      paymentTerms: 'Due on receipt',
    } as any)) as any;

    expect(updated.contactPerson).toBe('New Contact');
    expect(updated.paymentTerms).toBe('Due on receipt');
  });

  it('delete performs a soft delete (sets isActive=false)', async () => {
    const vendor = await makeVendor();

    const deleted = await repository.delete(vendor.id);
    expect(deleted.isActive).toBe(false);

    // Row still exists (soft delete) — still findable by id.
    const found = await repository.findById(vendor.id);
    expect(found).not.toBeNull();
  });

  it('findActive returns only active vendors', async () => {
    const active = await makeVendor();
    const inactive = await makeVendor({ isActive: false });

    const results = await repository.findActive();
    const ids = results.map((v) => v.id);
    expect(ids).toContain(active.id);
    expect(ids).not.toContain(inactive.id);
  });

  it('count returns a non-negative total reflecting created vendors', async () => {
    const before = await repository.count();
    await makeVendor();
    const after = await repository.count();
    expect(after).toBeGreaterThanOrEqual(before + 1);
  });

  it('findAll returns vendors with relation counts', async () => {
    const vendor = await makeVendor();

    const all = await repository.findAll(0, 200);
    const match = all.find((v) => v.id === vendor.id) as any;
    expect(match).toBeDefined();
    expect(match._count).toHaveProperty('purchaseInvoices');
  });
});
