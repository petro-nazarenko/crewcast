# CrewCast — Git Repository Audit Report

> **Initial audit date:** 2026-04-08  
> **Post-implementation audit date:** 2026-04-08  
> **Auditor:** Copilot Coding Agent  
> **Role:** Architectural auditor & systems engineer focused on deterministic, scalable, semantically coherent platforms

---

## 1. Roadmap After Improvements

See [ROADMAP.md](./ROADMAP.md) for the complete phased roadmap with priorities, dependencies, complexity estimates, and ROI rankings.

---

## 2. Updated Audit Summary

After the first implementation cycle all **P0** and **P1** issues are resolved. The system is now crash-safe, vulnerability-free, and covered by automated CI. Eight P2 issues have been addressed; two remain open.

### Current Risk Register

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | 3 npm vulnerabilities (critical/high/moderate) | **P0** | ✅ Resolved |
| 2 | `JSON.parse` without try/catch in `cli.ts` | **P0** | ✅ Resolved |
| 3 | No CI/CD pipeline | **P1** | ✅ Resolved |
| 4 | `ts-jest` TS151002 warnings (`isolatedModules`) | **P1** | ✅ Resolved |
| 5 | `profileNormalizer` crashes on non-array fields | **P1** | ✅ Resolved |
| 6 | No ESLint / code style enforcement | **P2** | ✅ Resolved |
| 7 | No `.env.example` | **P2** | ✅ Resolved |
| 8 | `artifacts/screenshots/` missing `.gitkeep` | **P2** | ✅ Resolved |
| 9 | Marital status & citizenship hardcoded in CrewInspector | **P2** | ✅ Resolved |
| 10 | Company-split logic duplicated in two adapters | **P2** | ✅ Resolved |
| 11 | No ADR documents | **P2** | ✅ Resolved |
| 12 | Hard-coded `wait(ms)` in adapter action plans | **P2** | ⬜ Open |
| 13 | No architecture diagram (C4 or similar) | **P2** | ⬜ Open |

---

## 3. Resolved Issues

### P0 — Critical (All Resolved)

| ID | Issue | File | Resolution |
|----|-------|------|-----------|
| P0-1 | `JSON.parse` without error handling | `src/cli.ts` | Wrapped in `try/catch`; process exits with helpful error message |
| P0-2 | 3 npm vulnerabilities (handlebars critical, picomatch high, brace-expansion moderate) | `package-lock.json` | Fixed via `npm audit fix`; `npm audit` now reports 0 vulnerabilities |

### P1 — Important (All Resolved)

| ID | Issue | File | Resolution |
|----|-------|------|-----------|
| P1-1 | `profileNormalizer` crashes if `certificates`/`seaService` not arrays | `src/normalizers/profileNormalizer.ts` | `Array.isArray` guards added; defaults to `[]` |
| P1-2 | `ts-jest` TS151002 warnings | `tsconfig.json` | `"isolatedModules": true` added |
| P1-3 | No CI/CD — regressions undetected | — | `.github/workflows/ci.yml` added; runs `npm test`, `npm run lint`, `npm audit` on every push and PR |

### P2 — Desirable (8 of 10 Resolved)

| ID | Issue | File | Resolution |
|----|-------|------|-----------|
| P2-1 | No `.env.example` | — | `.env.example` created with `HEADLESS`, `CV_FILE`, `PHOTO_FILE` |
| P2-2 | `artifacts/screenshots/` empty dir not tracked | `.gitignore` | `.gitkeep` added; `.gitignore` updated with exception |
| P2-3 | Marital status & citizenship hardcoded to `'Married'`/`'Citizen'` | `src/adapters/crewinspector/index.ts` | Now reads `profile.maritalStatus ?? 'Single'` and `profile.citizenship ?? 'Citizen'` |
| P2-4 | Company-split logic duplicated (`company.split('/')[0].trim()`) | Both adapter `index.ts` | Extracted to `src/utils/company.ts` — `splitCompany()` — with unit tests |
| P2-5 | No ESLint configuration | — | `eslint.config.mjs` added with `@typescript-eslint` recommended rules |
| P2-6 | No ADR documents | `docs/adr/` | ADR-001 (adapter pattern), ADR-002 (submission plan), ADR-003 (profile normalization) created |
| P2-7 | `any` type in `engine/runner.ts` catch blocks (4 lint warnings) | `src/engine/runner.ts` | Replaced `catch (err: any)` with `catch (err: unknown)` + `instanceof Error` guard; added typed `getActionId()` helper |
| P2-8 | `engine/runner.ts` fixed `wait(800)` / `wait(5000)` after page load | `src/engine/runner.ts` | Replaced with `runtime.waitForNetworkIdle()` calls |

