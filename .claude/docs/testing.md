# Testing - GT Automotive Application

This document outlines the testing strategy, frameworks, and best practices implemented in the GT Automotive application.

## 🧪 Testing Strategy

### Testing Philosophy
- **Test-Driven Development**: Write tests before implementation where feasible
- **Coverage Goals**: Maintain >80% code coverage for critical business logic
- **Quality Gates**: All tests must pass before deployment
- **Continuous Testing**: Automated testing in CI/CD pipeline

### Testing Pyramid
```
    🔺 E2E Tests (10%)
      - User journey testing
      - Critical path validation
    
   🔺🔺 Integration Tests (30%)
        - API endpoint testing
        - Database integration
        - Service layer testing
    
  🔺🔺🔺 Unit Tests (60%)
      - Component testing
      - Utility function testing
      - Business logic validation
```

## 🧩 Testing Frameworks & Tools

### Frontend Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for tests
- **Cypress**: End-to-end testing (planned)

### Backend Testing
- **Jest**: Unit and integration testing
- **Supertest**: HTTP endpoint testing
- **Test Containers**: Database testing with real PostgreSQL
- **Prisma**: Database seeding for tests

### Testing Configuration
```json
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 🎯 Unit Testing

### React Component Testing
```typescript
// TireCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TireCard } from '../TireCard';

const mockTire = {
  id: '1',
  brand: 'Michelin',
  size: '225/60R16',
  type: 'ALL_SEASON',
  condition: 'NEW',
  price: 199.99,
  quantity: 5
};

describe('TireCard', () => {
  it('renders tire information correctly', () => {
    render(<TireCard tire={mockTire} onSelect={jest.fn()} />);
    
    expect(screen.getByText('Michelin')).toBeInTheDocument();
    expect(screen.getByText('225/60R16')).toBeInTheDocument();
    expect(screen.getByText('$199.99')).toBeInTheDocument();
  });

  it('calls onSelect when tire is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<TireCard tire={mockTire} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockTire);
  });
});
```

### Service Layer Testing
```typescript
// TiresService.test.ts
import { TiresService } from '../tires.service';
import { PrismaService } from '../prisma.service';

jest.mock('../prisma.service');

describe('TiresService', () => {
  let service: TiresService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = new PrismaService() as jest.Mocked<PrismaService>;
    service = new TiresService(prisma);
  });

  describe('findAll', () => {
    it('should return all tires', async () => {
      const mockTires = [mockTire];
      prisma.tire.findMany.mockResolvedValue(mockTires);

      const result = await service.findAll();

      expect(result).toEqual(mockTires);
      expect(prisma.tire.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });
  });
});
```

### Utility Function Testing
```typescript
// formatPrice.test.ts
import { formatPrice } from '../formatPrice';

describe('formatPrice', () => {
  it('formats price with dollar sign', () => {
    expect(formatPrice(199.99)).toBe('$199.99');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles undefined values', () => {
    expect(formatPrice(undefined)).toBe('$0.00');
  });
});
```

## 🔗 Integration Testing

### API Endpoint Testing
```typescript
// tires.controller.test.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('TiresController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/tires (GET)', () => {
    it('should return all tires', () => {
      return request(app.getHttpServer())
        .get('/api/tires')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
  });

  describe('/api/tires (POST)', () => {
    it('should create a new tire', () => {
      return request(app.getHttpServer())
        .post('/api/tires')
        .send(mockTireDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.brand).toBe(mockTireDto.brand);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Database Integration Testing
```typescript
// database.test.ts
import { PrismaClient } from '@prisma/client';

describe('Database Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } }
    });
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.invoice.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.tire.deleteMany();
  });

  it('should create customer and retrieve it', async () => {
    const customer = await prisma.customer.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    });

    expect(customer.firstName).toBe('John');

    const retrieved = await prisma.customer.findUnique({
      where: { id: customer.id }
    });

    expect(retrieved?.firstName).toBe('John');
  });
});
```

## 🚀 API Testing

### Mock Service Worker Setup
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/tires', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([mockTire])
    );
  }),

  rest.post('/api/tires', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ ...req.body, id: '123' })
    );
  }),

  rest.get('/api/customers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([mockCustomer])
    );
  })
];
```

### Test Setup
```typescript
// setupTests.ts
import { server } from './mocks/server';
import '@testing-library/jest-dom';

// Mock ResizeObserver for Material-UI components
global.ResizeObserver = require('resize-observer-polyfill');

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 🎭 Authentication Testing

