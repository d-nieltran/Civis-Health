/**
 * Hospital data schema types
 */

export type FplPercentageLimit = {
  type: "fpl_percentage";
  fpl_percent: number;
};

export type FlatIncomeLimit = {
  type: "flat";
  by_household_size: Record<string, number>;
};

export type IncomeLimit = FplPercentageLimit | FlatIncomeLimit;

export interface Hospital {
  hospital_id: string;
  name: string;
  policy_name: string;
  income_limits: IncomeLimit;
  application_pdf_url: string;
  pdf_field_map: Record<string, string>;
}