---

## 4. Remaining Issues

| ID | Issue | File | Priority | Effort | Notes |
|----|-------|------|----------|--------|-------|
| R-1 | Hard-coded `wait(ms)` calls in CrewInspector adapter action plans (`wait(1500)`, `wait(1000)`) | `src/adapters/crewinspector/index.ts` | P2 | Medium | Waits between multi-step form entries; replacement requires `waitForFunction` conditions for each form save confirmation |
| R-2 | No architecture diagram | `docs/` | P2 | Medium | A C4 Level 1/2 or ASCII diagram would help onboarding; ADRs partially fill this gap |

---

## 5. New Issues

| ID | Issue | File | Priority | Notes |
|----|-------|------|----------|-------|
| N-1 | ESLint only covers `src/**` — test files excluded | `eslint.config.mjs`, `package.json` | P2 | ✅ Fixed: ESLint now covers `tests/**/*.ts`; lint script updated to `eslint src tests` |
| N-2 | CI runs `npm audit --audit-level=high`; moderate vulnerabilities silently skipped | `.github/workflows/ci.yml` | P2 | ✅ Fixed: changed to `--audit-level=moderate` |
| N-3 | No profile schema validation at parse time — shape mismatches produce cryptic downstream errors | `src/cli.ts` | P1 | A Zod schema or JSON Schema validator on the raw input would give clear field-level errors |

---

## 6. Updated Recommendations

### P0 — No open P0 issues

All critical issues resolved.

### P1 — One new P1 recommendation

| Rec | Action | File | Rationale |
|-----|--------|------|-----------|
| R-P1-1 | Add Zod (or JSON Schema) profile validation in `cli.ts` before `normalizeProfile` | `src/cli.ts`, new `src/validators/profileSchema.ts` | Currently, a typo in `profile.json` (e.g. `seaService` as an object) surfaces as an obscure runtime error. Schema validation at parse time produces a user-friendly, field-level error message. |

### P2 — Remaining and new recommendations

| Rec | Action | File | Effort |
|-----|--------|------|--------|
| R-P2-1 | Replace `wait(ms)` in CrewInspector adapter with `waitForFunction` conditions | `src/adapters/crewinspector/index.ts` | Medium |
| R-P2-2 | Add a C4 Level 1 architecture diagram to `docs/` | `docs/architecture.md` | Medium |

---

## 2.1 Original Pre-Implementation Executive Summary

### Overall Assessment

CrewCast is a focused, well-structured CLI automation tool. The codebase is small, coherent, and already follows a clear layered architecture. The domain model, engine, adapters, validators, normalizers, and storage are properly separated. Tests exist and pass. Documentation is above-average for a project of this size.

The main risks are operational rather than structural: missing CI/CD, unpatched npm vulnerabilities, insufficient error handling in the CLI entry point, and absence of linting tooling.

### Main Risks

| # | Risk | Severity |
|---|------|----------|
| 1 | 3 npm vulnerabilities (critical/high/moderate) in dev dependencies | **P0** |
| 2 | `JSON.parse` without try/catch in `cli.ts` — process crashes on malformed profile | **P0** |
| 3 | No CI/CD pipeline — regressions can go undetected | **P1** |
| 4 | `ts-jest` TS151002 warnings due to missing `isolatedModules: true` in tsconfig | **P1** |
| 5 | `profileNormalizer` crashes if `certificates`/`seaService` are not arrays | **P1** |
| 6 | No ESLint / code style enforcement | **P2** |
| 7 | No `.env.example` — environment variables undocumented | **P2** |
| 8 | `artifacts/screenshots/` had no `.gitkeep`, breaking empty-dir tracking | **P2** |

