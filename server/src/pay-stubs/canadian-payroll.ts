/**
 * Statutory payroll deductions for a pay period — CPP, EI and income tax.
 *
 * This implements the CRA's own withholding formulas (T4127 Payroll Deductions
 * Formulas, 122nd edition, effective January 1 2026), not an approximation of
 * them. The published tables (T4032) are generated from these same formulas, so
 * the figures here should agree with them to the cent.
 *
 * Two deliberate limits, both surfaced to the accountant rather than hidden:
 *
 *  - Rates are stored per tax year and nothing is extrapolated. Payroll rates
 *    change every January, and a plausible-looking figure computed from last
 *    year's numbers is worse than a blank box, because nobody checks a filled
 *    field. A year with no table returns `supported: false`.
 *  - The employee's TD1 claim amounts are not on file, so the basic personal
 *    amounts are assumed (claim code 1). An employee claiming dependants or
 *    tuition is over-deducted, which the accountant fixes by typing over the
 *    suggested tax.
 *
 * Everything here is pure arithmetic: no dates, no I/O, no database.
 */

/** Provinces this calculator has rate tables for. The shop operates in BC. */
export type SupportedProvince = 'BC';

export interface PayrollRates {
  year: number;
  cpp: {
    /** Year's Maximum Pensionable Earnings. */
    ympe: number;
    /** Year's Additional Maximum Pensionable Earnings (the CPP2 ceiling). */
    yampe: number;
    basicExemption: number;
    /** Employee rate on earnings up to the YMPE (base + first additional). */
    employeeRate: number;
    /** The base portion of the employee rate — the only part that is a tax credit. */
    baseRate: number;
    maxEmployeeContribution: number;
    maxBaseContribution: number;
    cpp2Rate: number;
    maxCpp2Contribution: number;
  };
  ei: {
    maxInsurableEarnings: number;
    employeeRate: number;
    maxAnnualPremium: number;
  };
  federal: {
    /** Ascending bracket floors with their rate (R) and constant (K). */
    brackets: { floor: number; rate: number; constant: number }[];
    lowestRate: number;
    canadaEmploymentAmount: number;
    /** The income-tested federal basic personal amount (BPAF). */
    basicPersonalAmount: {
      max: number;
      min: number;
      phaseOutStart: number;
      phaseOutEnd: number;
    };
  };
  provincial: {
    /** Ascending bracket floors with their rate (V) and constant (KP). */
    brackets: { floor: number; rate: number; constant: number }[];
    lowestRate: number;
    basicPersonalAmount: number;
    /** BC tax reduction (factor S). */
    taxReduction: {
      max: number;
      phaseOutStart: number;
      phaseOutEnd: number;
      rate: number;
    };
  };
}

/**
 * 2026 rates — CRA T4127 (122nd edition, January 1 2026), Chapter 8.
 *
 * To add a year: copy this block, replace every figure from the new edition of
 * T4127 (Tables 8.1-8.7 plus the BPAF and provincial factor-S formulas) and
 * register it below. Do not index or extrapolate the old numbers.
 */
const RATES_BC_2026: PayrollRates = {
  year: 2026,
  cpp: {
    ympe: 74600,
    yampe: 85000,
    basicExemption: 3500,
    employeeRate: 0.0595,
    baseRate: 0.0495,
    maxEmployeeContribution: 4230.45,
    maxBaseContribution: 3519.45,
    cpp2Rate: 0.04,
    maxCpp2Contribution: 416,
  },
  ei: {
    maxInsurableEarnings: 68900,
    employeeRate: 0.0163,
    maxAnnualPremium: 1123.07,
  },
  federal: {
    brackets: [
      { floor: 0, rate: 0.14, constant: 0 },
      { floor: 58523, rate: 0.205, constant: 3804 },
      { floor: 117045, rate: 0.26, constant: 10241 },
      { floor: 181440, rate: 0.29, constant: 15685 },
      { floor: 258482, rate: 0.33, constant: 26024 },
    ],
    lowestRate: 0.14,
    canadaEmploymentAmount: 1501,
    basicPersonalAmount: {
      max: 16452,
      min: 14829,
      phaseOutStart: 181440,
      phaseOutEnd: 258482,
    },
  },
  provincial: {
    brackets: [
      { floor: 0, rate: 0.0506, constant: 0 },
      { floor: 50363, rate: 0.077, constant: 1330 },
      { floor: 100728, rate: 0.105, constant: 4150 },
      { floor: 115648, rate: 0.1229, constant: 6220 },
      { floor: 140430, rate: 0.147, constant: 9604 },
      { floor: 190405, rate: 0.168, constant: 13603 },
      { floor: 265545, rate: 0.205, constant: 23428 },
    ],
    lowestRate: 0.0506,
    basicPersonalAmount: 13216,
    taxReduction: {
      max: 575,
      phaseOutStart: 25570,
      phaseOutEnd: 41722,
      rate: 0.0356,
    },
  },
};

