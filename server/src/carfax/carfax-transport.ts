import { Injectable, Logger } from '@nestjs/common';

/**
 * Provisional shape of a single CARFAX Service Data Transfer record.
 *
 * NOTE: The exact field names/casing are finalized in Phase 0 once CARFAX
 * (Canada) provides the HTTPS endpoint spec. Keep this as the single place that
 * knows the wire format so only this file changes when the real spec arrives.
 * NO customer PII is included by design.
 */
export interface CarfaxRecord {
  locationId: string;
  vin: string;
  serviceDate: string; // YYYY-MM-DD
  odometer?: number;
  odometerUnit: 'km' | 'mi';
  referenceNumber: string; // our invoice number (non-PII reference)
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
  };
  services: Array<{
    description: string;
    quantity?: number;
  }>;
}

export interface CarfaxSendResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Thin transport adapter for pushing records to CARFAX over HTTPS.
 *
 * This isolates "how a record leaves the building" from the record-building and
 * queue logic in CarfaxService. If CARFAX only offers SFTP, a sibling transport
 * can implement the same contract without touching the rest of the module.
 */
@Injectable()
export class CarfaxTransport {
  private readonly logger = new Logger(CarfaxTransport.name);
  private readonly apiUrl = process.env.CARFAX_API_URL;
  private readonly apiKey = process.env.CARFAX_API_KEY;

  isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiKey);
  }

  async send(record: CarfaxRecord): Promise<CarfaxSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error:
          'CARFAX transport is not configured (CARFAX_API_URL / CARFAX_API_KEY missing)',
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.apiUrl as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Provisional auth header - confirm scheme (Bearer vs X-API-Key) in Phase 0.
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(record),
        signal: controller.signal,
      });

      const text = await response.text();
      let body: any = undefined;
      try {
        body = text ? JSON.parse(text) : undefined;
      } catch {
        body = text;
      }

      if (!response.ok) {
        const error = `CARFAX responded ${response.status}: ${
          typeof body === 'string' ? body : JSON.stringify(body)
        }`;
        this.logger.warn(error);
        return { success: false, error };
      }

      // Provisional: confirmation id field name finalized in Phase 0.
      const externalId =
        body?.id || body?.recordId || body?.confirmationId || undefined;

      return { success: true, externalId };
    } catch (error: any) {
      const message =
        error?.name === 'AbortError'
          ? 'CARFAX request timed out'
          : error?.message || 'Unknown CARFAX transport error';
      this.logger.error(`CARFAX send failed: ${message}`);
      return { success: false, error: message };
    } finally {
      clearTimeout(timeout);
    }
  }
}
