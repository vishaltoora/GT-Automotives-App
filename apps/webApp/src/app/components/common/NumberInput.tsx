import React, { useEffect, useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * Reusable numeric input.
 *
 * Unlike a raw `<TextField type="number" />`, this component:
 *  - Lets the field be **empty** (shows nothing, not `0`) when the user clears it
 *    with backspace/delete. The parent receives `undefined` while empty.
 *  - Only accepts numeric characters (optionally decimals / a negative sign).
 *  - Shows the correct numeric keyboard on mobile via `inputMode`.
 *  - Preserves in-progress typing such as `"12."` or `"-"` without snapping back.
 *
 * Value reported to the parent:
 *  - `undefined` when the field is empty (or only `"-"` / `"."`).
 *  - a `number` once a valid numeric value has been entered.
 */
export interface NumberInputProps
  extends Omit<TextFieldProps, 'onChange' | 'value' | 'type'> {
  /** Current value. Pass `''`/`null`/`undefined` for an empty field. */
  value: number | string | null | undefined;
  /** Called with the parsed number, or `undefined` when the field is empty. */
  onChange: (value: number | undefined) => void;
  /** Allow a decimal point (for amounts/prices). Defaults to false (integers only). */
  allowDecimals?: boolean;
  /** Allow a leading minus sign. Defaults to false. */
  allowNegative?: boolean;
  /** Maximum number of digits after the decimal point. */
  decimalPlaces?: number;
  /** Clamp the value to this minimum on blur. */
  min?: number;
  /** Clamp the value to this maximum on blur. */
  max?: number;
}

const toDisplay = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

/** Parse a sanitized display string into a number, or undefined if not yet valid. */
const parseValue = (raw: string): number | undefined => {
  if (raw === '' || raw === '-' || raw === '.' || raw === '-.')
    return undefined;
  const num = Number(raw);
  return Number.isNaN(num) ? undefined : num;
};

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  allowDecimals = false,
  allowNegative = false,
  decimalPlaces,
  min,
  max,
  inputProps,
  onBlur,
  onFocus,
  ...textFieldProps
}) => {
  const [inputValue, setInputValue] = useState<string>(toDisplay(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sanitize raw keystrokes into an allowed numeric string.
  const sanitize = (raw: string): string => {
    let result = raw;

    // Keep only digits, decimal points and (optionally) a leading minus.
    result = result.replace(allowDecimals ? /[^0-9.-]/g : /[^0-9-]/g, '');

    // Handle the negative sign: only one, only at the start.
    if (allowNegative) {
      const negative = result.startsWith('-');
      result = result.replace(/-/g, '');
      if (negative) result = `-${result}`;
    } else {
      result = result.replace(/-/g, '');
    }

    if (allowDecimals) {
      // Collapse to a single decimal point.
      const firstDot = result.indexOf('.');
      if (firstDot !== -1) {
        result =
          result.slice(0, firstDot + 1) +
          result.slice(firstDot + 1).replace(/\./g, '');
      }
      // Enforce decimal places limit.
      if (decimalPlaces !== undefined && firstDot !== -1) {
        const [intPart, decPart] = result.split('.');
        result = `${intPart}.${decPart.slice(0, decimalPlaces)}`;
      }
    }

    return result;
  };

  // Sync external value changes (form reset, programmatic set) without
  // clobbering in-progress typing like "12." or "-". While the field is
  // focused we never overwrite what the user is typing — this is what keeps a
  // cleared field empty instead of snapping back to the parent's value.
  useEffect(() => {
    if (isFocused) return;
    const propNum =
      value === '' || value === null || value === undefined
        ? undefined
        : Number(value);
    const localNum = parseValue(inputValue);
    const sameNumber = propNum === localNum;
    const bothEmpty =
      propNum === undefined && localNum === undefined && inputValue === '';
    if (!sameNumber && !bothEmpty) {
      setInputValue(toDisplay(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitize(e.target.value);
    setInputValue(sanitized);
    onChange(parseValue(sanitized));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const parsed = parseValue(inputValue);
    if (parsed !== undefined) {
      let clamped = parsed;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      if (clamped !== parsed) {
        setInputValue(String(clamped));
        onChange(clamped);
      } else {
        // Normalize the display (e.g. "12." -> "12", "01" -> "1").
        const normalized = String(parsed);
        if (normalized !== inputValue) setInputValue(normalized);
      }
    } else if (inputValue !== '') {
      // Lingering "-" or "." with no number — clear it.
      setInputValue('');
      onChange(undefined);
    }
    onBlur?.(e);
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputProps={{
        inputMode: allowDecimals ? 'decimal' : 'numeric',
        ...inputProps,
      }}
    />
  );
};

export default NumberInput;