const RATE_TABLES: Record<string, PayrollRates> = {
  'BC:2026': RATES_BC_2026,
};

export const getPayrollRates = (
  province: SupportedProvince,
  year: number
): PayrollRates | undefined => RATE_TABLES[`${province}:${year}`];

/** The tax years that have a rate table, oldest first. */
export const supportedTaxYears = (province: SupportedProvince): number[] =>
  Object.values(RATE_TABLES)
    .filter((rates) => RATE_TABLES[`${province}:${rates.year}`] === rates)
    .map((rates) => rates.year)
    .sort((a, b) => a - b);

export interface DeductionInput {
  /** Gross pay for this period (factor I). */
  grossPay: number;
  /** Pay periods in the year (factor P) — 52, 26, 24 or 12. */
  payPeriodsPerYear: number;
  /** CPP already withheld this year, base + first + second additional. */
  ytdCpp: number;
  /** EI already withheld this year (factor D1). */
  ytdEi: number;
  /** Gross pay already paid this year, used for the CPP2 ceiling. */
  ytdGrossPay: number;
  province: SupportedProvince;
  taxYear: number;
}

export interface DeductionEstimate {
  ei: number;
  /** Total CPP for the period: base + first additional + CPP2. */
  cpp: number;
  /** The CPP2 slice of `cpp`, non-zero only above the YMPE. */
  cpp2: number;
  incomeTax: number;
  federalTax: number;
  provincialTax: number;
  /** Annualized taxable income (factor A) the tax was derived from. */
  annualTaxableIncome: number;
  /** True once this period's CPP or EI hits the annual maximum. */
  cppMaxedOut: boolean;
  eiMaxedOut: boolean;
}

/** CRA rounding: half up to the cent. */
const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** CRA truncation, used for the per-period CPP basic exemption. */
const truncate2 = (value: number) => Math.floor(value * 100) / 100;

const atLeastZero = (value: number) => (value > 0 ? value : 0);

const bracketFor = (
  brackets: { floor: number; rate: number; constant: number }[],
  income: number
) => {
  let match = brackets[0];
  for (const bracket of brackets) {
    if (income >= bracket.floor) match = bracket;
  }
  return match;
};

/**
 * The pay periods per year implied by a period's length.
 *
 * The CRA formulas need the employer's actual pay frequency, which the system
 * does not record, so it is inferred from the period the accountant selected by
 * picking the frequency whose nominal length is closest. Weekly, biweekly,
 * semi-monthly and monthly are the only ones offered; anything unusual lands on
 * the nearest of those and is shown to the accountant so a wrong guess is
 * visible rather than silent.
 */
export const inferPayPeriodsPerYear = (
  periodStart: Date,
  periodEnd: Date
): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days =
    Math.round((periodEnd.getTime() - periodStart.getTime()) / msPerDay) + 1;
  if (!Number.isFinite(days) || days <= 0) return 26;

  const candidates = [52, 26, 24, 12];
  return candidates.reduce((best, candidate) =>
    Math.abs(365 / candidate - days) < Math.abs(365 / best - days)
      ? candidate
      : best
  );
};

