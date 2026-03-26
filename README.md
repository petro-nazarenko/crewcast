# CrewCast

> Automated seafarer profile submission CLI — fill maritime job-site registration forms from a single JSON profile.

---

## Overview

CrewCast reads a `profile.json` file describing a seafarer (personal data, documents, certificates, sea-service history) and automatically fills the corresponding online registration / application forms using [Playwright](https://playwright.dev/).

Supported sites (adapters):

| Site ID               | URL                                     |
|-----------------------|-----------------------------------------|
| `sailinga`            | <http://www.sailinga.lt/?tip=af>        |
| `crewinspector-orca`  | CrewInspector — Orca company portal     |

---

## Requirements

- Node.js ≥ 18
- npm ≥ 9

---

## Installation

```bash
npm install
npx playwright install chromium
```

---

## Quick Start

1. **Edit `profile.json`** with your seafarer data (see [Profile Format](#profile-format)).
2. **(Optional)** Place CV and photo files under `attachments/`.
3. **Run** against a target site:

```bash
# Preview — validate & print the action plan, no browser launched
npm run dev -- sailinga --preview

# Submit — open a browser and fill the form
npm run dev -- sailinga

# Use a custom profile file
npm run dev -- sailinga path/to/myprofile.json
```

---

## CLI Usage

```
Usage: node src/cli.ts <siteId> [profilePath] [--preview]

  siteId       Required. e.g. "sailinga" or "crewinspector-orca"
  profilePath  Optional. Default: ./profile.json
  --preview    Optional. Build plan and validate without opening a browser.

Examples:
  npm run dev -- sailinga
  npm run dev -- sailinga profile.json --preview
  npm run dev -- crewinspector-orca
```

Exit codes: `0` on success, `1` on failure.

---

## Profile Format

`profile.json` — a single JSON file that describes the seafarer:

```jsonc
{
  "firstName": "Ivan",
  "lastName": "Kovalenko",
  "dateOfBirth": "1985-03-12",       // ISO 8601
  "gender": "Male",
  "nationality": "Ukrainian",
  "citizenship": "Ukrainian",
  "placeOfBirth": "Odesa",
  "englishLevel": "Upper-Intermediate", // Basic | Intermediate | Upper-Intermediate | Advanced
  "email": "ivan@example.com",
  "phone": "+380501234567",
  "residence": "Ukraine",
  "city": "Odesa",
  "country": "Ukraine",
  "airport": "ODS",
  "availableFrom": "2024-06-01",
  "salary": "4500",
  "position": "AB",
  "preferredRank": "AB",
  "preferredVessel": "PSV",
  "vesselType": "OSV",

  "documents": {
    "passport": {
      "number": "FP123456",
      "issued": "2020-01-15",
      "validTo": "2030-01-15",
      "country": "Ukraine"
    },
    "seamanBookUA": {
      "number": "AB654321",
      "issued": "2019-05-10",
      "validTo": "2024-05-10",
      "country": "Ukraine"
    },
    "usaVisaC1D": {
      "number": "V987654",
      "issued": "2021-08-20",
      "validTo": "2031-08-20"
    }
  },

  "certificates": [
    {
      "name": "Basic Safety Training (STCW)",
      "number": "BST-001",
      "issued": "2018-04-01",
      "issuedBy": "Odesa Maritime Academy",
      "validTo": null          // null = unlimited
    }
  ],

  "seaService": [
    {
      "rank": "AB/B/S",
      "vessel": "MV Atlantic Provider",
      "dwt": 5200,
      "type": "PSV",
      "area": "North Sea",
      "from": "2021-03-01",
      "to": "2021-09-01",
      "company": "North Sea Shipping Ltd"
    }
  ],

  "notes": "Available for immediate hire",
  "skills": ["DP Basic", "HUET", "Rigging"],

  "attachments": {
    "cvPath": "attachments/cv.pdf",
    "photoPath": "attachments/photo.jpg"
  }
}
```

---

## Project Structure

```
crewcast/
├── src/
│   ├── cli.ts                    # Entry point
│   ├── adapters/
│   │   ├── registry.ts           # Adapter registry
│   │   ├── sailinga/             # Sailinga.lt adapter
│   │   └── crewinspector/        # CrewInspector adapter
│   ├── domain/
│   │   └── profile.ts            # SeafarerProfile type
│   ├── engine/
│   │   ├── runner.ts             # Playwright execution engine
│   │   ├── submissionPlan.ts     # Plan / action types
│   │   └── result.ts             # RunResult / RunMode types
│   ├── normalizers/              # Profile & date normalisation
│   ├── storage/                  # Saves run results as JSON
│   ├── utils/                    # Logger, attachment helpers
│   └── validators/               # Profile validation
├── artifacts/                    # Run results (auto-created)
├── profile.json                  # Your seafarer profile (edit this)
└── tests/                        # Jest unit tests
```

---

## Adding a New Site Adapter

1. Create `src/adapters/<siteId>/index.ts` implementing `SiteAdapter`.
2. Register it in `src/adapters/registry.ts`.
3. (Optional) Add a `config.ts` and `mappings.ts` for site-specific values.

---

## Testing

```bash
npm test
```

---

## Results

Each run writes a JSON result file to `artifacts/results/`. The file contains the site ID, timestamp, success flag, and any errors encountered.

---

## License

MIT