### Clerk Mock Provider
```typescript
// MockClerkProvider.tsx
import { ClerkProvider } from '@clerk/clerk-react';

export const MockClerkProvider = ({ children }: { children: React.ReactNode }) => {
  const mockUser = {
    id: 'user_123',
    emailAddresses: [{ emailAddress: 'admin@example.com' }],
    publicMetadata: { role: 'ADMIN' }
  };

  return (
    <ClerkProvider publishableKey="pk_test_mock">
      {children}
    </ClerkProvider>
  );
};
```

### Role-based Testing
```typescript
// RoleGuard.test.tsx
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../RoleGuard';
import { MockClerkProvider } from './MockClerkProvider';

describe('RoleGuard', () => {
  it('renders content for authorized role', () => {
    render(
      <MockClerkProvider mockRole="ADMIN">
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin Content</div>
        </RoleGuard>
      </MockClerkProvider>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('does not render content for unauthorized role', () => {
    render(
      <MockClerkProvider mockRole="CUSTOMER">
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin Content</div>
        </RoleGuard>
      </MockClerkProvider>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
```

## 🎯 End-to-End Testing

### Cypress Configuration (Planned)
```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true
  },
});
```

### E2E Test Example
```javascript
// cypress/e2e/invoice-creation.cy.js
describe('Invoice Creation', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/dashboard');
  });

  it('should create a new invoice', () => {
    cy.get('[data-testid="create-invoice-button"]').click();
    
    // Select customer
    cy.get('[data-testid="customer-select"]').click();
    cy.get('[data-testid="customer-option-1"]').click();
    
    // Add tire to invoice
    cy.get('[data-testid="add-tire-button"]').click();
    cy.get('[data-testid="tire-select"]').click();
    cy.get('[data-testid="tire-option-1"]').click();
    
    // Set quantity
    cy.get('[data-testid="quantity-input"]').type('2');
    
    // Save invoice
    cy.get('[data-testid="save-invoice-button"]').click();
    
    // Verify success
    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.url().should('include', '/admin/invoices');
  });
});
```

## 📊 Test Coverage & Quality

### Coverage Configuration
```json
// Coverage thresholds in jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "src/services/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### Quality Gates
```yaml
# GitHub Actions quality gates
- name: Run Tests
  run: yarn test --coverage --watchAll=false

- name: Check Coverage
  run: yarn test --coverage --coverageReporters=text-lcov | npx coveralls

- name: Quality Gate
  run: |
    if [ $(yarn test --coverage --silent | grep -o '[0-9]*%' | head -1 | sed 's/%//') -lt 80 ]; then
      echo "Coverage below threshold"
      exit 1
    fi
```

## 🚀 Continuous Testing

### GitHub Actions Testing
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: yarn install --frozen-lockfile
        
      - name: Run unit tests
        run: yarn test --coverage
        
      - name: Run integration tests
        run: yarn test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```

## 📝 Testing Best Practices

### Test Organization
- **Descriptive Names**: Test names should clearly describe what is being tested
- **AAA Pattern**: Arrange, Act, Assert structure for all tests
- **Single Responsibility**: Each test should test one specific behavior
- **Independent Tests**: Tests should not depend on each other

### Test Data Management
```typescript
// test-data/factories.ts
import { Customer, Tire } from '@prisma/client';

export const createMockCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  address: 'Prince George, BC',
  businessName: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockTire = (overrides?: Partial<Tire>): Tire => ({
  id: '1',
  brand: 'Michelin',
  size: '225/60R16',
  type: 'ALL_SEASON',
  condition: 'NEW',
  price: 199.99,
  quantity: 5,
  description: null,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});
```

### Performance Testing
```typescript
// Performance test example
describe('Performance Tests', () => {
  it('should load tire list within performance budget', async () => {
    const start = performance.now();
    
    render(<TireList tires={largeTireArray} />);
    await waitFor(() => screen.getByTestId('tire-list'));
    
    const end = performance.now();
    const renderTime = end - start;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });
});
```

## 🔍 Test Debugging

### Debug Configuration
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Test Scripts
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

## 📈 Testing Roadmap

### Current Status
- ✅ **Jest Configuration**: Unit testing framework setup
- ✅ **React Testing Library**: Component testing utilities
- ✅ **API Testing**: Basic endpoint testing
- 🔄 **Coverage Goals**: Working towards 80% coverage
- 📋 **E2E Testing**: Cypress setup planned

### Short-term Goals
- [ ] Achieve 80% test coverage for critical paths
- [ ] Implement comprehensive API testing
- [ ] Set up Cypress for E2E testing
- [ ] Add performance testing benchmarks

### Long-term Goals
- [ ] Visual regression testing
- [ ] Load testing with Artillery
- [ ] Accessibility testing automation
- [ ] Cross-browser testing with BrowserStack

---

**Last Updated**: September 5, 2025  
**Version**: 1.0  
**Reviewed By**: Development Team  
**Next Review**: December 5, 2025