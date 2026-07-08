import axios from 'axios';
import gtLogoImage from '../images-and-logos/logo.png';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export type InspectionType =
  | 'PEACE_OF_MIND'
  | 'OUT_OF_PROVINCE'
  | 'PRE_PURCHASE'
  | 'SEASONAL'
  | 'CUSTOM';
export type InspectionStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FINALIZED'
  | 'CANCELLED';
export type InspectionItemKind =
  | 'CONDITION'
  | 'MEASUREMENT'
  | 'MULTI_SELECT'
  | 'TEXT';
export type InspectionItemStatus =
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'NOT_APPLICABLE'
  | 'NOT_INSPECTED';
export type InspectionOverallStatus =
  | 'GOOD'
  | 'ATTENTION_SOON'
  | 'NEEDS_REPAIR'
  | 'UNSAFE';

export interface InspectionTemplate {
  id: string;
  name: string;
  slug: string;
  type: InspectionType;
  description?: string;
  sections: InspectionSection[];
}

export interface InspectionSection {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  items: InspectionItem[];
}

export interface InspectionItem {
  id: string;
  sectionId: string;
  label: string;
  kind: InspectionItemKind;
  isRequired: boolean;
  sortOrder: number;
  positionGroup?: 'TIRE_SET' | 'BRAKE_SET';
  unit?: string;
  options?: {
    values?: string[];
    positions?: string[];
    affectedParts?: string[];
  };
}

export interface InspectionResult {
  id: string;
  inspectionId: string;
  itemId: string;
  position: string;
  status?: InspectionItemStatus | null;
  value?: string | null;
  notes?: string | null;
  selectedOptions: string[];
  sortOrder: number;
}

export interface Inspection {
  id: string;
  templateId: string;
  customerId: string;
  vehicleId?: string;
  invoiceId?: string;
  repairOrderId?: string;
  roNumber?: string;
  status: InspectionStatus;
  overallStatus?: InspectionOverallStatus;
  mileage?: number;
  technicianNotes?: string;
  customerNotes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  template: InspectionTemplate;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    email?: string;
    phone?: string;
  };
  vehicle?: {
    id: string;
    year: number;
    make: string;
    model: string;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
  };
  results: InspectionResult[];
  _count?: {
    results: number;
    media: number;
  };
}

export interface CreateInspectionDto {
  templateId: string;
  customerId: string;
  vehicleId?: string;
  repairOrderId?: string;
  roNumber?: string;
  mileage?: number;
}

export interface UpdateInspectionResultDto {
  status?: InspectionItemStatus | null;
  value?: string | null;
  notes?: string | null;
  selectedOptions?: string[];
}

export interface InspectionFeeItem {
  id: string;
  name: string;
  description?: string | null;
  type?: InspectionType | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionFeeItemDto {
  name: string;
  description?: string;
  type?: InspectionType;
  price: number;
  isActive?: boolean;
}

export type UpdateInspectionFeeItemDto = Partial<CreateInspectionFeeItemDto>;

export interface GenerateInspectionInvoiceDto {
  feeItemId: string;
  companyId: string;
  paymentMethod?: string;
}

class InspectionService {
  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatStatus(status?: InspectionItemStatus | null): string {
    if (!status) return 'Not checked';
    return status.replace('_', ' ');
  }

  private generatePrintHtml(inspection: Inspection): string {
    const customerName =
      [inspection.customer.firstName, inspection.customer.lastName]
        .filter(Boolean)
        .join(' ') ||
      inspection.customer.businessName ||
      'Customer';
    const vehicleName = inspection.vehicle
      ? `${inspection.vehicle.year} ${inspection.vehicle.make} ${inspection.vehicle.model}`
      : 'Vehicle not selected';
    const resultByItemId = new Map<string, InspectionResult[]>();

    for (const result of inspection.results) {
      resultByItemId.set(result.itemId, [
        ...(resultByItemId.get(result.itemId) || []),
        result,
      ]);
    }

    const statusCounts = inspection.results.reduce(
      (counts, result) => {
        if (result.status === 'GOOD') counts.good += 1;
        if (result.status === 'FAIR') counts.fair += 1;
        if (result.status === 'POOR') counts.poor += 1;
        return counts;
      },
      { good: 0, fair: 0, poor: 0 }
    );

    const metaRow = (label: string, value: unknown) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        return '';
      }

