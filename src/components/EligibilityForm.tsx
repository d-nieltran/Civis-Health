"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, ChevronRight } from "lucide-react";
import HospitalSearch from "@/components/HospitalSearch";

export default function EligibilityForm() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState("");
  const [income, setIncome] = useState("");
  const [householdSize, setHouseholdSize] = useState("1");

  function handleSubmit() {
    if (!hospitalId || !income) return;
    router.push(
      `/result?hospital_id=${encodeURIComponent(hospitalId)}&income=${encodeURIComponent(income)}&householdSize=${encodeURIComponent(householdSize)}`
    );
  }

  return (
    <section id="calculator" className="py-20 bg-navy-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-accent-100 rounded-xl mb-4">
            <Calculator className="w-7 h-7 text-accent-600" />
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
          <div className="mb-6">
            <HospitalSearch value={hospitalId} onChange={setHospitalId} />
          </div>

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
                  className="w-full pl-8 pr-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-navy-900 placeholder:text-navy-300"
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
                className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-navy-900 bg-white"
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
            onClick={handleSubmit}
            disabled={!hospitalId || !income}
            className="w-full py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Check Eligibility
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
