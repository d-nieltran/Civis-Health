"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import {
  Shield,
  Download,
  ArrowLeft,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { getFplPercent, getKaiserWaAwardTier } from "@/utils/fpl_calculator";

const INCOME_TYPES = [
  { key: "incomeBusiness", label: "Business/rental income" },
  { key: "incomeEmployment", label: "Employment income/wages" },
  { key: "incomeVeterans", label: "Veterans benefits income" },
  { key: "incomeInterest", label: "Interest or dividends income" },
  { key: "incomeSelfEmployed", label: "Self-employed income" },
  { key: "incomeSocialSecurity", label: "Social Security/supplemental security income" },
  { key: "incomeUnemployment", label: "Unemployment benefits/disability income" },
  { key: "incomeSpousalChild", label: "Spousal/child support payments received" },
  { key: "incomePension", label: "Received pension/retirement/annuities income" },
  { key: "incomeNone", label: "No one in my household is earning or has received income in the past 2 months" },
] as const;

interface HouseholdMember {
  name: string;
  dob: string;
  relationship: string;
  medicalRecord: string;
}

const inputClass =
  "w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-navy-900 placeholder:text-navy-300 bg-white";
const labelClass = "block text-sm font-semibold text-navy-700 mb-1.5";
const sectionClass = "bg-white rounded-2xl shadow-lg border border-navy-100 p-8 mb-8";

