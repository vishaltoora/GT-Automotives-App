/**
 * Single source of truth for GT Automotives public shop details.
 * Used across the footer, Contact page, Products/Shop page, and video showcase CTAs.
 */

export const SHOP_NAME = 'GT Automotives';

// Physical storefront — full-service mechanical shop + tire sales
export const SHOP_ADDRESS_LINE1 = '473 3rd Ave';
export const SHOP_POSTAL_CODE = 'V2L 3C1';
export const SHOP_ADDRESS_LINE2 = `Prince George, BC ${SHOP_POSTAL_CODE}`;
export const SHOP_ADDRESS = `${SHOP_ADDRESS_LINE1}, ${SHOP_ADDRESS_LINE2}`;

// Google Maps helpers
const MAPS_QUERY = encodeURIComponent(`GT Automotives, ${SHOP_ADDRESS}`);
export const SHOP_MAP_EMBED_URL = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;
export const SHOP_MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`;

// Contact
export const SHOP_PHONE_PRIMARY = '250-570-2333';
export const SHOP_PHONE_SECONDARY = '250-986-9191';
export const SHOP_PHONE_PRIMARY_TEL = 'tel:2505702333';
export const SHOP_PHONE_SECONDARY_TEL = 'tel:2509869191';
export const SHOP_EMAIL = 'gt-automotives@outlook.com';

// Hours (walk-in / by appointment)
export const SHOP_HOURS = [
  { days: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
  { days: 'Saturday - Sunday', time: '9:00 AM - 5:00 PM' },
];
