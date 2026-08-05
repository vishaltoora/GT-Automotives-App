import {
  VIN_PATTERN,
  normalizeVin,
  isValidVin,
  isValidVinCheckDigit,
  extractVinFromScan,
} from './vin.util';

describe('vin.util', () => {
  describe('normalizeVin', () => {
    it('uppercases, strips invalid chars, and caps at 17', () => {
      expect(normalizeVin('1hgcm82633a004352')).toBe('1HGCM82633A004352');
      expect(normalizeVin('1HG-CM8 2633A00435 2')).toBe('1HGCM82633A004352');
    });

    it('drops the disallowed letters I, O, Q', () => {
      expect(normalizeVin('IOQ1HGCM82633A0043')).toBe('1HGCM82633A0043');
    });

    it('never returns more than 17 characters', () => {
      expect(normalizeVin('1HGCM82633A004352EXTRA').length).toBe(17);
    });
  });

  describe('VIN_PATTERN / isValidVin', () => {
    it('accepts a well-formed 17-character VIN', () => {
      expect(VIN_PATTERN.test('1HGCM82633A004352')).toBe(true);
      expect(isValidVin('1HGCM82633A004352')).toBe(true);
    });

    it('rejects wrong length or forbidden letters', () => {
      expect(isValidVin('1HGCM82633A00435')).toBe(false); // 16 chars
      expect(isValidVin('1HGCM82633A0043I2')).toBe(false); // contains I
    });
  });

  describe('isValidVinCheckDigit', () => {
    it('accepts VINs with a correct ISO 3779 check digit', () => {
      // Well-known valid sample VINs.
      expect(isValidVinCheckDigit('1HGCM82633A004352')).toBe(true);
      expect(isValidVinCheckDigit('11111111111111111')).toBe(true);
    });

    it('accepts a VIN whose check digit is X', () => {
      expect(isValidVinCheckDigit('1M8GDM9AXKP042788')).toBe(true);
    });

    it('rejects a VIN with an incorrect check digit', () => {
      // Same as the valid sample but with the check digit (pos 9) altered.
      expect(isValidVinCheckDigit('1HGCM82653A004352')).toBe(false);
    });

    it('rejects structurally invalid input', () => {
      expect(isValidVinCheckDigit('NOTAVIN')).toBe(false);
    });
  });

  describe('extractVinFromScan', () => {
    it('extracts a clean 17-character VIN', () => {
      const result = extractVinFromScan('1HGCM82633A004352');
      expect(result).toEqual({
        vin: '1HGCM82633A004352',
        checkDigitValid: true,
      });
    });

    it('strips delimiter characters wrapping the VIN', () => {
      // Some Code 39 door-jamb barcodes wrap the VIN with delimiters.
      const result = extractVinFromScan('I1HGCM82633A004352*');
      expect(result?.vin).toBe('1HGCM82633A004352');
      expect(result?.checkDigitValid).toBe(true);
    });

    it('prefers the window whose check digit validates', () => {
      // Leading junk digit means two 17-char windows exist; the valid one wins.
      const result = extractVinFromScan('91HGCM82633A004352');
      expect(result?.vin).toBe('1HGCM82633A004352');
      expect(result?.checkDigitValid).toBe(true);
    });

    it('still returns a structurally valid VIN when no check digit matches', () => {
      const raw = '1HGCM82653A004352'; // valid shape, bad check digit
      const result = extractVinFromScan(raw);
      expect(result).toEqual({ vin: raw, checkDigitValid: false });
    });

    it('returns null when no 17-character VIN is present', () => {
      expect(extractVinFromScan('SHORT123')).toBeNull();
    });

    // QR labels on newer vehicles carry several fields rather than a bare VIN.
    describe('QR payloads', () => {
      it('extracts the VIN from a delimited key/value payload', () => {
        const result = extractVinFromScan(
          'VIN:1HGCM82633A004352;MODEL:ACCORD;YEAR:2003'
        );
        expect(result).toEqual({
          vin: '1HGCM82633A004352',
          checkDigitValid: true,
        });
      });

      it('extracts the VIN from a multi-line payload', () => {
        const result = extractVinFromScan(
          'MFR=HONDA\nVIN=1HGCM82633A004352\nPLANT=MARYSVILLE'
        );
        expect(result?.vin).toBe('1HGCM82633A004352');
      });

      it('extracts the VIN embedded in a URL', () => {
        const result = extractVinFromScan(
          'https://vehicle.example.com/lookup/1HGCM82633A004352?src=qr'
        );
        expect(result?.vin).toBe('1HGCM82633A004352');
      });

      it('never fabricates a VIN by joining two adjacent fields', () => {
        // Descriptive fields only. Concatenating the payload before scanning
        // would produce a >17-character run and yield a bogus "VIN".
        expect(
          extractVinFromScan('MODEL:F150XLT;COLOR:BLUE;TRIM:LARIAT4X4')
        ).toBeNull();
      });

      it('prefers a standalone VIN field over a lucky window in a longer field', () => {
        // A run of 1s is longer than a VIN and every window inside it happens
        // to satisfy the check digit — the real VIN field must still win, even
        // though its own check digit does not validate.
        const result = extractVinFromScan(
          '1111111111111111111;1HGCM82653A004352'
        );
        expect(result).toEqual({
          vin: '1HGCM82653A004352',
          checkDigitValid: false,
        });
      });
    });
  });
});
