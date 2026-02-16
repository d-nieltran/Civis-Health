"use client";

import { useState } from "react";
import { Calculator, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import hospitals from "@/data/hospitals.json";

// 2024 Federal Poverty Level guidelines (48 contiguous states)
const FPL_BASE = 15060;
const FPL_PER_PERSON = 5380;

function getFederalPovertyLevel(householdSize: number): number {
  return FPL_BASE + FPL_PER_PERSON * (householdSize - 1);
}

interface EligibilityResult {
  hospitalName: string;
  programName: string;
  fplLimitPercent: number;
  eligible: boolean;
  userFplPercent: number;
}

export default function EligibilityCalculator() {
  const [income, setIncome] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");
  const [results, setResults] = useState<EligibilityResult[] | null>(null);

  function handleCheck() {
    const annualIncome = parseFloat(income);
    const size = parseInt(householdSize);
    if (isNaN(annualIncome) || annualIncome < 0 || isNaN(size) || size < 1) return;

    const fpl = getFederalPovertyLevel(size);
    const userFplPercent = Math.round((annualIncome / fpl) * 100);

    const eligibilityResults: EligibilityResult[] = hospitals.map((hospital) => ({
      hospitalName: hospital.name,
      programName: hospital.assistance_program,
      fplLimitPercent: hospital.fpl_limit_percent,
      eligible: userFplPercent <= hospital.fpl_limit_percent,
      userFplPercent,
    }));

    setResults(eligibilityResults);
  }

  return (
    <section id="calculator" className="py-20 bg-navy-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-100 rounded-xl mb-4">
            <Calculator className="w-7 h-7 text-gold-600" />
          </div>
          <h2 className="text-3xl font-bold text-navy-900">
            Check Your Eligibility
          </h2>
          <p className="mt-3 text-navy-500">
            Enter your household information to see which hospital financial
            assistance programs you may qualify for.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-navy-100 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="income"
                className="block text-sm font-semibold text-navy-700 mb-2"
              >
                Annual Household Income
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 font-medium">
                  $
                </span>
                <input
                  id="income"
                  type="number"
                  min="0"
                  placeholder="e.g. 35000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-navy-900 placeholder:text-navy-300"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="householdSize"
                className="block text-sm font-semibold text-navy-700 mb-2"
              >
                Household Size
              </label>
              <select
                id="householdSize"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-navy-900 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!income}
            className="w-full py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Check Eligibility
            <ChevronRight className="w-4 h-4" />
          </button>

          {results && (
            <div className="mt-8 space-y-4">
              <p className="text-sm text-navy-500">
                Your income is approximately{" "}
                <span className="font-bold text-navy-900">
                  {results[0].userFplPercent}%
                </span>{" "}
                of the Federal Poverty Level.
              </p>
              {results.map((result) => (
                <div
                  key={result.hospitalName}
                  className={`flex items-start gap-4 p-5 rounded-xl border ${
                    result.eligible
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  {result.eligible ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold text-navy-900">
                      {result.hospitalName}
                    </p>
                    <p className="text-sm text-navy-600">
                      {result.programName} — covers up to{" "}
                      <span className="font-medium">
                        {result.fplLimitPercent}% FPL
                      </span>
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        result.eligible ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {result.eligible
                        ? "You likely qualify for financial assistance."
                        : "You may not qualify based on income alone."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
