# Civis Health

## Project Overview
A non-profit tool that helps patients determine eligibility for hospital financial assistance programs and generate pre-filled PDF applications.

- **Repo**: github.com/d-nieltran/Civis-Health
- **Hosting**: Vercel (auto-deploys from `main`)
- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, Lucide React (icons)
- **PDF**: pdf-lib (server-side generation)
- **Git email**: d@nieltran.com

## Project Structure
```
src/
├── app/
│   ├── page.tsx                 # Landing page (hero, how-it-works, form, footer)
│   ├── layout.tsx               # Root layout (Inter font, metadata)
│   ├── globals.css              # Base styles
│   ├── result/
│   │   └── page.tsx             # Eligibility result + PDF download
│   └── api/
│       └── generate-pdf/
│           └── route.ts         # POST endpoint — generates PDF via pdf-lib
├── components/
│   ├── EligibilityForm.tsx      # Income + household size form → navigates to /result
│   └── HospitalSearch.tsx       # Hospital dropdown (reads hospitals.json)
├── data/
│   └── hospitals.json           # Hospital policies, income limits, PDF field maps
├── types/
│   └── hospital.ts              # Hospital, IncomeLimit union types
└── utils/
    └── fpl_calculator.ts        # FPL math (getFederalPovertyLevel, getFplPercent)
public/
└── forms/
    ├── kaiser_form.pdf          # Placeholder PDF template
    └── sutter_form.pdf          # Placeholder PDF template
```

## Architecture Decisions
- **Income limits**: Union type — `fpl_percentage` (e.g. Kaiser 350% FPL) or `flat` dollar amounts by household size (e.g. Sutter)
- **Flow**: Landing page form → `/result?hospital_id=X&income=Y&householdSize=Z` → eligibility verdict + PDF download via `/api/generate-pdf`
- **pdf_field_map**: Each hospital entry maps our form keys to their PDF field names (for future real PDF form-filling)
- **FPL constants**: 2024 guidelines — base $15,060 + $5,380 per additional person

## Design System
- **Palette**: Navy (#0f172a) + White + Teal accent (#0d9488)
- **Design direction**: Institutional nonprofit — not tech startup
- **Tailwind tokens**: `navy-*` (primary), `accent-*` (teal), standard Tailwind for red/emerald status colors
- **Font**: Inter (Google Fonts)

## Workflow
- Always `npm run build` before committing to catch type errors
- Commit and push after successful build
- Vercel auto-deploys from `main` — verify at production URL after push

## Vercel Settings
- **Framework Preset**: Next.js
- **Output Directory**: (blank — auto-detected)
- **Root Directory**: ./