function ApplyContent() {
  const searchParams = useSearchParams();
  const prefilledIncome = searchParams.get("income") ?? "";
  const prefilledHouseholdSize = searchParams.get("householdSize") ?? "1";

  // Section 1: Patient Information
  const [patientName, setPatientName] = useState("");
  const [medicalRecordNumber, setMedicalRecordNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ssn, setSsn] = useState("");
  const [noSsn, setNoSsn] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("WA");
  const [zipCode, setZipCode] = useState("");
  const [isUnhoused, setIsUnhoused] = useState<"Yes" | "No" | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneType, setPhoneType] = useState<"Home" | "Mobile" | "Work" | "Other">("Mobile");
  const [enrolledStateAssistance, setEnrolledStateAssistance] = useState<"Yes" | "No" | "">("");

  // Section 2: Household Information
  const [householdSize, setHouseholdSize] = useState(prefilledHouseholdSize);
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    if (prefilledIncome) {
      const monthly = Math.round(parseFloat(prefilledIncome) / 12);
      return isNaN(monthly) ? "" : String(monthly);
    }
    return "";
  });
  const [incomeTypes, setIncomeTypes] = useState<Record<string, boolean>>({});
  const [zeroIncomeExplanation, setZeroIncomeExplanation] = useState("");
  const [healthCareCosts, setHealthCareCosts] = useState("");

  // Household members
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  // Section 3: Agreement
  const [contactMe, setContactMe] = useState(false);
  const [optOutCreditCheck, setOptOutCreditCheck] = useState(false);

  const [downloading, setDownloading] = useState(false);

  // Eligibility preview
  const eligibility = useMemo(() => {
    const monthly = parseFloat(monthlyIncome);
    const size = parseInt(householdSize);
    if (isNaN(monthly) || isNaN(size) || size < 1) return null;
    const annual = monthly * 12;
    const fplPct = getFplPercent(annual, size);
    const awardTier = getKaiserWaAwardTier(annual, size);
    return { fplPct, awardTier, annual };
  }, [monthlyIncome, householdSize]);

  function addMember() {
    if (members.length >= 5) return;
    setMembers([...members, { name: "", dob: "", relationship: "", medicalRecord: "" }]);
  }

  function removeMember(index: number) {
    setMembers(members.filter((_, i) => i !== index));
  }

  function updateMember(index: number, field: keyof HouseholdMember, value: string) {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  }

  function toggleIncomeType(key: string) {
    setIncomeTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName || !monthlyIncome) return;

    setDownloading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospital_id: "kaiser-wa",
          patientName,
          medicalRecordNumber,
          dateOfBirth,
          ssn,
          noSsn,
          streetAddress,
          city,
          state,
          zipCode,
          isUnhoused,
          phoneNumber,
          phoneType,
          enrolledStateAssistance,
          householdSize,
          monthlyIncome,
          incomeTypes,
          zeroIncomeExplanation,
          healthCareCosts,
          members,
          contactMe,
          optOutCreditCheck,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to generate PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kaiser-wa-mfa-application.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <nav className="bg-navy-900 border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold text-white tracking-tight">
              Civis Health
            </span>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-navy-900">
            Kaiser Permanente Washington
          </h1>
          <p className="mt-2 text-navy-500">
            Medical Financial Assistance (MFA) Program Application
          </p>
        </div>

        {/* Eligibility Preview */}
        {eligibility && (
          <div
            className={`rounded-xl p-4 mb-8 border ${
              eligibility.awardTier > 0
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 mt-0.5 ${eligibility.awardTier > 0 ? "text-emerald-600" : "text-amber-600"}`} />
              <div>
                <p className={`font-semibold ${eligibility.awardTier > 0 ? "text-emerald-800" : "text-amber-800"}`}>
                  {eligibility.awardTier > 0
                    ? `Estimated ${eligibility.awardTier}% Award`
                    : "May Not Qualify by Income Alone"}
                </p>
                <p className={`text-sm mt-0.5 ${eligibility.awardTier > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                  ${eligibility.annual.toLocaleString()}/year is {eligibility.fplPct}% of the
                  Federal Poverty Level for a household of {householdSize}.
                  {eligibility.awardTier === 0 &&
                    " You may still qualify if your out-of-pocket health costs exceed 10% of income."}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Patient Information */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-navy-900 mb-6">
              Section 1: Patient Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="patientName" className={labelClass}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="patientName"
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="First and Last Name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className={labelClass}>
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="medicalRecordNumber" className={labelClass}>
                  Medical Record Number <span className="text-navy-400">(optional)</span>
                </label>
                <input
                  id="medicalRecordNumber"
                  type="text"
                  value={medicalRecordNumber}
                  onChange={(e) => setMedicalRecordNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="ssn" className={labelClass}>
                  Social Security Number <span className="text-navy-400">(optional)</span>
                </label>
                <input
                  id="ssn"
                  type="text"
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  disabled={noSsn}
                  placeholder="XXX-XX-XXXX"
                  className={`${inputClass} ${noSsn ? "opacity-50" : ""}`}
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noSsn}
                    onChange={(e) => {
                      setNoSsn(e.target.checked);
                      if (e.target.checked) setSsn("");
                    }}
                    className="rounded border-navy-300 text-accent-600 focus:ring-accent-400"
                  />
                  <span className="text-sm text-navy-600">
                    I do not have a Social Security Number
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="streetAddress" className={labelClass}>
                  Mailing Address (Street)
                </label>
                <input
                  id="streetAddress"
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="city" className={labelClass}>City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className={labelClass}>State</label>
                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className={labelClass}>Zip Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Is patient currently unhoused?
                </label>
                <div className="flex gap-4 mt-1">
                  {(["Yes", "No"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isUnhoused"
                        value={opt}
                        checked={isUnhoused === opt}
                        onChange={() => setIsUnhoused(opt)}
                        className="text-accent-600 focus:ring-accent-400"
                      />
                      <span className="text-sm text-navy-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className={labelClass}>
                  Primary Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(XXX) XXX-XXXX"
                  className={inputClass}
                />
                <div className="flex gap-3 mt-2">
                  {(["Home", "Mobile", "Work", "Other"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="phoneType"
                        value={opt}
                        checked={phoneType === opt}
                        onChange={() => setPhoneType(opt)}
                        className="text-accent-600 focus:ring-accent-400"
                      />
                      <span className="text-xs text-navy-600">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Is the patient enrolled in a state-based assistance program (SNAP, TANF, WIC,
                  low-income housing, or Medicaid)?
                </label>
                <div className="flex gap-4 mt-1">
                  {(["Yes", "No"] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="enrolledStateAssistance"
                        value={opt}
                        checked={enrolledStateAssistance === opt}
                        onChange={() => setEnrolledStateAssistance(opt)}
                        className="text-accent-600 focus:ring-accent-400"
                      />
                      <span className="text-sm text-navy-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Household Information */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-navy-900 mb-6">
              Section 2: Household Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label htmlFor="householdSize" className={labelClass}>
                  Household Size <span className="text-red-500">*</span>
                </label>
                <select
                  id="householdSize"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  className={inputClass}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="monthlyIncome" className={labelClass}>
                  Monthly Gross Household Income <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 font-medium">
                    $
                  </span>
                  <input
                    id="monthlyIncome"
                    type="number"
                    min="0"
                    required
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g. 2500"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className={labelClass}>
                Household Income Types <span className="text-navy-400">(check all that apply)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {INCOME_TYPES.map(({ key, label }) => (
                  <label key={key} className="flex items-start gap-2 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={!!incomeTypes[key]}
                      onChange={() => toggleIncomeType(key)}
                      className="mt-0.5 rounded border-navy-300 text-accent-600 focus:ring-accent-400"
                    />
                    <span className="text-sm text-navy-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {incomeTypes.incomeNone && (
              <div className="mb-6">
                <label htmlFor="zeroIncomeExplanation" className={labelClass}>
                  Please explain how you support yourself without income
                </label>
                <textarea
                  id="zeroIncomeExplanation"
                  value={zeroIncomeExplanation}
                  onChange={(e) => setZeroIncomeExplanation(e.target.value)}
                  rows={3}
                  placeholder="Explain how you cover food, shelter, utilities, and other necessities..."
                  className={inputClass}
                />
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="healthCareCosts" className={labelClass}>
                12-Month Out-of-Pocket Health Care Costs <span className="text-navy-400">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 font-medium">
                  $
                </span>
                <input
                  id="healthCareCosts"
                  type="number"
                  min="0"
                  value={healthCareCosts}
                  onChange={(e) => setHealthCareCosts(e.target.value)}
                  placeholder="Copays, coinsurance, deductibles"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <p className="text-xs text-navy-400 mt-1">
                Include copays, deposits, coinsurance, or deductible payments. Does not include monthly premiums.
              </p>
            </div>

            {/* Household Members Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className={labelClass}>
                  Household Members Applying for MFA
                </p>
                {members.length < 5 && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="inline-flex items-center gap-1 text-sm text-accent-600 hover:text-accent-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </button>
                )}
              </div>

              {members.length === 0 && (
                <p className="text-sm text-navy-400 italic">
                  No additional household members added. Click &quot;Add Member&quot; if others in
                  your household are also applying.
                </p>
              )}

              {members.map((member, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_auto] gap-3 items-end mb-3 p-4 bg-navy-50 rounded-lg"
                >
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={member.dob}
                      onChange={(e) => updateMember(i, "dob", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={member.relationship}
                      onChange={(e) => updateMember(i, "relationship", e.target.value)}
                      placeholder="e.g. Spouse, Child"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-navy-600 mb-1">Medical Record #</label>
                    <input
                      type="text"
                      value={member.medicalRecord}
                      onChange={(e) => updateMember(i, "medicalRecord", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Agreement */}
          <div className={sectionClass}>
            <h2 className="text-xl font-bold text-navy-900 mb-6">
              Section 3: Patient Agreement
            </h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactMe}
                  onChange={(e) => setContactMe(e.target.checked)}
                  className="mt-0.5 rounded border-navy-300 text-accent-600 focus:ring-accent-400"
                />
                <span className="text-sm text-navy-700">
                  <strong>Uninsured?</strong> Yes, I would like Kaiser Permanente to contact me to
                  discuss health care coverage options.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optOutCreditCheck}
                  onChange={(e) => setOptOutCreditCheck(e.target.checked)}
                  className="mt-0.5 rounded border-navy-300 text-accent-600 focus:ring-accent-400"
                />
                <span className="text-sm text-navy-700">
                  I do <strong>not</strong> want KFHP/H to use information from consumer credit
                  reporting agencies and other third-party information sources to determine
                  eligibility (opt-out). If you choose to opt-out, you will be required to
                  provide income documentation.
                </span>
              </label>

              <div className="bg-navy-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-navy-600">
                  By generating this application, you declare that all information is true,
                  accurate, and complete. You will need to print, sign, and date the application
                  before submitting it to Kaiser Permanente.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-accent-50 rounded-xl border border-accent-200 p-6 mb-8">
            <h3 className="font-semibold text-navy-900 mb-2">How to Submit</h3>
            <p className="text-sm text-navy-700 mb-3">
              After downloading, print and sign the application. Then submit it using one of these methods:
            </p>
            <ul className="text-sm text-navy-600 space-y-1.5">
              <li><strong>Fax:</strong> 206-877-0640</li>
              <li><strong>Mail:</strong> Kaiser Permanente MFA Program, PO Box 34584, Seattle, WA 98124-1584</li>
              <li><strong>In person:</strong> Drop off at the Business Office or check-in desk at any Kaiser Permanente facility</li>
              <li><strong>Phone:</strong> 1-800-442-4014 (TTY 711), Mon-Fri, 8 a.m. to 5 p.m. PST</li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!patientName || !monthlyIncome || downloading}
            className="w-full py-3.5 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <Download className="w-5 h-5" />
            {downloading ? "Generating PDF..." : "Generate Pre-Filled Application"}
          </button>
          <p className="text-center text-xs text-navy-400 mt-3">
            Your data stays on your device. The PDF is generated server-side and not stored.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-50 flex items-center justify-center">
          <p className="text-navy-400">Loading application...</p>
        </div>
      }
    >
      <ApplyContent />
    </Suspense>
  );
}
