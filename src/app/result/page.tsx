"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, XCircle, FileText, ArrowLeft, Shield } from "lucide-react";
import { Hospital } from "@/types/hospital";
import { getFplPercent, getKaiserWaAwardTier } from "@/utils/fpl_calculator";
import hospitalsData from "@/data/hospitals.json";

const hospitals = hospitalsData as unknown as Hospital[];

function ResultContent() {
  const searchParams = useSearchParams();
  const hospitalId = searchParams.get("hospital_id") ?? "";
  const income = searchParams.get("income") ?? "0";
  const householdSize = searchParams.get("householdSize") ?? "1";

  const hospital = hospitals.find((h) => h.hospital_id === hospitalId);
  const annualIncome = parseFloat(income);
  const size = parseInt(householdSize);
  const fplPercent = getFplPercent(annualIncome, size);

  const hasApplyPage = hospitalId === "kaiser-wa";
  const awardTier = hospitalId === "kaiser-wa" ? getKaiserWaAwardTier(annualIncome, size) : null;

  if (!hospital) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center px-6">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Hospital Not Found</h1>
          <p className="text-navy-300 mb-8">
            We couldn&apos;t find the hospital you selected.
          </p>
          <a
            href="/#calculator"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-500 text-navy-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </a>
        </div>
      </div>
    );
  }

  let eligible: boolean;
  let limitDescription: string;

  if (hospital.income_limits.type === "fpl_percentage") {
    eligible = fplPercent <= hospital.income_limits.fpl_percent;
    limitDescription = `up to ${hospital.income_limits.fpl_percent}% of the Federal Poverty Level`;
  } else {
    const incomeLimit = hospital.income_limits.by_household_size[size.toString()];
    eligible = annualIncome <= incomeLimit;
    limitDescription = `up to $${incomeLimit?.toLocaleString()} for a household of ${size}`;
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <nav className="border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold text-white tracking-tight">
              Civis Health
            </span>
          </a>
        </div>
      </nav>

      <div className="flex items-center justify-center py-20 px-6">
        <div className="max-w-lg w-full text-center">
          {eligible ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                You Qualify!
              </h1>
              <p className="text-navy-300 text-lg mb-2">
                Based on your income of{" "}
                <span className="text-white font-semibold">
                  ${annualIncome.toLocaleString()}
                </span>{" "}
                ({fplPercent}% FPL), you likely qualify for:
              </p>
              <div className="bg-navy-800 rounded-xl p-6 mt-6 mb-8 border border-navy-700">
                <p className="text-xl font-bold text-white">{hospital.name}</p>
                <p className="text-accent mt-1">{hospital.policy_name}</p>
                <p className="text-navy-400 text-sm mt-2">
                  Covers patients with income {limitDescription}
                </p>
                {awardTier !== null && awardTier > 0 && (
                  <p className="text-emerald-400 text-sm font-semibold mt-2">
                    Estimated {awardTier}% award
                  </p>
                )}
              </div>
              {hasApplyPage ? (
                <a
                  href={`/apply?hospital_id=${hospitalId}&income=${income}&householdSize=${householdSize}`}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-500 text-navy-900 font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Start Application
                </a>
              ) : (
                <p className="text-navy-400 text-sm">
                  Contact {hospital.name} directly to apply for financial assistance.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                You May Not Qualify
              </h1>
              <p className="text-navy-300 text-lg mb-2">
                Based on your income of{" "}
                <span className="text-white font-semibold">
                  ${annualIncome.toLocaleString()}
                </span>{" "}
                ({fplPercent}% FPL), you may not qualify for:
              </p>
              <div className="bg-navy-800 rounded-xl p-6 mt-6 mb-8 border border-navy-700">
                <p className="text-xl font-bold text-white">{hospital.name}</p>
                <p className="text-accent mt-1">{hospital.policy_name}</p>
                <p className="text-navy-400 text-sm mt-2">
                  This program covers patients with income {limitDescription}
                </p>
              </div>
              <p className="text-navy-400 text-sm mb-8">
                You may still qualify based on other factors like medical debt or
                extraordinary circumstances. Contact the hospital directly for
                more information.
              </p>
            </>
          )}

          <div className="mt-6">
            <a
              href="/#calculator"
              className="inline-flex items-center gap-2 text-navy-400 hover:text-white font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {eligible ? "Check another hospital" : "Try Again"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
          <p className="text-navy-400">Loading results...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