### Main Strengths

- Clean layered architecture: `domain → validators → normalizers → adapters → engine → storage`
- Adapter pattern is well-defined: `SiteAdapter` interface with clear contract
- `SubmissionPlan` is a pure data structure — easy to test and serialize
- All site-specific config extracted into `config.ts` / `mappings.ts` — no magic values in business logic
- Good unit test coverage for normalizers, validators, and adapter plan builders
- Integration test for `EngineRunner` in preview mode (no browser needed)
- README is complete with quick-start, CLI usage, profile format, and project structure diagram

---

## 2.2 Detailed Audit

### 1.1 Architecture and Project Structure

**Directory structure:** Logical and consistent.

```
src/
  cli.ts          — entry point, wires everything together
  domain/         — pure types (SeafarerProfile, etc.)
  validators/     — profile validation, returns errors/warnings
  normalizers/    — date + profile normalization
  adapters/       — site-specific form fill logic (SiteAdapter interface + registry)
  engine/         — Playwright execution runner, action types, result types
  runtime/        — BrowserRuntime abstraction over Playwright Page
  storage/        — persists SubmissionResult as JSON
  utils/          — Logger, attachment resolver
```

**Findings:**
- ✅ Clear separation of concerns; each module has a single responsibility
- ✅ `engine/submissionPlan.ts` separates the plan (data) from execution (runner) — good DDD practice
- ✅ `adapters/registry.ts` provides a single lookup point — easy to extend
- ⚠️ No Architecture Decision Records (ADRs)
- ⚠️ No architecture diagram (C4 or similar)
- ℹ️ `src/cli.ts` is both an entry point and orchestration layer — acceptable for this project size

### 1.2 Code Quality

**General:** Code is readable, well-typed, and uses TypeScript strict mode. Variable names are descriptive.

**Findings:**

| File | Finding | Severity |
|------|---------|----------|
| `src/cli.ts:51` | `JSON.parse` without try/catch — crashes on malformed JSON | P0 |
| `src/normalizers/profileNormalizer.ts` | `.map()` on `certificates`/`seaService` without Array guard — crashes if profile JSON omits these fields | P1 |
| `src/adapters/crewinspector/index.ts:44` | Marital status hardcoded to `'Married'` — not read from profile | P2 |
| `src/adapters/crewinspector/index.ts:43` | Citizenship hardcoded to `'Citizen'` — not read from profile | P2 |
| `src/engine/runner.ts:83` | `process.env.HEADLESS !== 'false'` — undocumented env var | P2 |
| `src/utils/logger.ts:28` | Inline `import()` type in `result` method — minor style inconsistency | P2 |
| General | No ESLint configuration — code style not enforced automatically | P2 |

**Anti-patterns:** None critical. Minor: magic string literals in adapter locators (acceptable given they are extracted to `config.ts`).

**Duplication:** Low. Company-name split logic (`company.split('/')[0].trim()`) is duplicated in both Sailinga and CrewInspector adapters — could be a shared utility.

### 1.3 Documentation

| Item | Status |
|------|--------|
| README — overview, quick-start, CLI usage | ✅ Complete |
| README — profile format with examples | ✅ Complete |
| README — project structure | ✅ Present |
| README — adapter extension guide | ✅ Present |
| ADRs | ❌ Missing |
| Architecture diagram | ❌ Missing |
| `.env.example` | ❌ Missing (added) |
| API / type documentation | ⚠️ Types are self-documenting but no JSDoc |

**Semantic coherence:** Documentation accurately reflects the actual implementation. The README lists exactly the two adapters that exist in code. The profile format in README matches `domain/profile.ts`. No stale or misleading content found.

### 1.4 CI/CD and DevOps

| Item | Status |
|------|--------|
| GitHub Actions CI workflow | ❌ Missing (added) |
| Automated tests on PR | ❌ Missing (added via CI) |
| Linter / formatter | ❌ No ESLint, no Prettier |
| Static analysis | ❌ None |
| Containerization | ❌ No Dockerfile (not needed for a CLI tool) |
| Secrets management | ✅ `.env` in `.gitignore`; no hardcoded secrets |
| Dependency audit in CI | ⚠️ Not automated (added to CI workflow) |

