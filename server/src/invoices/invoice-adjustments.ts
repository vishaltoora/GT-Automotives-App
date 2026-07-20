/**
 * Auto-applied invoice line adjustments:
 *  - Shop supplies: a 4% charge on labor/services, added to RO-originated
 *    invoices (removable later by editing the invoice).
 *  - Fleet discount: a 10% discount on SERVICE items for fleet customers
 *    (removable later by editing the invoice).
 *
 * Both are computed off the same base — the SERVICE line items, excluding our
 * own marker lines — so the fleet discount never discounts the shop-supplies
 * fee and the two never compound on each other.
 */
export const SHOP_SUPPLIES_DESC = 'Shop Supplies (4%)';
export const FLEET_DISCOUNT_DESC = 'Fleet Discount (10% on services)';
export const SHOP_SUPPLIES_RATE = 0.04;
export const FLEET_DISCOUNT_RATE = 0.1;

interface AdjustableItem {
  itemType: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Sum of SERVICE line items, excluding the shop-supplies / fleet markers. */
export function serviceSubtotal(items: AdjustableItem[]): number {
  return items
    .filter(
      (i) =>
        i.itemType === 'SERVICE' &&
        i.description !== SHOP_SUPPLIES_DESC &&
        i.description !== FLEET_DISCOUNT_DESC
    )
    .reduce((sum, i) => sum + Number(i.quantity) * i.unitPrice, 0);
}

/**
 * Return the extra line items to append. Shop supplies is a taxable SERVICE
 * line; the fleet discount is a DISCOUNT line (callers that build totals
 * themselves must treat its total as negative). Both are idempotent — they are
 * skipped when a marker line is already present.
 */
export function buildAdjustmentItems(
  items: AdjustableItem[],
  opts: { addShopSupplies?: boolean; fleetDiscount?: boolean }
): Array<{
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
}> {
  const base = serviceSubtotal(items);
  const extras: Array<{
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }> = [];

  if (base <= 0) return extras;

  const hasShop = items.some((i) => i.description === SHOP_SUPPLIES_DESC);
  const hasFleet = items.some((i) => i.description === FLEET_DISCOUNT_DESC);

  if (opts.addShopSupplies && !hasShop) {
    extras.push({
      itemType: 'SERVICE',
      description: SHOP_SUPPLIES_DESC,
      quantity: 1,
      unitPrice: round2(base * SHOP_SUPPLIES_RATE),
    });
  }

  if (opts.fleetDiscount && !hasFleet) {
    // DISCOUNT lines carry a positive unitPrice; the total is negated downstream.
    extras.push({
      itemType: 'DISCOUNT',
      description: FLEET_DISCOUNT_DESC,
      quantity: 1,
      unitPrice: round2(base * FLEET_DISCOUNT_RATE),
    });
  }

  return extras;
}
