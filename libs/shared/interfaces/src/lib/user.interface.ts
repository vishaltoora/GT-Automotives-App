import { RoleName } from './roles.enum.js';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  role?: Role;
  customer?: Customer;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  description?: string;
  permissions?: RolePermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string;
  role?: Role;
  permissionId: string;
  permission?: Permission;
}

export interface Customer {
  id: string;
  userId: string;
  user?: User;
  phone: string;
  address?: string;
  vehicles?: Vehicle[];
  invoices?: Invoice[];
  appointments?: Appointment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  customerId: string;
  customer?: Customer;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  vehicleId?: string;
  vehicle?: Vehicle;
  items?: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  tireId?: string;
  tire?: Tire;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tire {
  id: string;
  brand: string;
  model: string;
  size: string;
  type: string;
  condition: string;
  quantity: number;
  price: number;
  cost?: number;
  location?: string;
  minStock: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  customerId: string;
  customer?: Customer;
  vehicleId?: string;
  vehicle?: Vehicle;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  serviceType: string;
  status: string;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}