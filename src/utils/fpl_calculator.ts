// 2025 Federal Poverty Level guidelines (48 contiguous states)
const FPL_BASE = 15650;
const FPL_PER_PERSON = 5500;

export function getFederalPovertyLevel(householdSize: number): number {
  return FPL_BASE + FPL_PER_PERSON * (householdSize - 1);
}

export function getFplPercent(annualIncome: number, householdSize: number): number {
  const fpl = getFederalPovertyLevel(householdSize);
  return Math.round((annualIncome / fpl) * 100);
}

export function getMonthlyIncome(annualIncome: number): number {
  return Math.round((annualIncome / 12) * 100) / 100;
}

/**
 * Kaiser WA MFA award tiers based on 2025 FPL
 * Returns award percentage (100, 75, 50) or 0 if not eligible by income alone
 */
export function getKaiserWaAwardTier(annualIncome: number, householdSize: number): number {
  const pct = getFplPercent(annualIncome, householdSize);
  if (pct <= 200) return 100;
  if (pct <= 250) return 75;
  if (pct <= 300) return 50;
  return 0;
}
