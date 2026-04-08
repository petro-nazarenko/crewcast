# CrewCast — Roadmap After Improvements

> **Updated:** 2026-04-08  
> **Based on:** Post-implementation audit following the initial audit cycle

---

## Summary

The first implementation cycle addressed all P0 and P1 issues plus several P2 items. The system is now stable and production-ready at the CLI level. The roadmap below describes what was done and what remains across three phases.

---

## Phase 1 — Stability & Safety (DONE ✅)

**Goal:** Eliminate crash risks, vulnerabilities, and regressions.

| ID | Task | Priority | Complexity | Impact | ROI | Depends On |
|----|------|----------|------------|--------|-----|-----------|
| 1.1 | Wrap `JSON.parse` in `try/catch` in `cli.ts` | P0 | Low | High | ⭐⭐⭐⭐⭐ | — |
| 1.2 | Fix 3 npm vulnerabilities via `npm audit fix` | P0 | Low | High | ⭐⭐⭐⭐⭐ | — |
| 1.3 | Add `Array.isArray` guards in `profileNormalizer.ts` | P1 | Low | High | ⭐⭐⭐⭐⭐ | — |
| 1.4 | Add `isolatedModules: true` to `tsconfig.json` | P1 | Low | Medium | ⭐⭐⭐⭐ | — |
| 1.5 | Add CI/CD pipeline (`.github/workflows/ci.yml`) | P1 | Low | High | ⭐⭐⭐⭐⭐ | 1.1–1.3 |

All Phase 1 tasks are **complete**. Regressions are now caught automatically on every push and PR.

---

## Phase 2 — Quality & Maintainability (IN PROGRESS 🔄)

**Goal:** Improve developer experience, code clarity, and documentation.

| ID | Task | Priority | Complexity | Impact | ROI | Depends On | Status |
|----|------|----------|------------|--------|-----|-----------|--------|
| 2.1 | Create `.env.example` (document env vars) | P2 | Low | Medium | ⭐⭐⭐⭐ | — | ✅ Done |
| 2.2 | Add `artifacts/screenshots/.gitkeep` | P2 | Low | Low | ⭐⭐⭐ | — | ✅ Done |
| 2.3 | Extract company-split to `utils/company.ts` | P2 | Low | Medium | ⭐⭐⭐⭐ | — | ✅ Done |
| 2.4 | Read marital status & citizenship from profile | P2 | Low | Medium | ⭐⭐⭐⭐ | — | ✅ Done |
| 2.5 | Add ESLint + `@typescript-eslint` config | P2 | Low | Medium | ⭐⭐⭐⭐ | — | ✅ Done |
| 2.6 | Add ADR documents (ADR-001, -002, -003) | P2 | Low | Medium | ⭐⭐⭐ | — | ✅ Done |
| 2.7 | Fix `any` type errors in `engine/runner.ts` | P2 | Low | Low | ⭐⭐⭐ | 2.5 | ✅ Done |
| 2.8 | Replace hard-coded `wait(ms)` in adapters with `waitForFunction` | P2 | Medium | Medium | ⭐⭐⭐ | — | ⬜ Open |
| 2.9 | Add architecture diagram (C4 Level 1/2) to `docs/` | P2 | Medium | Low | ⭐⭐ | — | ⬜ Open |

### Highest-ROI item remaining in Phase 2

**2.8** — Replacing fixed `wait(ms)` calls in adapter action plans with `waitForFunction` checks makes submissions more resilient on slow connections without increasing run time on fast ones.

---

## Phase 3 — Extensibility & Coverage (FUTURE 📋)

**Goal:** Make the platform easier to extend and more robust in production.

| ID | Task | Priority | Complexity | Impact | ROI | Depends On |
|----|------|----------|------------|--------|-----|-----------|
| 3.1 | Lint test files (extend ESLint to `tests/**`) | P2 | Low | Low | ⭐⭐⭐ | 2.5 |
| 3.2 | Add JSDoc to public API types and functions | P2 | Low | Medium | ⭐⭐⭐ | — |
| 3.3 | Add a third adapter (e.g. MarineJobs, Martide) | P1 | High | High | ⭐⭐⭐⭐⭐ | 1.5 |
| 3.4 | Validate that `preferredRank` is a known rank value | P2 | Low | Medium | ⭐⭐⭐ | — |
| 3.5 | Add retry logic to `EngineRunner` for transient failures | P2 | Medium | Medium | ⭐⭐⭐ | Phase 1 |
| 3.6 | Structured JSON logging mode (for CI log parsers) | P2 | Medium | Low | ⭐⭐ | — |
| 3.7 | Profile schema validation (e.g. Zod or JSON Schema) | P1 | Medium | High | ⭐⭐⭐⭐ | — |

### Highest-ROI items in Phase 3

- **3.3** — Each new adapter directly multiplies the tool's value for end users.
- **3.7** — Schema validation (Zod) at parse time gives better errors than the current runtime validator and catches shape mismatches before they reach the normalizer.

---

## Dependency Graph

```
Phase 1 (Safety)
  ├── 1.1 JSON.parse safety
  ├── 1.2 npm audit fix
  ├── 1.3 Array.isArray guards
  ├── 1.4 isolatedModules
  └── 1.5 CI/CD  ──────────────────┐
                                   │
Phase 2 (Quality)                  │
  ├── 2.1 .env.example             │
  ├── 2.3 splitCompany util        │
  ├── 2.4 profile fields in adapter│
  ├── 2.5 ESLint ─────► 2.7 fix any│
  ├── 2.6 ADRs                     │
  ├── 2.8 waitForFunction in adapters
  └── 2.9 Architecture diagram     │
                                   ▼
Phase 3 (Extensibility)       CI runs on all PRs
  ├── 3.1 Lint tests (needs 2.5)
  ├── 3.3 New adapters
  ├── 3.5 Retry logic (needs Phase 1)
  └── 3.7 Zod schema validation
```

---

## ROI Summary

| Rank | Task | Why |
|------|------|-----|
| 1 | CI/CD (1.5) | Every future change is automatically validated |
| 2 | JSON.parse safety (1.1) | Eliminates silent crash on user input error |
| 3 | Array.isArray guards (1.3) | Prevents runtime crash on incomplete profiles |
| 4 | npm vulnerabilities (1.2) | Eliminates critical/high CVEs |
| 5 | New adapter (3.3) | Direct product value for users |
| 6 | Zod schema (3.7) | Better DX; catches profile errors at parse time |
| 7 | Profile fields in adapter (2.4) | Removes hardcoded data; correctness improvement |
| 8 | splitCompany util (2.3) | DRY; single fix point |
| 9 | waitForFunction in adapters (2.8) | Resilience on slow connections |
| 10 | ESLint (2.5) | Prevents future type/style regressions |