/** Human label for a pay frequency, for the accountant to sanity check. */
export const payPeriodLabel = (payPeriodsPerYear: number): string =>
  ({
    52: 'Weekly',
    26: 'Biweekly',
    24: 'Semi-monthly',
    12: 'Monthly',
  }[payPeriodsPerYear] ?? `${payPeriodsPerYear} pay periods per year`);

/**
 * EI premium for the period (T4127 Chapter 7).
 *
 * EI = lesser of (annual maximum − withheld so far) and (rate × insurable
 * earnings), so the last premium of the year is the exact remainder.
 */
const calculateEi = (input: DeductionInput, rates: PayrollRates) => {
  const remaining = atLeastZero(rates.ei.maxAnnualPremium - input.ytdEi);
  const premium = round2(rates.ei.employeeRate * input.grossPay);
  const ei = round2(Math.min(remaining, premium));
  return { ei, maxedOut: ei < premium };
};

/**
 * CPP contributions for the period (T4127 Chapter 6, factors C and C2).
 *
 * The stored YTD figure is a single combined number, so the CPP2 already
 * withheld is reconstructed from year-to-date earnings — CPP2 only applies
 * above the YMPE, so for anyone under that ceiling this is exactly zero and the
 * whole YTD amount is base + first additional, as it should be.
 */
const calculateCpp = (input: DeductionInput, rates: PayrollRates) => {
  const { cpp } = rates;
  const periodExemption = truncate2(
    cpp.basicExemption / input.payPeriodsPerYear
  );

  const ytdCpp2 = round2(
    cpp.cpp2Rate *
      atLeastZero(Math.min(input.ytdGrossPay, cpp.yampe) - cpp.ympe)
  );
  const ytdBaseCpp = atLeastZero(input.ytdCpp - ytdCpp2);

  // C — base + first additional, on earnings up to the YMPE.
  const contributory = atLeastZero(input.grossPay - periodExemption);
  const uncapped = round2(cpp.employeeRate * contributory);
  const roomLeft = atLeastZero(cpp.maxEmployeeContribution - ytdBaseCpp);
  const c = round2(Math.min(roomLeft, uncapped));

  // C2 — 4% of the slice of earnings between the YMPE and the YAMPE.
  const ceiling = Math.max(input.ytdGrossPay, cpp.ympe);
  const cpp2Earnings = atLeastZero(
    Math.min(input.ytdGrossPay + input.grossPay, cpp.yampe) - ceiling
  );
  const cpp2Room = atLeastZero(cpp.maxCpp2Contribution - ytdCpp2);
  const c2 = round2(Math.min(cpp2Room, round2(cpp.cpp2Rate * cpp2Earnings)));

  return {
    c,
    c2,
    total: round2(c + c2),
    maxedOut: c < uncapped,
  };
};

/**
 * The federal basic personal amount (BPAF), which tapers away over the top two
 * brackets.
 */
const basicPersonalAmount = (annualIncome: number, rates: PayrollRates) => {
  const bpa = rates.federal.basicPersonalAmount;
  if (annualIncome <= bpa.phaseOutStart) return bpa.max;
  if (annualIncome >= bpa.phaseOutEnd) return bpa.min;
  const taper =
    ((annualIncome - bpa.phaseOutStart) * (bpa.max - bpa.min)) /
    (bpa.phaseOutEnd - bpa.phaseOutStart);
  return round2(bpa.max - taper);
};

/**
 * The BC tax reduction (factor S) — a credit for low incomes that tapers to
 * nothing, and can never exceed the provincial tax itself.
 */
const bcTaxReduction = (
  annualIncome: number,
  provincialTaxBeforeReduction: number,
  rates: PayrollRates
) => {
  const reduction = rates.provincial.taxReduction;
  if (annualIncome > reduction.phaseOutEnd) return 0;
  const available =
    annualIncome <= reduction.phaseOutStart
      ? reduction.max
      : reduction.max -
        (annualIncome - reduction.phaseOutStart) * reduction.rate;
  return atLeastZero(Math.min(provincialTaxBeforeReduction, available));
};

