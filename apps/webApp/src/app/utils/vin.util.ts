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
  /** The 17-character VIN extracted from the scanned barcode/QR payload. */
  vin: string;
  /** Whether the ISO 3779 check digit validated (confidence signal). */
  checkDigitValid: boolean;
}

// Confidence tiers for an extracted candidate, best first.
//
// A field that is *exactly* a VIN outranks one carved out of a longer run of
// characters: the check digit validates by chance for roughly 1 in 11 random
// 17-character windows, so a long descriptor field (common in QR payloads)
// offers enough windows that a bogus one will regularly pass.
const SCORE_FIELD_CHECK_DIGIT = 4;
const SCORE_FIELD = 3;
const SCORE_WINDOW_CHECK_DIGIT = 2;
const SCORE_WINDOW = 1;

/**
 * Extract a VIN from a raw barcode or QR payload.
 *
 * Door-jamb / windshield Code 39 barcodes sometimes wrap the VIN with delimiter
 * characters (e.g. a leading "I" or a trailing "*"). QR labels go further and
 * carry several fields — "VIN:xxx;MODEL:yyy", or a URL with the VIN in the path
 * — so the VIN is one field among many.
 *
 * We split the payload on every character that can never appear in a VIN, which
 * both trims those delimiters and keeps fields apart, then look for a VIN inside
 * each field. Splitting matters: concatenating the whole payload first lets a
 * 17-character "VIN" be fabricated from the tail of one field and the head of
 * the next. Candidates are ranked by `SCORE_*` above. Returns null when no
 * 17-character VIN can be found.
 */
export const extractVinFromScan = (raw: string): VinScanCandidate | null => {
  const fields = raw
    .toUpperCase()
    .split(/[^A-HJ-NPR-Z0-9]+/)
    .filter((field) => field.length >= 17);

  let best: VinScanCandidate | null = null;
  let bestScore = 0;

  for (const field of fields) {
    const isWholeField = field.length === 17;
    for (let start = 0; start + 17 <= field.length; start++) {
      const candidate = field.slice(start, start + 17);
      if (!VIN_PATTERN.test(candidate)) continue;
      const checkDigitValid = isValidVinCheckDigit(candidate);
      const score = isWholeField
        ? checkDigitValid
          ? SCORE_FIELD_CHECK_DIGIT
          : SCORE_FIELD
        : checkDigitValid
        ? SCORE_WINDOW_CHECK_DIGIT
        : SCORE_WINDOW;

      if (score > bestScore) {
        best = { vin: candidate, checkDigitValid };
        bestScore = score;
        // Nothing can beat a standalone field with a valid check digit.
        if (score === SCORE_FIELD_CHECK_DIGIT) return best;
      }
    }
  }

  return best;
};
