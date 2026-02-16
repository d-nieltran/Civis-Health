// 2024 Federal Poverty Level guidelines (48 contiguous states)
const FPL_BASE = 15060;
const FPL_PER_PERSON = 5380;

export function getFederalPovertyLevel(householdSize: number): number {
  return FPL_BASE + FPL_PER_PERSON * (householdSize - 1);
}

export function getFplPercent(annualIncome: number, householdSize: number): number {
  const fpl = getFederalPovertyLevel(householdSize);
  return Math.round((annualIncome / fpl) * 100);
}
