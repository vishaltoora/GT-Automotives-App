import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (window.Clerk?.session) {
    const token = await window.Clerk.session.getToken({});
    if (token) {
      localStorage.setItem('authToken', token);
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  }
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Types ----

export type ROStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_PARTS'
  | 'READY'
  | 'CLOSED'
  | 'INVOICED';
export type ROServiceType = 'LABOR' | 'PART' | 'OTHER';
export type ROServiceStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DECLINED';
export type ROMediaType =
  | 'ARRIVAL_CONDITION'
  | 'DAMAGE_DOCUMENTATION'
  | 'WORK_IN_PROGRESS'
  | 'WORK_COMPLETED'
  | 'PARTS'
  | 'OTHER';

export interface ROEmployee {
  id: string;
  userId: string;
  role?: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface ROService {
  id: string;
  repairOrderId: string;
  description: string;
  type: ROServiceType;
  quantity: number;
  unitPrice: number;
  total: number;
  technicianNotes?: string;
  status: ROServiceStatus;
  completedById?: string;
  completedAt?: string;
  completedBy?: { id: string; firstName: string; lastName: string };
  media: ROMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface ROMedia {
  id: string;
  repairOrderId: string;
  roServiceId?: string;
  fileUrl: string;
  blobName?: string;
  containerName?: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
  caption?: string;
  mediaType: ROMediaType;
  sortOrder: number;
  uploadedById: string;
  uploadedBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface RepairOrder {
  id: string;
  roNumber: string;
  appointmentId: string;
  customerId: string;
  vehicleId?: string;
  noVehicle?: boolean;
  status: ROStatus;
  customerConcern?: string;
  technicianNotes?: string;
  mileageIn?: number;
  mileageOut?: number;
  estimatedCost?: number;
  openedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    businessName?: string;
    pstExempt?: boolean;
    fleetDiscount?: boolean;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
  };
  appointment?: {
    id: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceType: string;
    appointmentType: string;
    notes?: string;
    status: string;
  };
  employees: ROEmployee[];
  services: ROService[];
  inspections: Array<{
    id: string;
    status: string;
    overallStatus?: string;
    invoiceId?: string | null;
    createdAt: string;
    completedAt?: string;
    template?: { type?: string; name?: string };
  }>;
  media: ROMedia[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
  };
}

// ---- API functions ----

export const repairOrderRequests = {
  getAll: (params?: Record<string, string>) =>
    apiClient
      .get<RepairOrder[]>('/repair-orders', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<RepairOrder>(`/repair-orders/${id}`).then((r) => r.data),

  getByVehicle: (vehicleId: string) =>
    apiClient
      .get<RepairOrder[]>(`/repair-orders/vehicle/${vehicleId}`)
      .then((r) => r.data),

  create: (data: {
    appointmentId: string;
    customerId: string;
    vehicleId?: string;
    customerConcern?: string;
    employeeIds?: string[];
  }) => apiClient.post<RepairOrder>('/repair-orders', data).then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      status: ROStatus;
      vehicleId: string;
      noVehicle: boolean;
      customerConcern: string;
      technicianNotes: string;
      mileageIn: number;
      mileageOut: number;
      estimatedCost: number;
    }>
  ) =>
    apiClient
      .patch<RepairOrder>(`/repair-orders/${id}`, data)
      .then((r) => r.data),

  close: (
    id: string,
    companyId: string,
    feeItemId?: string,
    paymentMethod?: string
  ) =>
    apiClient
      .post(`/repair-orders/${id}/close`, {
        companyId,
        feeItemId,
        paymentMethod,
      })
      .then((r) => r.data),

  reopen: (id: string) =>
    apiClient
      .post<RepairOrder>(`/repair-orders/${id}/reopen`)
      .then((r) => r.data),

  // Services
  addService: (
    roId: string,
    data: {
      description: string;
      type?: ROServiceType;
      quantity?: number;
      unitPrice?: number;
      technicianNotes?: string;
    }
  ) =>
    apiClient
      .post<ROService>(`/repair-orders/${roId}/services`, data)
      .then((r) => r.data),

  updateService: (
    roId: string,
    serviceId: string,
    data: Partial<{
      description: string;
      type: ROServiceType;
      quantity: number;
      unitPrice: number;
      technicianNotes: string;
      status: ROServiceStatus;
    }>
  ) =>
    apiClient
      .patch<ROService>(`/repair-orders/${roId}/services/${serviceId}`, data)
      .then((r) => r.data),

  removeService: (roId: string, serviceId: string) =>
    apiClient.delete(`/repair-orders/${roId}/services/${serviceId}`),

  // Media
  uploadMedia: (
    roId: string,
    file: File,
    mediaType: ROMediaType,
    caption?: string,
    roServiceId?: string
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('mediaType', mediaType);
    if (caption) form.append('caption', caption);
    if (roServiceId) form.append('roServiceId', roServiceId);
    return apiClient
      .post<ROMedia>(`/repair-orders/${roId}/media`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  uploadServiceMedia: (
    roId: string,
    serviceId: string,
    file: File,
    mediaType: ROMediaType,
    caption?: string
  ) => {
    const form = new FormData();
    form.append('file', file);
    form.append('mediaType', mediaType);
    if (caption) form.append('caption', caption);
    return apiClient
      .post<ROMedia>(
        `/repair-orders/${roId}/services/${serviceId}/media`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      .then((r) => r.data);
  },

  updateMedia: (
    roId: string,
    mediaId: string,
    data: { caption?: string; mediaType?: ROMediaType }
  ) =>
    apiClient
      .patch<ROMedia>(`/repair-orders/${roId}/media/${mediaId}`, data)
      .then((r) => r.data),

  removeMedia: (roId: string, mediaId: string) =>
    apiClient.delete(`/repair-orders/${roId}/media/${mediaId}`),
};
