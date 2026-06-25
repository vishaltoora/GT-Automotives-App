# CARFAX Integration

Push completed service records to **CARFAX (Canada) Service Network** so they
appear on the vehicle's CARFAX history, branded with GT Automotive. Free for the
shop, anonymous (no customer PII), HTTPS transport.

> Status: **Phase 1–2 built and feature-flagged OFF.** Waiting on the CARFAX
> Canada agreement + credentials (Phase 0) before it can send anything.

---

## How it works

1. When an invoice becomes **PAID** (`markAsPaid()` or paid-on-create), the
   invoice flow fires `CarfaxService.reportInvoice(invoiceId)` **non-blocking** —
   a CARFAX failure never blocks invoicing.
2. `CarfaxService` loads the invoice (+ vehicle, items, company, repairOrder),
   builds a record, and validates it.
3. The `CarfaxTransport` adapter POSTs the record to the CARFAX HTTPS endpoint.
4. The outcome is written to a `CarfaxSync` row (`SENT` / `FAILED` / `SKIPPED`).
5. Admins can view history and re-send via `/api/carfax/*` (and the future
   `/admin/carfax` page).

### What is sent (anonymous — NO customer PII)

| Field                     | Source                                                                     |
| ------------------------- | -------------------------------------------------------------------------- |
| `locationId`              | `CARFAX_LOCATION_ID` env                                                   |
| `vin`                     | `Vehicle.vin` (must be valid 17-char VIN)                                  |
| `serviceDate`             | `Invoice.invoiceDate` (YYYY-MM-DD)                                         |
| `odometer`                | `RepairOrder.mileageIn` → fallback `Vehicle.mileage` (km)                  |
| `referenceNumber`         | `Invoice.invoiceNumber` (non-PII reference)                                |
| `vehicle.make/model/year` | `Vehicle`                                                                  |
| `services[]`              | `InvoiceItem` where `itemType ∈ {SERVICE, PART, TIRE}` (description + qty) |

No names, phones, emails, or addresses are transmitted.

### When a record is SKIPPED

- CARFAX disabled / not configured
- Vehicle has no valid VIN
- Invoice has no reportable service items

---

## Configuration (env vars)

```bash
CARFAX_ENABLED=false              # master switch; keep false until credentialed
CARFAX_API_URL=                   # HTTPS endpoint (from CARFAX Phase 0)
CARFAX_API_KEY=                   # API key/token (from CARFAX Phase 0)
CARFAX_LOCATION_ID=               # shop/location id (from CARFAX Phase 0)
```

Set these in `.env.local` (dev) and Azure backend app settings (prod).

---

## Code map

| File                                      | Role                                                      |
| ----------------------------------------- | --------------------------------------------------------- |
| `server/src/carfax/carfax.service.ts`     | record builder, validation, queue/log, report entry point |
| `server/src/carfax/carfax-transport.ts`   | HTTPS adapter (`CarfaxRecord` wire shape lives here)      |
| `server/src/carfax/carfax.controller.ts`  | admin: history, statistics, resync, retry-failed          |
| `server/src/carfax/carfax.module.ts`      | module wiring                                             |
| `server/src/invoices/invoices.service.ts` | trigger on paid (`create()`, `markAsPaid()`)              |
| `libs/database/.../schema.prisma`         | `CarfaxSync` model + `CarfaxSyncStatus` enum              |

### API endpoints (ADMIN only)

- `GET  /api/carfax/history?status=&limit=`
- `GET  /api/carfax/statistics`
- `POST /api/carfax/resync/:invoiceId`
- `POST /api/carfax/retry-failed`

---

## ⚠️ Phase 0 — REQUIRED before go-live (blocking)

Nothing sends until CARFAX Canada approves the shop and provides credentials.

- [ ] Contact **CARFAX Canada – Service Shops / Business Development**, request a
      **Service Data Transfer Facilitation Agreement**.
- [ ] Confirm **HTTPS** transport is available (not SFTP-only). If SFTP-only, add
      an SFTP implementation of the `CarfaxTransport` contract.
- [ ] Obtain: **endpoint URL**, **API key**, **Location ID**, the **exact JSON
      field spec**, and CARFAX's **service category codes**.
- [ ] Reconcile `carfax-transport.ts` `CarfaxRecord` shape + auth header scheme
      with the real spec.
- [ ] Confirm Canadian privacy terms (anonymous push → minimal PIPEDA exposure).

### Then to go live

- [ ] Set `CARFAX_*` env vars in Azure backend; set `CARFAX_ENABLED=true`.
- [ ] Test one paid invoice end-to-end; verify a `SENT` `CarfaxSync` row.
- [ ] Decide on **backfill** of historical paid invoices vs go-forward only.
- [ ] (Optional) Build `/admin/carfax` UI page (mirror `SmsHistory.tsx`).
- [ ] (Optional) Phase 5: pull side — QuickVIN (plate→VIN) + service-history
      lookup at check-in.

---

## Notes / decisions

- **VIN coverage:** `Vehicle.vin` is optional. Records without a VIN are skipped.
  Consider nudging VIN capture in the vehicle form to improve coverage.
- **Trigger timing:** real-time per paid invoice (chosen). `retryFailed()` covers
  transient errors; can be promoted to a scheduled sweep later if needed.
- **Transport:** HTTPS chosen. The adapter isolates transport so SFTP can be
  added without touching the record builder or queue.