/**
 * Income tax for the period (T4127 Chapter 5).
 *
 * The method is: annualize this period's pay, work out a whole year's federal
 * and provincial tax on it, then divide back down by the number of pay periods.
 * That is why a raise mid-year changes the tax on every later stub — each
 * period is taxed as though the employee earned at that rate all year.
 */
const calculateIncomeTax = (
  input: DeductionInput,
  rates: PayrollRates,
  cpp: { c: number; c2: number },
  ei: number
) => {
  const p = input.payPeriodsPerYear;

  // F5 — the enhanced portion of CPP (first additional + CPP2) is deducted
  // from income, unlike the base portion which is a credit further down.
  const f5 = round2(
    cpp.c *
      ((rates.cpp.employeeRate - rates.cpp.baseRate) / rates.cpp.employeeRate) +
      cpp.c2
  );

  // A — annual taxable income.
  const a = atLeastZero(round2(p * (input.grossPay - f5)));

  // K2 — the CPP (base portion only) and EI credits, each capped at the
  // year's maximum so a part-year employee is not over-credited.
  const annualBaseCpp = Math.min(
    p * cpp.c * (rates.cpp.baseRate / rates.cpp.employeeRate),
    rates.cpp.maxBaseContribution
  );
  const annualEi = Math.min(p * ei, rates.ei.maxAnnualPremium);

  // Federal.
  const federalBracket = bracketFor(rates.federal.brackets, a);
  const k1 = rates.federal.lowestRate * basicPersonalAmount(a, rates);
  const k2 =
    rates.federal.lowestRate * annualBaseCpp +
    rates.federal.lowestRate * annualEi;
  const k4 =
    rates.federal.lowestRate *
    Math.min(a, rates.federal.canadaEmploymentAmount);
  const federalTax = atLeastZero(
    federalBracket.rate * a - federalBracket.constant - k1 - k2 - k4
  );

  // Provincial.
  const provincialBracket = bracketFor(rates.provincial.brackets, a);
  const k1p =
    rates.provincial.lowestRate * rates.provincial.basicPersonalAmount;
  const k2p =
    rates.provincial.lowestRate * annualBaseCpp +
    rates.provincial.lowestRate * annualEi;
  const provincialBeforeReduction = atLeastZero(
    provincialBracket.rate * a - provincialBracket.constant - k1p - k2p
  );
  const provincialTax = atLeastZero(
    provincialBeforeReduction -
      bcTaxReduction(a, provincialBeforeReduction, rates)
  );

  // The CRA rounds the combined deduction, not each half, so that is the
  // authoritative figure. The breakdown is then made to add up to it exactly —
  // an accountant checking the split should not find it a cent out.
  const periodTax = round2((federalTax + provincialTax) / p);
  const periodFederal = round2(federalTax / p);

  return {
    annualTaxableIncome: a,
    federalTax: periodFederal,
    provincialTax: round2(periodTax - periodFederal),
    incomeTax: periodTax,
  };
};

/**
 * Suggested statutory deductions for one pay period.
 *
 * Returns undefined when there is no rate table for the tax year — the caller
 * must then leave the fields blank rather than fall back to another year.
 */
export const calculateDeductions = (
  input: DeductionInput
): DeductionEstimate | undefined => {
  const rates = getPayrollRates(input.province, input.taxYear);
  if (!rates) return undefined;
  if (!(input.grossPay > 0)) {
    return {
      ei: 0,
      cpp: 0,
      cpp2: 0,
      incomeTax: 0,
      federalTax: 0,
      provincialTax: 0,
      annualTaxableIncome: 0,
      cppMaxedOut: false,
      eiMaxedOut: false,
    };
  }

  const ei = calculateEi(input, rates);
  const cpp = calculateCpp(input, rates);
  const tax = calculateIncomeTax(input, rates, cpp, ei.ei);

  return {
    ei: ei.ei,
    cpp: cpp.total,
    cpp2: cpp.c2,
    incomeTax: tax.incomeTax,
    federalTax: tax.federalTax,
    provincialTax: tax.provincialTax,
    annualTaxableIncome: tax.annualTaxableIncome,
    cppMaxedOut: cpp.maxedOut,
    eiMaxedOut: ei.maxedOut,
  };
};
