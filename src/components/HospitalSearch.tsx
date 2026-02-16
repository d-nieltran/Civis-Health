"use client";

import { Hospital } from "@/types/hospital";
import hospitalsData from "@/data/hospitals.json";

const hospitals = hospitalsData as Hospital[];

interface HospitalSearchProps {
  value: string;
  onChange: (id: string) => void;
}

export default function HospitalSearch({ value, onChange }: HospitalSearchProps) {
  return (
    <div>
      <label
        htmlFor="hospital"
        className="block text-sm font-semibold text-navy-700 mb-2"
      >
        Select Hospital
      </label>
      <select
        id="hospital"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-navy-900 bg-white"
      >
        <option value="" disabled>
          Select a hospital...
        </option>
        {hospitals.map((hospital) => (
          <option key={hospital.hospital_id} value={hospital.hospital_id}>
            {hospital.name}
          </option>
        ))}
      </select>
    </div>
  );
}
