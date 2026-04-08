# CrewCast — Architecture Diagram

> **C4 Level 1 (System Context) + Level 2 (Container) — ASCII representation**  
> **Updated:** 2026-04-08

---

## C4 Level 1 — System Context

```
┌─────────────────────────────────────────────────────────────┐
│                        External Systems                      │
│                                                             │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │  Sailinga.com  │    │ CrewInspector  │  (Crewing sites)  │
│  │  (crewing      │    │ (multi-tenant  │                   │
│  │   portal)      │    │  portal)       │                   │
│  └────────────────┘    └────────────────┘                   │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS (Playwright browser automation)
                       │
              ┌────────┴────────┐
              │   CrewCast      │  Seafarer profile submission
              │   System        │  automation tool
              │                 │
              │  CLI entry:     │
              │  src/cli.ts     │
              │  Bot entry:     │
              │  src/bot/       │
              └────────┬────────┘
                       │  reads
                       │
              ┌────────┴────────┐
              │  profile.json   │  Seafarer profile data
              │  CV / Photo     │  (local files)
              └─────────────────┘
```

---

## C4 Level 2 — Container Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  CrewCast System                                                              │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Entry Points                                                           │ │
│  │                                                                         │ │
│  │  ┌──────────────────┐         ┌──────────────────────────────────────┐  │ │
│  │  │   CLI (cli.ts)   │         │  Telegram Bot (src/bot/)             │  │ │
│  │  │                  │         │                                      │  │ │
│  │  │  - Parse args    │         │  - /start, /help, /preview commands  │  │ │
│  │  │  - Read JSON     │         │  - Accepts JSON file via Telegram     │  │ │
│  │  │  - Schema valid. │         │  - Reports results back to user       │  │ │
│  │  │  - Run/preview   │         │  - Runs in preview mode (server-safe) │  │ │
│  │  └────────┬─────────┘         └──────────────────┬───────────────────┘  │ │
│  └───────────┼──────────────────────────────────────┼─────────────────────┘ │
│              │                                       │                       │
│              └──────────────┬────────────────────────┘                       │
│                             │  calls                                          │
│  ┌──────────────────────────▼──────────────────────────────────────────────┐ │
│  │  Core Layer                                                             │ │
│  │                                                                         │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │ │
│  │  │ profileSchema.ts │  │ profileNormalizer│  │  profileValidator.ts │  │ │
│  │  │ (Zod validation) │  │  (date normalisn)│  │  (field validation)  │  │ │
│  │  └────────┬─────────┘  └────────┬─────────┘  └──────────────────────┘  │ │
│  │           │                     │                                        │ │
│  │           └──────────┬──────────┘                                       │ │
│  │                      │  SeafarerProfile                                  │ │
│  │  ┌───────────────────▼──────────────────────────────────────────────┐   │ │
│  │  │  Adapter Registry  (adapters/registry.ts)                        │   │ │
│  │  │                                                                  │   │ │
│  │  │  ┌──────────────────┐    ┌─────────────────────────────────┐    │   │ │
│  │  │  │ SailingaAdapter  │    │   CrewInspectorAdapter          │    │   │ │
│  │  │  │                  │    │   (multi-tenant: orca, etc.)    │    │   │ │
│  │  │  │ buildSubmission  │    │   buildSubmissionPlan()         │    │   │ │
│  │  │  │ Plan()           │    │                                 │    │   │ │
│  │  │  └────────┬─────────┘    └──────────────────┬─────────────┘    │   │ │
│  │  └───────────┼──────────────────────────────────┼─────────────────┘   │ │
│  │              │  SubmissionPlan                   │                      │ │
│  │  ┌───────────▼──────────────────────────────────▼─────────────────┐   │ │
│  │  │  Engine Runner  (engine/runner.ts)                              │   │ │
│  │  │                                                                 │   │ │
│  │  │  - Validates profile (profileValidator)                        │   │ │
│  │  │  - Launches Playwright browser (submit mode)                   │   │ │
│  │  │  - Executes SubmissionPlan actions via BrowserRuntime          │   │ │
│  │  │  - Returns SubmissionResult with action results + screenshots  │   │ │
│  │  └──────────────────────────────┬──────────────────────────────────┘   │ │
│  │                                 │                                        │ │
│  │         ┌───────────────────────┴──────────────────────────────┐        │ │
│  │         │                                                       │        │ │
│  │  ┌──────▼──────────────┐                           ┌───────────▼──────┐ │ │
│  │  │  BrowserRuntime     │                           │  ResultStorage   │ │ │
│  │  │  (runtime/browser)  │                           │  (storage/)      │ │ │
│  │  │                     │                           │                  │ │ │
│  │  │  Wraps Playwright   │                           │  Saves results   │ │ │
│  │  │  Page API: jsFill,  │                           │  to JSON files   │ │ │
│  │  │  jsSelect, click,   │                           │  in artifacts/   │ │ │
│  │  │  waitForFunction,   │                           │  results/        │ │ │
│  │  │  upload, screenshot │                           └──────────────────┘ │ │
│  │  └─────────────────────┘                                                │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

| Decision | Rationale | ADR |
|----------|-----------|-----|
| Adapter pattern for sites | Isolates site-specific logic; easy to add new crewing portals | ADR-001 |
| SubmissionPlan as pure data | Decouples plan construction from execution; enables preview mode and testing | ADR-002 |
| Profile normalization at CLI entry | Single transformation point before any adapter sees the data | ADR-003 |
| Zod schema validation before normalisation | Catches shape mismatches with user-friendly field-level errors | — |
| BrowserRuntime abstraction | Decouples adapter logic from Playwright API details | — |

---

## Data Flow

```
profile.json
     │
     ▼
  JSON.parse (try/catch)
     │
     ▼
  Zod schema validation ──► error → exit with field-level message
     │
     ▼
  normalizeProfile (date formats, Array guards)
     │
     ▼
  validateProfile (required fields, email format)
     │  (error → SubmissionResult with validationStatus=error)
     ▼
  adapter.buildSubmissionPlan(profile) → SubmissionPlan
     │
     ▼
  EngineRunner.run(plan, profile, mode)
     │
     ├── preview mode → skip browser, mark all actions as skipped
     │
     └── submit mode → launch Playwright browser
                           │
                           ▼
                       navigate to siteUrl
                       waitForReady (waitForFunction)
                       execute actions one by one
                           │
                           ├── jsFill / jsSelect / jsCheck
                           ├── click / upload
                           └── waitForFunction (resilient wait)
                           │
                           ▼
                       declareAction (if present)
                       submitAction
                       waitForNetworkIdle
                       screenshot
     │
     ▼
  ResultStorage.save(result) → artifacts/results/<runId>.json
```
