// FY 2025-26 tax calculation utilities

export function fmt(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function fmtN(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));
}

function applySlabs(income, slabs) {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of slabs) {
    if (income <= prev) break;
    const taxable = Math.min(income, limit) - prev;
    tax += taxable * rate;
    prev = limit;
    if (limit === Infinity) break;
  }
  return tax;
}

// New regime FY25-26
export function calcTaxNew(income) {
  if (income <= 0) return 0;
  const slabs = [
    [400000,  0.00],
    [800000,  0.05],
    [1200000, 0.10],
    [1600000, 0.15],
    [2000000, 0.20],
    [Infinity, 0.30],
  ];
  let tax = applySlabs(income, slabs);
  // Rebate u/s 87A: income ≤ 12L → no tax
  if (income <= 1200000) tax = 0;
  // 4% cess
  return tax * 1.04;
}

// Old regime FY25-26
export function calcTaxOld(income) {
  if (income <= 0) return 0;
  const slabs = [
    [250000,  0.00],
    [500000,  0.05],
    [1000000, 0.20],
    [Infinity, 0.30],
  ];
  let tax = applySlabs(income, slabs);
  // Rebate u/s 87A: income ≤ 5L → no tax
  if (income <= 500000) tax = 0;
  return tax * 1.04;
}

export function calcTax(income, regime) {
  return regime === 'new' ? calcTaxNew(income) : calcTaxOld(income);
}

export function getMarginalRate(income, regime = 'new') {
  if (income <= 0) return 0;
  if (regime === 'new') {
    if (income <= 400000)  return 0;
    if (income <= 800000)  return 0.05 * 1.04;
    if (income <= 1200000) return 0.10 * 1.04;
    if (income <= 1600000) return 0.15 * 1.04;
    if (income <= 2000000) return 0.20 * 1.04;
    return 0.30 * 1.04;
  } else {
    if (income <= 250000)  return 0;
    if (income <= 500000)  return 0.05 * 1.04;
    if (income <= 1000000) return 0.20 * 1.04;
    return 0.30 * 1.04;
  }
}
