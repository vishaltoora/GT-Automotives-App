// Tire Type Definitions
// These enums match the Prisma schema definitions for use in CI/CD environments
// where @prisma/client may not be available during build

export enum TireType {
  ALL_SEASON = 'ALL_SEASON',
  SUMMER = 'SUMMER',
  WINTER = 'WINTER',
  PERFORMANCE = 'PERFORMANCE',
  OFF_ROAD = 'OFF_ROAD',
  RUN_FLAT = 'RUN_FLAT'
}

export enum TireCondition {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
  DAMAGED = 'DAMAGED'
}

export enum TireStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  DAMAGED = 'DAMAGED'
}