import { DashboardService } from './dashboard.service';

/**
 * Unit tests for DashboardService.getStats.
 * Prisma is fully mocked. Focus is on the percentage-change math, trend
 * direction, low-stock filtering and the divide-by-zero guards.
 */
describe('DashboardService.getStats', () => {
  let service: DashboardService;
  let prisma: any;

  function buildPrisma(overrides: any = {}) {
    return {
      invoice: {
        aggregate: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      customer: { count: jest.fn().mockResolvedValue(0) },
      vehicle: { count: jest.fn().mockResolvedValue(0) },
      tire: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      ...overrides,
    };
  }

  it('computes revenue change and up trend', async () => {
    prisma = buildPrisma({
      invoice: {
        // first aggregate = total revenue, second = last month revenue
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({ _sum: { total: 150 } })
          .mockResolvedValueOnce({ _sum: { total: 100 } }),
        count: jest.fn().mockResolvedValue(0),
      },
    });
    service = new DashboardService(prisma);

    const stats = await service.getStats();
    expect(stats.revenue.value).toBe(150);
    // (150-100)/100*100 = 50
    expect(stats.revenue.change).toBe(50);
    expect(stats.revenue.trend).toBe('up');
  });

  it('returns 0 change and up trend when last month revenue is zero', async () => {
    prisma = buildPrisma({
      invoice: {
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({ _sum: { total: 200 } })
          .mockResolvedValueOnce({ _sum: { total: 0 } }),
        count: jest.fn().mockResolvedValue(0),
      },
    });
    service = new DashboardService(prisma);

    const stats = await service.getStats();
    expect(stats.revenue.change).toBe(0);
    expect(stats.revenue.trend).toBe('up'); // 0 >= 0
  });

  it('computes a down trend for negative customer change', async () => {
    prisma = buildPrisma({
      invoice: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 0 } }),
        count: jest.fn().mockResolvedValue(0),
      },
      customer: {
        // total customers (5), last month customers (10) -> decline
        count: jest.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(10),
      },
    });
    service = new DashboardService(prisma);

    const stats = await service.getStats();
    expect(stats.customers.value).toBe(5);
    // (5-10)/10*100 = -50
    expect(stats.customers.change).toBe(-50);
    expect(stats.customers.trend).toBe('down');
  });

  it('counts low-stock tires (quantity <= minStock) and sums inventory', async () => {
    prisma = buildPrisma({
      invoice: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 0 } }),
        count: jest.fn().mockResolvedValue(0),
      },
      tire: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 42 } }),
        findMany: jest.fn().mockResolvedValue([
          { quantity: 2, minStock: 5 }, // low
          { quantity: 5, minStock: 5 }, // low (equal)
          { quantity: 10, minStock: 5 }, // ok
        ]),
      },
    });
    service = new DashboardService(prisma);

    const stats = await service.getStats();
    expect(stats.inventory.value).toBe(42);
    expect(stats.inventory.lowStock).toBe(2);
  });

  it('rounds change to one decimal place', async () => {
    prisma = buildPrisma({
      invoice: {
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({ _sum: { total: 1 } })
          .mockResolvedValueOnce({ _sum: { total: 3 } }),
        count: jest.fn().mockResolvedValue(0),
      },
    });
    service = new DashboardService(prisma);

    const stats = await service.getStats();
    // (1-3)/3*100 = -66.66... -> -66.7
    expect(stats.revenue.change).toBe(-66.7);
  });
});
