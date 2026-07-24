/**
 * Shared VIN (Vehicle Identification Number) helpers.
 *
 * Previously the VIN regex and normalize helper were copy-pasted across
 * AddVehicleDialog, VehicleForm and CreateRepairOrderDialog. This module is the
 * single source of truth, and adds ISO 3779 check-digit validation used to
 * verify camera scans before we trust them.
 */

/** A VIN is exactly 17 chars; the letters I, O and Q are never used. */
export const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

/**
 * Normalize free-text/typed input into VIN shape: uppercase, drop any character
 * that can't appear in a VIN, and cap at 17 characters. Safe to call on every
 * keystroke.
 */
export const normalizeVin = (value: string): string =>
  value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, '')
    .slice(0, 17);

/** True when the value is a structurally valid 17-character VIN. */
export const isValidVin = (value: string): boolean => VIN_PATTERN.test(value);

// --- ISO 3779 check-digit (position 9) -------------------------------------
// Transliteration table: letters map to numeric values, digits map to
// themselves. I, O, Q are excluded (never valid in a VIN).
const TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
};

// Positional weights (position 9 — the check digit itself — has weight 0).
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * Validate the ISO 3779 check digit (9th character).
 *
 * NOTE: The check digit is mandatory for North American vehicles but not for
 * every market, so a `false` result means "could not verify", NOT necessarily
 * "invalid VIN". Use it as a confidence signal, not a hard gate.
 */
export const isValidVinCheckDigit = (vin: string): boolean => {
  if (!VIN_PATTERN.test(vin)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const value = TRANSLITERATION[vin[i]];
    if (value === undefined) return false;
    sum += value * WEIGHTS[i];
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? 'X' : String(remainder);
  return vin[8] === expected;
};

export interface VinScanCandidate {
  /** The 17-character VIN extracted from the scanned barcode payload. */
  vin: string;
  /** Whether the ISO 3779 check digit validated (confidence signal). */
  checkDigitValid: boolean;
}

/**
 * Extract a VIN from a raw barcode payload.
 *
 * Door-jamb / windshield Code 39 barcodes sometimes wrap the VIN with delimiter
 * characters (e.g. a leading "I" or a trailing "*"), so the payload can be
 * longer than 17 chars. We scan every 17-character window and prefer the one
 * whose check digit validates; otherwise we fall back to the first structurally
 * valid window. Returns null when no 17-character VIN can be found.
 */
export const extractVinFromScan = (raw: string): VinScanCandidate | null => {
  const cleaned = raw.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  if (cleaned.length < 17) return null;

  let firstValid: VinScanCandidate | null = null;
  for (let start = 0; start + 17 <= cleaned.length; start++) {
    const candidate = cleaned.slice(start, start + 17);
    if (!VIN_PATTERN.test(candidate)) continue;
    if (isValidVinCheckDigit(candidate)) {
      return { vin: candidate, checkDigitValid: true };
    }
    if (!firstValid) {
      firstValid = { vin: candidate, checkDigitValid: false };
    }
  }
  return firstValid;
};