      return `<div class="meta-row"><span class="meta-label">${this.escapeHtml(
        label
      )}:</span><span>${this.escapeHtml(value)}</span></div>`;
    };

    const sectionsHtml = inspection.template.sections
      .map(
        (section) => `
      <section class="section">
        <h2>${this.escapeHtml(section.title)}</h2>
        ${section.items
          .map((item) => {
            const results = resultByItemId.get(item.id) || [];
            return `
            <div class="item">
              <h3>${this.escapeHtml(item.label)}</h3>
              ${results
                .map(
                  (result) => `
                <div class="result">
                  <div class="result-main">
                    <span class="position">${
                      result.position === 'GENERAL'
                        ? ''
                        : this.escapeHtml(result.position)
                    }</span>
                    <span class="status ${String(
                      result.status || 'empty'
                    ).toLowerCase()}">${this.escapeHtml(
                    this.formatStatus(result.status)
                  )}</span>
                    ${
                      result.value
                        ? `<span class="value">${this.escapeHtml(
                            result.value
                          )}${
                            item.unit ? ` ${this.escapeHtml(item.unit)}` : ''
                          }</span>`
                        : ''
                    }
                  </div>
                  ${
                    result.selectedOptions?.length
                      ? `<p><strong>Affected part(s):</strong> ${this.escapeHtml(
                          result.selectedOptions.join(', ')
                        )}</p>`
                      : ''
                  }
                  ${
                    result.notes
                      ? `<p><strong>Notes:</strong> ${this.escapeHtml(
                          result.notes
                        )}</p>`
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            </div>
          `;
          })
          .join('')}
      </section>
    `
      )
      .join('');

    return `
      <!doctype html>
      <html>
        <head>
          <title>${this.escapeHtml(
            inspection.template.name
          )} - ${this.escapeHtml(customerName)}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #172033; margin: 0; padding: 24px; background: #f6f8fb; }
            .report { width: 8.5in; max-width: 100%; min-height: 11in; margin: 0 auto; background: white; padding: 0.5in; border: 1px solid #d8dee9; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #243c55; padding-bottom: 10px; margin-bottom: 18px; }
            .company-info { flex: 1; }
            .company-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .logo { width: 80px; height: 80px; object-fit: contain; flex: 0 0 auto; }
            .report-details { text-align: right; min-width: 190px; }
            .report-details h2 { margin: 0; color: #333; font-size: 22px; }
            .company-info h1 { margin: 0; color: #243c55; font-size: 26px; }
            .company-info p { margin: 0; }
            .company-contact { margin-top: 8px !important; font-size: 13px; }
            h1 { margin: 0 0 6px; font-size: 28px; color: #10264a; }
            h2 { margin: 0 0 12px; font-size: 18px; color: #10264a; border-bottom: 1px solid #d8dee9; padding-bottom: 8px; }
            h3 { margin: 0 0 8px; font-size: 14px; }
            .meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; margin-bottom: 18px; font-size: 13px; }
            .meta-left, .meta-right { display: grid; gap: 8px; min-width: 0; }
            .meta-right { justify-items: end; margin-left: auto; min-width: 220px; }
            .meta-row { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 4px; align-items: start; }
            .meta-right .meta-row { grid-template-columns: max-content max-content; justify-content: end; gap: 4px; }
            .meta-label { font-weight: 700; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 18px 0; }
            .summary div { border: 1px solid #d8dee9; padding: 10px; text-align: center; font-weight: 700; }
            .section { page-break-inside: avoid; margin-top: 22px; }
            .item { border: 1px solid #e1e6ef; padding: 12px; margin-bottom: 10px; page-break-inside: avoid; }
            .result { padding: 8px 0; border-top: 1px solid #eef2f7; }
            .result:first-of-type { border-top: 0; }
            .result-main { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            .position { font-weight: 700; min-width: 34px; }
            .status { border-radius: 4px; padding: 4px 8px; font-size: 12px; font-weight: 700; border: 1px solid #bcc7d6; }
            .status.good { color: #1b5e20; border-color: #81c784; background: #e8f5e9; }
            .status.fair { color: #8a5200; border-color: #ffcc80; background: #fff3e0; }
            .status.poor { color: #b71c1c; border-color: #ef9a9a; background: #ffebee; }
            .value { font-weight: 700; }
            p { margin: 6px 0 0; font-size: 13px; }
            .footer { margin-top: 28px; font-size: 12px; color: #5b6472; border-top: 1px solid #d8dee9; padding-top: 12px; }
            @media print {
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { background: white; padding: 0; font-size: 11px; }
              .report { border: 0; width: 100%; min-height: auto; max-width: none; padding: 16px; }
              .header { gap: 14px; padding-bottom: 6px; margin-bottom: 10px; }
              .company-brand { gap: 8px; margin-bottom: 4px; }
              .logo { width: 58px; height: 58px; }
              .company-info h1 { font-size: 20px; }
              .company-info p { font-size: 11px !important; }
              .company-contact { margin-top: 4px !important; font-size: 11px; }
              .report-details { min-width: 150px; }
              .report-details h2 { font-size: 16px; padding-bottom: 4px; margin-bottom: 6px; }
              h2 { font-size: 14px; margin-bottom: 8px; padding-bottom: 5px; }
              h3 { font-size: 11px; margin-bottom: 5px; }
              .meta { gap: 18px; margin-bottom: 10px; font-size: 11px; }
              .meta-left, .meta-right { gap: 4px; }
              .meta-right { min-width: 0; }
              .meta-row { grid-template-columns: max-content minmax(0, 1fr); gap: 3px; }
              .summary { gap: 6px; margin: 10px 0; }
              .summary div { padding: 6px; }
              .section { margin-top: 12px; }
              .item { padding: 7px; margin-bottom: 6px; }
              .result { padding: 5px 0; }
              .result-main { gap: 6px; }
              .position { min-width: 24px; }
              .status { padding: 2px 5px; font-size: 10px; }
              p { margin-top: 4px; font-size: 11px; }
              .footer { margin-top: 16px; font-size: 10px; padding-top: 8px; }
              @page { size: 8.5in 11in; margin: 0.65in; }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <div class="company-info">
                <div class="company-brand">
                  <img class="logo" src="${this.escapeHtml(
                    gtLogoImage
                  )}" alt="GT Automotives Logo" />
                  <div>
                    <h1>GT Automotives</h1>
                    <p style="font-size: 14px; color: #666;">Professional Tire & Auto Services</p>
                    <p style="font-size: 12px; color: #888; font-style: italic;">16472991 Canada INC.</p>
                  </div>
                </div>
                <p class="company-contact">473 3rd Ave<br>
                Prince George, BC V2L 3C1<br>
                Phone: 250-570-2333<br>
                Email: gt-automotives@outlook.com</p>
              </div>
              <div class="report-details">
                <h2>INSPECTION REPORT</h2>
                <p><strong>Type:</strong> ${this.escapeHtml(
                  inspection.template.name
                )}<br>
                <strong>RO:</strong> ${this.escapeHtml(
                  inspection.roNumber || '-'
                )}<br>
                <strong>Status:</strong> ${this.escapeHtml(
                  inspection.status.replace('_', ' ')
                )}<br>
                <strong>Date:</strong> ${this.escapeHtml(
                  new Date(inspection.createdAt).toLocaleDateString()
                )}</p>
              </div>
            </div>
            <div class="meta">
              <div class="meta-left">
                ${metaRow('Customer', customerName)}
                ${inspection.vehicle ? metaRow('Vehicle', vehicleName) : ''}
                ${metaRow('VIN', inspection.vehicle?.vin)}
              </div>
              <div class="meta-right">
                ${metaRow('Phone', inspection.customer.phone)}
                ${metaRow(
                  'Mileage',
                  inspection.mileage || inspection.vehicle?.mileage
                )}
                ${metaRow('Plate', inspection.vehicle?.licensePlate)}
              </div>
            </div>
            <div class="summary">
              <div>Good<br>${statusCounts.good}</div>
              <div>Fair<br>${statusCounts.fair}</div>
              <div>Poor<br>${statusCounts.poor}</div>
            </div>
            ${sectionsHtml}
            <div class="footer">Generated from GT Automotives on ${this.escapeHtml(
              new Date().toLocaleString()
            )}</div>
          </div>
        </body>
      </html>
    `;
  }

  async getTemplates(): Promise<InspectionTemplate[]> {
    const response = await apiClient.get('/inspections/templates');
    return response.data;
  }

  async getInspections(): Promise<Inspection[]> {
    const response = await apiClient.get('/inspections');
    return response.data;
  }

  async getInspection(id: string): Promise<Inspection> {
    const response = await apiClient.get(`/inspections/${id}`);
    return response.data;
  }

  async createInspection(data: CreateInspectionDto): Promise<Inspection> {
    const response = await apiClient.post('/inspections', data);
    return response.data;
  }

  async updateResult(
    inspectionId: string,
    resultId: string,
    data: UpdateInspectionResultDto
  ): Promise<Inspection> {
    const response = await apiClient.patch(
      `/inspections/${inspectionId}/results/${resultId}`,
      data
    );
    return response.data;
  }

  async updateInspection(
    id: string,
    data: { technicianNotes?: string; customerNotes?: string; mileage?: number }
  ): Promise<Inspection> {
    const response = await apiClient.patch(`/inspections/${id}`, data);
    return response.data;
  }

  async completeInspection(id: string): Promise<Inspection> {
    const response = await apiClient.post(`/inspections/${id}/complete`);
    return response.data;
  }

  async deleteInspection(id: string): Promise<void> {
    await apiClient.delete(`/inspections/${id}`);
  }

  // --- Admin-managed inspection fee catalog ---

  async getFeeItems(): Promise<InspectionFeeItem[]> {
    const response = await apiClient.get('/inspections/fee-items');
    return response.data;
  }

  async createFeeItem(
    data: CreateInspectionFeeItemDto
  ): Promise<InspectionFeeItem> {
    const response = await apiClient.post('/inspections/fee-items', data);
    return response.data;
  }

  async updateFeeItem(
    id: string,
    data: UpdateInspectionFeeItemDto
  ): Promise<InspectionFeeItem> {
    const response = await apiClient.patch(
      `/inspections/fee-items/${id}`,
      data
    );
    return response.data;
  }

  async deleteFeeItem(id: string): Promise<void> {
    await apiClient.delete(`/inspections/fee-items/${id}`);
  }

  async generateInvoice(
    id: string,
    data: GenerateInspectionInvoiceDto
  ): Promise<Inspection> {
    const response = await apiClient.post(
      `/inspections/${id}/generate-invoice`,
      data
    );
    return response.data;
  }

  async printInspection(id: string): Promise<void> {
    const inspection = await this.getInspection(id);
    const htmlContent = this.generatePrintHtml(inspection);
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const fallbackWindow = window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (!fallbackWindow) {
        throw new Error(
          'Popup blocked by browser. Please allow popups for printing.'
        );
      }
      fallbackWindow.onload = () =>
        setTimeout(() => fallbackWindow.print(), 500);
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
}

export const inspectionService = new InspectionService();
