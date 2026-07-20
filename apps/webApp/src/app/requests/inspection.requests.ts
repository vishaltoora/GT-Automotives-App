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
    additionalEmails?: string[];
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

    const formatPhone = (phone?: string | null) => {
      if (!phone) return '';
      const c = phone.replace(/\D/g, '');
      return c.length === 10
        ? `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`
        : phone;
    };

    const overallStatusMap: Record<
      InspectionOverallStatus,
      { label: string; cls: string }
    > = {
      GOOD: { label: 'Good — No issues found', cls: 'ov-good' },
      ATTENTION_SOON: {
        label: 'Attention Soon — Monitor recommended',
        cls: 'ov-fair',
      },
      NEEDS_REPAIR: {
        label: 'Needs Repair — Service recommended',
        cls: 'ov-poor',
      },
      UNSAFE: {
        label: 'Unsafe — Immediate attention required',
        cls: 'ov-poor',
      },
    };
    const overall = inspection.overallStatus
      ? overallStatusMap[inspection.overallStatus]
      : null;

    const sectionsHtml = inspection.template.sections
      .map((section) => {
        const itemsHtml = section.items
          .map((item) => {
            const results = resultByItemId.get(item.id) || [];
            if (results.length === 0) return '';
            const resultsHtml = results
              .map((result) => {
                const statusKey = String(
                  result.status || 'empty'
                ).toLowerCase();
                const pos =
                  result.position && result.position !== 'GENERAL'
                    ? `<span class="ins-pos">${this.escapeHtml(
                        result.position
                      )}</span>`
                    : '';
                const val = result.value
                  ? `<span class="ins-val">${this.escapeHtml(result.value)}${
                      item.unit ? ` ${this.escapeHtml(item.unit)}` : ''
                    }</span>`
                  : '';
                const options = result.selectedOptions?.length
                  ? `<span class="ins-extra"><strong>Affected:</strong> ${this.escapeHtml(
                      result.selectedOptions.join(', ')
                    )}</span>`
                  : '';
                const notes = result.notes
                  ? `<span class="ins-extra"><strong>Notes:</strong> ${this.escapeHtml(
                      result.notes
                    )}</span>`
                  : '';
                return `<div class="ins-result">${pos}<span class="ins-chip ${statusKey}">${this.escapeHtml(
                  this.formatStatus(result.status)
                )}</span>${val}${options}${notes}</div>`;
              })
              .join('');
            return `<div class="ins-item"><div class="ins-item-label">${this.escapeHtml(
              item.label
            )}</div><div class="ins-item-results">${resultsHtml}</div></div>`;
          })
          .join('');
        if (!itemsHtml.trim()) return '';
        return `<div class="ins-section"><h2 class="ins-section-title">${this.escapeHtml(
          section.title
        )}</h2><div class="ins-items">${itemsHtml}</div></div>`;
      })
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
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 24px; background: #f6f8fb; }
            .report { width: 8.5in; max-width: 100%; margin: 0 auto; background: white; padding: 0.5in; border: 1px solid #d8dee9; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #243c55; padding-bottom: 10px; margin-bottom: 15px; }
            .company-info { flex: 1; }
            .company-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .logo { width: 80px; height: 80px; object-fit: contain; flex: 0 0 auto; }
            .company-info h1 { margin: 0; color: #243c55; font-size: 26px; }
            .company-info p { margin: 0; }
            .company-contact { margin-top: 8px !important; font-size: 13px; }
            .report-details { text-align: right; min-width: 190px; }
            .report-details h2 { margin: 0; color: #333; font-size: 22px; }
            .report-details p { margin-top: 6px; font-size: 13px; }
            .meta { display: flex; justify-content: space-between; gap: 24px; margin: 12px 0; font-size: 13px; }
            .meta > div { flex: 1; }
            .meta-row { display: flex; gap: 6px; margin-bottom: 4px; }
            .meta-label { font-weight: 700; color: #243c55; min-width: 70px; }
            .overall { margin: 14px 0; padding: 12px 16px; border-radius: 6px; border: 1px solid; font-weight: 700; font-size: 15px; text-align: center; }
            .overall.ov-good { border-color: #81c784; background: #e8f5e9; color: #1b5e20; }
            .overall.ov-fair { border-color: #ffb74d; background: #fff3e0; color: #8a5200; }
            .overall.ov-poor { border-color: #ef9a9a; background: #ffebee; color: #b71c1c; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 14px 0; }
            .summary-card { border: 1px solid #d8dee9; border-radius: 6px; padding: 12px; text-align: center; }
            .summary-card .num { font-size: 24px; font-weight: 800; line-height: 1; }
            .summary-card .lbl { font-size: 12px; font-weight: 700; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .summary-card.good { color: #1b5e20; border-color: #81c784; background: #e8f5e9; }
            .summary-card.fair { color: #8a5200; border-color: #ffcc80; background: #fff3e0; }
            .summary-card.poor { color: #b71c1c; border-color: #ef9a9a; background: #ffebee; }
            .ins-section { margin-top: 14px; }
            .ins-section-title { margin: 0 0 8px; font-size: 14px; color: #10264a; border-bottom: 1px solid #d8dee9; padding-bottom: 5px; break-after: avoid; page-break-after: avoid; }
            .ins-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px; align-items: start; }
            .ins-item { border: 1px solid #e1e6ef; border-radius: 5px; padding: 6px 10px; page-break-inside: avoid; break-inside: avoid; }
            .ins-item-label { font-weight: 600; font-size: 11.5px; color: #10264a; margin-bottom: 3px; }
            .ins-result { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 11px; padding: 1px 0; }
            .ins-pos { font-weight: 700; color: #243c55; min-width: 30px; }
            .ins-chip { border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 700; border: 1px solid; white-space: nowrap; color: #5b6472; border-color: #cfd6e0; background: #f2f5f9; }
            .ins-chip.good { color: #1b5e20; border-color: #81c784; background: #e8f5e9; }
            .ins-chip.fair { color: #8a5200; border-color: #ffcc80; background: #fff3e0; }
            .ins-chip.poor { color: #b71c1c; border-color: #ef9a9a; background: #ffebee; }
            .ins-val { font-weight: 700; color: #10264a; }
            .ins-extra { width: 100%; margin-top: 2px; font-size: 10.5px; color: #555; }
            .footer { margin-top: 25px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 12px; }
            .footer .thanks { font-weight: bold; color: #1976d2; margin: 0 0 3px 0; }
            .footer p { margin: 0; }
            @media print {
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { background: white; padding: 0; }
              .report { border: 0; width: 100%; max-width: none; padding: 0; }
              .logo { width: 64px; height: 64px; }
              .company-info h1 { font-size: 22px; }
              .report-details h2 { font-size: 18px; }
              @page { size: 8.5in 11in; margin: 16mm 12mm; }
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
                <strong>RO #:</strong> ${this.escapeHtml(
                  inspection.roNumber || '-'
                )}<br>
                <strong>Status:</strong> ${this.escapeHtml(
                  inspection.status.replace(/_/g, ' ')
                )}<br>
                <strong>Date:</strong> ${this.escapeHtml(
                  new Date(
                    inspection.completedAt || inspection.createdAt
                  ).toLocaleDateString()
                )}</p>
              </div>
            </div>
            <div class="meta">
              <div>
                ${metaRow('Customer', customerName)}
                ${
                  inspection.customer.businessName
                    ? metaRow('Business', inspection.customer.businessName)
                    : ''
                }
                ${metaRow('Phone', formatPhone(inspection.customer.phone))}
              </div>
              <div>
                ${inspection.vehicle ? metaRow('Vehicle', vehicleName) : ''}
                ${metaRow('VIN', inspection.vehicle?.vin)}
                ${metaRow('Plate', inspection.vehicle?.licensePlate)}
                ${metaRow(
                  'Mileage',
                  inspection.mileage || inspection.vehicle?.mileage
                )}
              </div>
            </div>
            ${
              overall
                ? `<div class="overall ${
                    overall.cls
                  }">Overall Status: ${this.escapeHtml(overall.label)}</div>`
                : ''
            }
            <div class="summary">
              <div class="summary-card good"><div class="num">${
                statusCounts.good
              }</div><div class="lbl">Good</div></div>
              <div class="summary-card fair"><div class="num">${
                statusCounts.fair
              }</div><div class="lbl">Fair</div></div>
              <div class="summary-card poor"><div class="num">${
                statusCounts.poor
              }</div><div class="lbl">Poor</div></div>
            </div>
            ${sectionsHtml}
            <div class="footer">
              <p class="thanks">Thank you for trusting GT Automotives with your vehicle!</p>
              <p style="font-size: 12px;">GT Automotives - Your trusted automotive partner</p>
              <p style="font-size: 10px; color: #666; margin-top: 2px;">Mobile Service Available | Licensed &amp; Insured | Satisfaction Guaranteed</p>
            </div>
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

  async sendInspectionReportEmail(
    id: string,
    emails?: string | string[],
    saveToCustomer?: boolean
  ): Promise<{ success: boolean; message: string; emailUsed?: string }> {
    const emailList = Array.isArray(emails)
      ? emails
      : emails
      ? [emails]
      : undefined;
    const response = await apiClient.post(
      `/inspections/${id}/send-report-email`,
      { emails: emailList, saveToCustomer }
    );
    return response.data;
  }
}

export const inspectionService = new InspectionService();
