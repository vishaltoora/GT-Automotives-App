import {
  InspectionItemStatus,
  InspectionOverallStatus,
  InspectionStatus,
  InspectionType,
} from '@prisma/client';

export interface CreateInspectionDto {
  templateId: string;
  customerId: string;
  vehicleId?: string;
  appointmentId?: string;
  invoiceId?: string;
  roNumber?: string;
  mileage?: number;
}

export interface UpdateInspectionDto {
  status?: InspectionStatus;
  overallStatus?: InspectionOverallStatus;
  mileage?: number;
  technicianNotes?: string;
  customerNotes?: string;
}

export interface UpdateInspectionResultDto {
  status?: InspectionItemStatus | null;
  value?: string | null;
  notes?: string | null;
  selectedOptions?: string[];
}

export interface InspectionTemplateQueryDto {
  type?: InspectionType;
}
