/* eslint-disable */
export default {
  displayName: 'server',
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
  // Unit tests only — integration specs run via the `test-integration` target
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.integration-spec\\.ts$'],
  coverageDirectory: '../coverage/server',
};
