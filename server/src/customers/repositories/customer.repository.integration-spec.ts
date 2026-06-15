import { PrismaService } from '@gt-automotive/database';
import { CustomerRepository } from './customer.repository';

/**
 * Integration test: exercises CustomerRepository against a real Postgres
 * database (no mocks). The schema is applied by the integration global setup
 * (`server/test/integration-global-setup.ts`) before this runs.
 *
 * Requires DATABASE_URL pointing at a test database. See docker-compose.test.yml.
 */
describe('CustomerRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: CustomerRepository;
  const createdIds: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new CustomerRepository(prisma);
  });

  afterAll(async () => {
    if (createdIds.length) {
      await prisma.customer.deleteMany({ where: { id: { in: createdIds } } });
    }
    await prisma.$disconnect();
  });

  async function makeCustomer(overrides: Record<string, unknown> = {}) {
    const customer = await repository.create({
      firstName: 'Integration',
      lastName: 'Tester',
      email: `int-${Date.now()}-${Math.round(
        createdIds.length + 1
      )}@example.com`,
      ...overrides,
    } as any);
    createdIds.push(customer.id);
    return customer;
  }

  it('persists and reads back a customer', async () => {
    const created = await makeCustomer({ firstName: 'Persisted' });

    const found = await repository.findById(created.id);
    expect(found).not.toBeNull();
    expect(found?.firstName).toBe('Persisted');
    expect(found?.lastName).toBe('Tester');
  });

  it('finds a customer by email', async () => {
    const email = `findme-${Date.now()}@example.com`;
    const created = await makeCustomer({ email });

    const found = await repository.findByEmail(email);
    expect(found?.id).toBe(created.id);
    // findByEmail includes vehicles + counts
    expect(Array.isArray(found?.vehicles)).toBe(true);
  });

  it('searches customers case-insensitively by name', async () => {
    const unique = `Zylphar${Date.now()}`;
    const created = await makeCustomer({ businessName: unique });

    const results = await repository.search(unique.toLowerCase());
    expect(results.map((c) => c.id)).toContain(created.id);
  });
});
