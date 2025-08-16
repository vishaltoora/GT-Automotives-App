export enum TireType {
  ALL_SEASON = 'ALL_SEASON',
  SUMMER = 'SUMMER',
  WINTER = 'WINTER',
  PERFORMANCE = 'PERFORMANCE',
  OFF_ROAD = 'OFF_ROAD',
  RUN_FLAT = 'RUN_FLAT',
}

export enum TireCondition {
  NEW = 'NEW',
  USED_EXCELLENT = 'USED_EXCELLENT',
  USED_GOOD = 'USED_GOOD',
  USED_FAIR = 'USED_FAIR',
}

export interface ITire {
  id: string;
  brand: string;
  model: string;
  size: string;
  type: TireType;
  condition: TireCondition;
  quantity: number;
  price: number;
  cost?: number; // Only visible to admin
  location?: string;
  minStock: number;
  imageUrl?: string;
  images?: string[]; // For multiple images (used tires)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITireCreateInput {
  brand: string;
  model: string;
  size: string;
  type: TireType;
  condition: TireCondition;
  quantity: number;
  price: number;
  cost?: number;
  location?: string;
  minStock?: number;
  imageUrl?: string;
  notes?: string;
}

export interface ITireUpdateInput {
  brand?: string;
  model?: string;
  size?: string;
  type?: TireType;
  condition?: TireCondition;
  quantity?: number;
  price?: number;
  cost?: number;
  location?: string;
  minStock?: number;
  imageUrl?: string;
  notes?: string;
}

export interface ITireFilters {
  brand?: string;
  model?: string;
  size?: string;
  type?: TireType;
  condition?: TireCondition;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface ITireSearchParams {
  filters?: ITireFilters;
  search?: string;
  sortBy?: 'brand' | 'model' | 'size' | 'price' | 'quantity' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ITireSearchResult {
  items: ITire[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IStockAdjustment {
  tireId: string;
  quantity: number;
  type: 'add' | 'remove' | 'set';
  reason: string;
  userId: string;
  createdAt: Date;
}

export interface ITireImage {
  id: string;
  tireId: string;
  url: string;
  isPrimary: boolean;
  createdAt: Date;
}

// API Contract
export interface ITireAPIEndpoints {
  // Public endpoints (customers can view)
  'GET /api/tires': {
    query: ITireSearchParams;
    response: ITireSearchResult;
  };
  'GET /api/tires/:id': {
    params: { id: string };
    response: ITire;
  };

  // Staff endpoints
  'POST /api/tires': {
    body: ITireCreateInput;
    response: ITire;
    roles: ['staff', 'admin'];
  };
  'PUT /api/tires/:id': {
    params: { id: string };
    body: ITireUpdateInput;
    response: ITire;
    roles: ['staff', 'admin'];
  };
  'POST /api/tires/:id/adjust-stock': {
    params: { id: string };
    body: { quantity: number; type: 'add' | 'remove' | 'set'; reason: string };
    response: ITire;
    roles: ['staff', 'admin'];
  };

  // Admin only endpoints
  'DELETE /api/tires/:id': {
    params: { id: string };
    response: { success: boolean };
    roles: ['admin'];
  };
  'GET /api/tires/low-stock': {
    response: ITire[];
    roles: ['staff', 'admin'];
  };
  'GET /api/tires/reports/inventory': {
    query: { startDate?: string; endDate?: string };
    response: {
      totalValue: number;
      totalCost: number;
      totalItems: number;
      lowStockItems: ITire[];
      byBrand: Record<string, number>;
      byType: Record<TireType, number>;
    };
    roles: ['admin'];
  };

  // Image upload
  'POST /api/tires/:id/images': {
    params: { id: string };
    body: FormData;
    response: ITireImage;
    roles: ['staff', 'admin'];
  };
  'DELETE /api/tires/:id/images/:imageId': {
    params: { id: string; imageId: string };
    response: { success: boolean };
    roles: ['staff', 'admin'];
  };
}