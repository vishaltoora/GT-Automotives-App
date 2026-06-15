/* eslint-disable */
export default {
  displayName: 'server-integration',
  preset: '../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^@gt-automotive/data$': '<rootDir>/../libs/data/src/index.ts',
    '^@gt-automotive/database$': '<rootDir>/../libs/database/src/index.ts',
  },
  // Integration tests hit a real Postgres database
  testMatch: ['<rootDir>/src/**/*.integration-spec.ts'],
  globalSetup: '<rootDir>/test/integration-global-setup.ts',
  // Integration tests share a DB connection — run serially to avoid cross-test races
  maxWorkers: 1,
  coverageDirectory: '../coverage/server-integration',
};
