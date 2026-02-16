"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import hospitalsData from "@/data/hospitals.json";
import { getFplPercent } from "@/utils/fpl_calculator";

type Hospital = {
  hospital_id: string;
  name: string;
  policy_name: string;
  income_limits:
    | { type: "fpl_percentage"; fpl_percent: number }
    | { type: "flat"; by_household_size: Record<string, number> };
  application_pdf_url: string;
  pdf_field_map: Record<string, string>;
};

function ResultContent() {
  const searchParams = useSearchParams();
  const hospitalId = searchParams.get("hospital_id");
  const income = searchParams.get("income");
  const householdSize = searchParams.get("householdSize");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!hospitalId || !income || !householdSize) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg p-8 text-center">
          <p className="text-red-600 text-lg mb-4">Missing required information</p>
          <a
            href="/#calculator"
            className="text-[#0A2540] hover:underline font-medium"
          >
            Go back to calculator
          </a>
        </div>
      </div>
    );
  }

  const hospitals = hospitalsData as Hospital[];
  const hospital = hospitals.find((h) => h.hospital_id === hospitalId);

  if (!hospital) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg p-8 text-center">
          <p className="text-red-600 text-lg mb-4">Hospital not found</p>
          <a
            href="/#calculator"
            className="text-[#0A2540] hover:underline font-medium"
          >
            Go back to calculator
          </a>
        </div>
      </div>
    );
  }

  const incomeNum = Number(income);
  const householdSizeNum = Number(householdSize);

  let isEligible = false;
  let fplPercent = 0;

  if (hospital.income_limits.type === "fpl_percentage") {
    fplPercent = getFplPercent(incomeNum, householdSizeNum);
    isEligible = fplPercent <= hospital.income_limits.fpl_percent;
  } else if (hospital.income_limits.type === "flat") {
    const limit = hospital.income_limits.by_household_size[String(householdSizeNum)];
    isEligible = limit !== undefined && incomeNum <= limit;
    fplPercent = getFplPercent(incomeNum, householdSizeNum);
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: "Applicant",
          hospital_id: hospitalId,
          income: incomeNum,
          householdSize: householdSizeNum,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "civis-health-application.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download application. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A2540] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {isEligible ? (
          <>
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              You Qualify!
            </h1>
            <p className="text-xl text-white/90 mb-2">{hospital.name}</p>
            <p className="text-lg text-white/80 mb-4">{hospital.policy_name}</p>
            <p className="text-white/70 mb-8">
              Your household income is at {fplPercent}% of the Federal Poverty Level
            </p>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#F7B801] text-[#0A2540] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#F7B801]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isDownloading ? "Generating..." : "Download Application"}
            </button>
            <div className="mt-6">
              <a
                href="/#calculator"
                className="text-white/80 hover:text-white underline"
              >
                Start Over
              </a>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              You May Not Qualify
            </h1>
            <p className="text-xl text-white/90 mb-4">{hospital.name}</p>
            <p className="text-lg text-white/80 mb-8">
              Based on the information provided, your household income appears to exceed
              the eligibility threshold for {hospital.policy_name}. However, you may still
              apply directly with the hospital for consideration.
            </p>
            <div className="mt-6">
              <a
                href="/#calculator"
                className="text-white/80 hover:text-white underline text-lg"
              >
                Try Again
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A2540] flex items-center justify-center">
          <p className="text-white text-xl">Loading...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
