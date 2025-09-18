// Simple enums for frontend use
export enum TireType {
  ALL_SEASON = 'ALL_SEASON',
  SUMMER = 'SUMMER',
  WINTER = 'WINTER',
  PERFORMANCE = 'PERFORMANCE',
  OFF_ROAD = 'OFF_ROAD',
}

export enum TireCondition {
  NEW = 'NEW',
  USED_EXCELLENT = 'USED_EXCELLENT',
  USED_GOOD = 'USED_GOOD',
  USED_FAIR = 'USED_FAIR',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  E_TRANSFER = 'E_TRANSFER',
  FINANCING = 'FINANCING',
}

export enum InvoiceItemType {
  TIRE = 'TIRE',
  SERVICE = 'SERVICE',
  PART = 'PART',
  OTHER = 'OTHER',
  DISCOUNT = 'DISCOUNT',
  DISCOUNT_PERCENTAGE = 'DISCOUNT_PERCENTAGE',
}