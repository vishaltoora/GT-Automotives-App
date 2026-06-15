import { CompaniesService } from './companies.service';

/**
 * Unit tests for CompaniesService.
 * Thin pass-throughs to Prisma; instantiated directly with a mocked PrismaService.
 */
describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      company: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    service = new CompaniesService(prisma as any);
  });

  describe('findAll', () => {
    it('returns companies ordered by default flag then name', async () => {
      const companies = [{ id: 'c1' }, { id: 'c2' }];
      prisma.company.findMany.mockResolvedValue(companies);

      const result = await service.findAll();

      expect(prisma.company.findMany).toHaveBeenCalledWith({
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });
      expect(result).toBe(companies);
    });
  });

  describe('findDefault', () => {
    it('returns the company flagged as default', async () => {
      const company = { id: 'c1', isDefault: true };
      prisma.company.findFirst.mockResolvedValue(company);

      const result = await service.findDefault();

      expect(prisma.company.findFirst).toHaveBeenCalledWith({
        where: { isDefault: true },
      });
      expect(result).toBe(company);
    });
  });

  describe('findById', () => {
    it('queries by unique id', async () => {
      const company = { id: 'c1' };
      prisma.company.findUnique.mockResolvedValue(company);

      const result = await service.findById('c1');

      expect(prisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
      expect(result).toBe(company);
    });
  });
});
