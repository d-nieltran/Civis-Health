import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Hospital } from "@/types/hospital";
import hospitalsData from "@/data/hospitals.json";
import fs from "fs";
import path from "path";

const hospitals = hospitalsData as unknown as Hospital[];

interface HouseholdMember {
  name: string;
  dob: string;
  relationship: string;
  medicalRecord: string;
}

interface KaiserWaBody {
  hospital_id: string;
  patientName: string;
  medicalRecordNumber?: string;
  dateOfBirth?: string;
  ssn?: string;
  noSsn?: boolean;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isUnhoused?: string;
  phoneNumber?: string;
  phoneType?: string;
  enrolledStateAssistance?: string;
  householdSize?: string;
  monthlyIncome?: string;
  incomeTypes?: Record<string, boolean>;
  zeroIncomeExplanation?: string;
  healthCareCosts?: string;
  members?: HouseholdMember[];
  contactMe?: boolean;
  optOutCreditCheck?: boolean;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()}`;
}

const NAVY = rgb(15 / 255, 23 / 255, 42 / 255);
const GRAY = rgb(100 / 255, 116 / 255, 139 / 255);
const TEAL = rgb(13 / 255, 148 / 255, 136 / 255);

async function generateKaiserWaPdf(body: KaiserWaBody): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), "public", "forms", "kaiser_wa_form.pdf");
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Helper to safely set text fields
  const setText = (fieldName: string, value: string | undefined) => {
    if (!value) return;
    try {
      form.getTextField(fieldName).setText(value);
    } catch { /* field not found */ }
  };

  // Helper to safely check checkboxes
  const setCheck = (fieldName: string, checked: boolean | undefined) => {
    if (!checked) return;
    try {
      form.getCheckBox(fieldName).check();
    } catch { /* field not found */ }
  };

  // Helper to safely select radio options
  const setRadio = (fieldName: string, value: string | undefined) => {
    if (!value) return;
    try {
      form.getRadioGroup(fieldName).select(value);
    } catch { /* field not found */ }
  };

  // Section 1: Patient Information
  setText("001", body.patientName);
  setText("002", body.medicalRecordNumber);
  setText("003", formatDate(body.dateOfBirth ?? ""));
  if (!body.noSsn) {
    setText("004", body.ssn);
  }
  setCheck("005", body.noSsn);
  setText("006", body.streetAddress);
  setText("007", body.city);
  setText("008", body.state);
  setText("009", body.zipCode);
  setRadio("010", body.isUnhoused);
  setText("011", body.phoneNumber);
  setRadio("012", body.phoneType);
  setRadio("013", body.enrolledStateAssistance);

  // Section 2: Household Information
  setText("014", body.householdSize);

  // Income type checkboxes (fields 015-024)
  const incomeFieldMap: [string, string][] = [
    ["incomeBusiness", "015"],
    ["incomeEmployment", "016"],
    ["incomeVeterans", "017"],
    ["incomeInterest", "018"],
    ["incomeSelfEmployed", "019"],
    ["incomeSocialSecurity", "020"],
    ["incomeUnemployment", "021"],
    ["incomeSpousalChild", "022"],
    ["incomePension", "023"],
    ["incomeNone", "024"],
  ];
  for (const [key, fieldName] of incomeFieldMap) {
    setCheck(fieldName, !!body.incomeTypes?.[key]);
  }

  setText("025", body.zeroIncomeExplanation);
  setText("026", body.monthlyIncome);
  setText("027", body.healthCareCosts);

  // Household members (fields 028-047, 4 fields per member, 5 members max)
  const members = body.members ?? [];
  for (let i = 0; i < Math.min(members.length, 5); i++) {
    const m = members[i];
    const baseField = 28 + i * 4;
    setText(String(baseField).padStart(3, "0"), m.name);
    setText(String(baseField + 1).padStart(3, "0"), formatDate(m.dob));
    setText(String(baseField + 2).padStart(3, "0"), m.relationship);
    setText(String(baseField + 3).padStart(3, "0"), m.medicalRecord);
  }

  setCheck("048", body.contactMe);
  setCheck("049", body.optOutCreditCheck);

  // Set today's date in the signature date field
  const today = new Date();
  const dateStr = `${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getDate().toString().padStart(2, "0")}/${today.getFullYear()}`;
  setText("051", dateStr);

  return pdfDoc.save();
}

async function generateGenericPdf(
  body: { patientName: string; income: number; householdSize: number },
  hospital: Hospital
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  let y = height - 60;

  page.drawText("Financial Assistance Application", {
    x: 50, y, size: 22, font: fontBold, color: NAVY,
  });
  y -= 20;
  page.drawText("Generated by Civis Health", {
    x: 50, y, size: 10, font, color: GRAY,
  });
  y -= 8;
  page.drawLine({
    start: { x: 50, y }, end: { x: 562, y },
    thickness: 1, color: TEAL,
  });
  y -= 40;

  page.drawText("Patient Information", {
    x: 50, y, size: 14, font: fontBold, color: NAVY,
  });
  y -= 28;

  const fields = [
    ["Patient Name", body.patientName],
    ["Hospital", hospital.name],
    ["Program", hospital.policy_name],
    ["Annual Household Income", `$${Number(body.income).toLocaleString()}`],
    ["Household Size", String(body.householdSize)],
    ["Date", new Date().toLocaleDateString("en-US")],
  ];

  for (const [label, value] of fields) {
    page.drawText(`${label}:`, { x: 50, y, size: 11, font: fontBold, color: NAVY });
    page.drawText(value, { x: 220, y, size: 11, font, color: NAVY });
    y -= 24;
  }

  y -= 20;
  page.drawText("Declaration", {
    x: 50, y, size: 14, font: fontBold, color: NAVY,
  });
  y -= 24;
  const declaration =
    "I hereby certify that the information provided above is true and correct to the best of my knowledge. " +
    "I am requesting consideration for financial assistance for medical services received at the above-named hospital.";

  const words = declaration.split(" ");
  let line = "";
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, 10) > 490) {
      page.drawText(line, { x: 50, y, size: 10, font, color: NAVY });
      y -= 16;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x: 50, y, size: 10, font, color: NAVY });
    y -= 40;
  }

  page.drawLine({ start: { x: 50, y }, end: { x: 300, y }, thickness: 0.5, color: NAVY });
  page.drawText("Patient Signature", { x: 50, y: y - 14, size: 9, font, color: GRAY });
  page.drawLine({ start: { x: 350, y }, end: { x: 520, y }, thickness: 0.5, color: NAVY });
  page.drawText("Date", { x: 350, y: y - 14, size: 9, font, color: GRAY });

  return pdfDoc.save();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hospital_id, patientName } = body;

    if (!patientName || !hospital_id) {
      return NextResponse.json(
        { error: "Missing required fields: patientName, hospital_id" },
        { status: 400 }
      );
    }

    const hospital = hospitals.find((h) => h.hospital_id === hospital_id);
    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    let pdfBytes: Uint8Array;

    if (hospital_id === "kaiser-wa") {
      pdfBytes = await generateKaiserWaPdf(body as KaiserWaBody);
    } else {
      pdfBytes = await generateGenericPdf(body, hospital);
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${hospital_id}-mfa-application.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate application PDF" },
      { status: 500 }
    );
  }
}
