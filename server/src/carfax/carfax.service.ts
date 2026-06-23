import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { CarfaxSyncStatus, InvoiceItemType } from '@prisma/client';
import { CarfaxRecord, CarfaxTransport } from './carfax-transport';

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

// Invoice item types that represent reportable work performed on the vehicle.
const REPORTABLE_ITEM_TYPES: InvoiceItemType[] = [
  InvoiceItemType.SERVICE,
  InvoiceItemType.PART,
  InvoiceItemType.TIRE,
];

@Injectable()
export class CarfaxService {
  private readonly logger = new Logger(CarfaxService.name);
  private readonly enabled: boolean;
  private readonly locationId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly transport: CarfaxTransport
  ) {
    this.enabled = process.env.CARFAX_ENABLED === 'true';
    this.locationId = process.env.CARFAX_LOCATION_ID || '';

    if (!this.enabled) {
      this.logger.warn(
        'CARFAX Service is disabled (CARFAX_ENABLED is not true)'
      );
    } else if (!this.locationId || !this.transport.isConfigured()) {
      this.logger.error(
        'CARFAX_ENABLED is true but credentials are incomplete (CARFAX_LOCATION_ID / CARFAX_API_URL / CARFAX_API_KEY) - reports will be skipped'
      );
    } else {
      this.logger.log('CARFAX Service initialized');
    }
  }

  /**
   * Report a paid invoice to CARFAX. Safe to call fire-and-forget: it never
   * throws, so a CARFAX failure can never block invoicing.
   *
   * @param force resend even if a SENT record already exists (manual resync)
   */
  async reportInvoice(invoiceId: string, force = false): Promise<void> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          vehicle: true,
          company: true,
          repairOrder: true,
          items: true,
          carfaxSync: true,
        },
      });

      if (!invoice) {
        this.logger.warn(`CARFAX: invoice ${invoiceId} not found`);
        return;
      }

      // Idempotency: don't re-send an already-accepted record unless forced.
      if (!force && invoice.carfaxSync?.status === CarfaxSyncStatus.SENT) {
        return;
      }

      const record = this.buildRecord(invoice);

      // Not reportable -> record a SKIPPED row so it's visible/auditable.
      if (!record) {
        await this.upsertSync(invoiceId, {
          status: CarfaxSyncStatus.SKIPPED,
          vin: invoice.vehicle?.vin ?? null,
        });
        return;
      }

      if (!this.enabled || !this.locationId || !this.transport.isConfigured()) {
        await this.upsertSync(invoiceId, {
          status: CarfaxSyncStatus.SKIPPED,
          vin: record.vin,
          serviceDate: new Date(record.serviceDate),
          odometer: record.odometer ?? null,
          payload: record as any,
          lastError: 'CARFAX disabled or not configured',
        });
        return;
      }

      const result = await this.transport.send(record);

      await this.upsertSync(invoiceId, {
        status: result.success
          ? CarfaxSyncStatus.SENT
          : CarfaxSyncStatus.FAILED,
        vin: record.vin,
        serviceDate: new Date(record.serviceDate),
        odometer: record.odometer ?? null,
        payload: record as any,
        externalId: result.externalId ?? null,
        lastError: result.error ?? null,
        sentAt: result.success ? new Date() : null,
        incrementAttempts: true,
      });

      if (result.success) {
        this.logger.log(`CARFAX: reported invoice ${invoice.invoiceNumber}`);
      } else {
        this.logger.warn(
          `CARFAX: failed to report invoice ${invoice.invoiceNumber}: ${result.error}`
        );
      }
    } catch (error: any) {
      // Never propagate - this runs off the invoice critical path.
      this.logger.error(
        `CARFAX: unexpected error reporting invoice ${invoiceId}: ${
          error?.message || error
        }`
      );
    }
  }

  /**
   * Re-send all FAILED records (transient error recovery). Returns count attempted.
   */
  async retryFailed(limit = 50): Promise<number> {
    const failed = await this.prisma.carfaxSync.findMany({
      where: { status: CarfaxSyncStatus.FAILED },
      orderBy: { updatedAt: 'asc' },
      take: limit,
      select: { invoiceId: true },
    });

    for (const row of failed) {
      await this.reportInvoice(row.invoiceId, true);
    }

    return failed.length;
  }

  /**
   * Build the (provisional) CARFAX record from an invoice, or null if the
   * invoice isn't reportable (no valid VIN, or no reportable services).
   */
  private buildRecord(invoice: any): CarfaxRecord | null {
    const vin = (invoice.vehicle?.vin || '').trim().toUpperCase();
    if (!VIN_PATTERN.test(vin)) {
      return null;
    }

    const services = (invoice.items || [])
      .filter((item: any) => REPORTABLE_ITEM_TYPES.includes(item.itemType))
      .map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
      }));

    if (services.length === 0) {
      return null;
    }

    // Prefer odometer captured at the repair order; fall back to the vehicle's
    // last-known mileage.
    const odometer =
      invoice.repairOrder?.mileageIn ?? invoice.vehicle?.mileage ?? undefined;

    const serviceDate = (invoice.invoiceDate ?? invoice.createdAt) as Date;

    return {
      locationId: this.locationId,
      vin,
      serviceDate: serviceDate.toISOString().split('T')[0],
      odometer: typeof odometer === 'number' ? odometer : undefined,
      odometerUnit: 'km',
      referenceNumber: invoice.invoiceNumber,
      vehicle: {
        make: invoice.vehicle?.make,
        model: invoice.vehicle?.model,
        year: invoice.vehicle?.year,
      },
      services,
    };
  }

  private async upsertSync(
    invoiceId: string,
    data: {
      status: CarfaxSyncStatus;
      vin?: string | null;
      serviceDate?: Date | null;
      odometer?: number | null;
      payload?: any;
      externalId?: string | null;
      lastError?: string | null;
      sentAt?: Date | null;
      incrementAttempts?: boolean;
    }
  ): Promise<void> {
    const { incrementAttempts, ...fields } = data;

    await this.prisma.carfaxSync.upsert({
      where: { invoiceId },
      create: {
        invoiceId,
        ...fields,
        attempts: incrementAttempts ? 1 : 0,
      },
      update: {
        ...fields,
        ...(incrementAttempts ? { attempts: { increment: 1 } } : {}),
      },
    });
  }
}