### 1.5 Dependency Management

```
dependencies:
  dotenv     ^16.4.5  — OK
  playwright ^1.43.1  — OK (no advisories)

devDependencies:
  @types/jest     ^29.5.12  — OK
  @types/node     ^20.12.7  — OK
  jest            ^29.7.0   — OK
  ts-jest         ^29.1.2   — OK
  tsx             ^4.7.3    — OK
  typescript      ^5.4.5    — OK
```

**Vulnerabilities found (pre-fix):**

| Package | Severity | Advisory |
|---------|----------|----------|
| `brace-expansion <1.1.13` | Moderate | GHSA-f886-m6hf-6m8v — DoS via zero-step sequence |
| `picomatch <=2.3.1` | High | GHSA-c2c7-rcm5-vvqj — ReDoS via extglob; GHSA-3v7f-55p6-f55p |
| `handlebars 4.0.0–4.7.8` | Critical | Multiple JS injection / prototype pollution CVEs |

All three were transitive dev-only dependencies and were resolved via `npm audit fix`.

### 1.6 Performance and Scalability

The system is a serial, sequential form-filler — not designed for high throughput, which is appropriate for its purpose.

**Findings:**

| Area | Finding | Severity |
|------|---------|----------|
| `engine/runner.ts` | Fixed 800ms wait after page load — could be replaced with smarter polling | P2 |
| `engine/runner.ts` | `wait(5000)` after submit is a hard sleep — fragile on slow connections | P2 |
| `engine/runner.ts` | Browser launched fresh for each run — acceptable for a CLI tool | ℹ️ |
| `storage/resultStorage.ts` | Results written synchronously (`fs.writeFileSync`) — acceptable for CLI | ℹ️ |
| `adapters/crewinspector` | Each certificate/sea-service entry triggers separate page actions — inherent to target site | ℹ️ |

No caching or batching is needed given the sequential, single-profile use case.

---

## 2.3 Critical Issues List

### P0 — Critical

| ID | Issue | File | Fix Applied |
|----|-------|------|-------------|
| P0-1 | `JSON.parse` without error handling — unhandled exception on malformed `profile.json` | `src/cli.ts:51` | ✅ Wrapped in try/catch |
| P0-2 | 3 npm dependency vulnerabilities (1 critical, 1 high, 1 moderate) | `package-lock.json` | ✅ Fixed via `npm audit fix` |

### P1 — Important

| ID | Issue | File | Fix Applied |
|----|-------|------|-------------|
| P1-1 | `profileNormalizer` crashes if `certificates` or `seaService` is not an array | `src/normalizers/profileNormalizer.ts` | ✅ Added `Array.isArray` guards |
| P1-2 | `ts-jest` TS151002 warnings: `isolatedModules` not set | `tsconfig.json` | ✅ Added `"isolatedModules": true` |
| P1-3 | No CI/CD pipeline — no automated test execution on push/PR | — | ✅ Added `.github/workflows/ci.yml` |

### P2 — Desirable

| ID | Issue | File | Fix Applied |
|----|-------|------|-------------|
| P2-1 | No `.env.example` — `HEADLESS`, `CV_FILE`, `PHOTO_FILE` undocumented | — | ✅ Created `.env.example` |
| P2-2 | `artifacts/screenshots/` lacked `.gitkeep` — empty dir not tracked | `.gitignore` | ✅ Added `.gitkeep` + gitignore exception |
| P2-3 | Marital status and citizenship hardcoded in CrewInspector adapter | `src/adapters/crewinspector/index.ts` | ⬜ Open — requires profile model extension |
| P2-4 | Company split logic duplicated in Sailinga and CrewInspector adapters | Both adapter `index.ts` | ⬜ Open — low priority |
| P2-5 | No ESLint / Prettier configuration | — | ⬜ Open — recommend adding |
| P2-6 | No ADR documents | `docs/adr/` | ⬜ Open — recommend adding |
| P2-7 | Fixed `wait()` calls in runner are fragile on slow connections | `src/engine/runner.ts` | ⬜ Open — recommend smarter polling |
