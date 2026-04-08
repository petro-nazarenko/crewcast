# CrewCast — Roadmap After Improvements

> **Updated:** 2026-04-08  
> **Based on:** Post-implementation audit following the initial audit cycle

---

## Summary

The first implementation cycle addressed all P0 and P1 issues plus several P2 items. The second cycle closed the remaining Phase 2 items, added Zod schema validation (Phase 3), and introduced a Telegram bot interface and Railway deployment. The system is production-ready at both the CLI and bot level.

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

## Phase 2 — Quality & Maintainability (DONE ✅)

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
| 2.8 | Replace hard-coded `wait(ms)` in adapters with `waitForFunction` | P2 | Medium | Medium | ⭐⭐⭐ | — | ✅ Done |
| 2.9 | Add architecture diagram (C4 Level 1/2) to `docs/` | P2 | Medium | Low | ⭐⭐ | — | ✅ Done |

All Phase 2 tasks are **complete**.

---

## Phase 3 — Extensibility & Coverage (IN PROGRESS 🔄)

**Goal:** Make the platform easier to extend and more robust in production.

| ID | Task | Priority | Complexity | Impact | ROI | Depends On | Status |
|----|------|----------|------------|--------|-----|-----------|--------|
| 3.1 | Lint test files (extend ESLint to `tests/**`) | P2 | Low | Low | ⭐⭐⭐ | 2.5 | ✅ Done |
| 3.2 | Add JSDoc to public API types and functions | P2 | Low | Medium | ⭐⭐⭐ | — | ⬜ Open |
| 3.3 | Add a third adapter (e.g. MarineJobs, Martide) | P1 | High | High | ⭐⭐⭐⭐⭐ | 1.5 | ⬜ Open |
| 3.4 | Validate that `preferredRank` is a known rank value | P2 | Low | Medium | ⭐⭐⭐ | — | ⬜ Open |
| 3.5 | Add retry logic to `EngineRunner` for transient failures | P2 | Medium | Medium | ⭐⭐⭐ | Phase 1 | ⬜ Open |
| 3.6 | Structured JSON logging mode (for CI log parsers) | P2 | Medium | Low | ⭐⭐ | — | ⬜ Open |
| 3.7 | Profile schema validation (Zod) | P1 | Medium | High | ⭐⭐⭐⭐ | — | ✅ Done |

### Highest-ROI items remaining in Phase 3

- **3.3** — Each new adapter directly multiplies the tool's value for end users.
- **3.5** — Retry logic reduces manual reruns on transient network failures.

---

## Phase 4 — Telegram Bot Interface (IN PROGRESS 🔄)

**Goal:** Allow seafarers to interact with CrewCast via a Telegram bot without installing anything locally.

| ID | Task | Priority | Complexity | Impact | ROI | Depends On | Status |
|----|------|----------|------------|--------|-----|-----------|--------|
| 4.1 | Create `src/bot/telegram.ts` with grammy — `/start`, `/help`, `/sites`, `/preview <siteId>` commands | P1 | Medium | High | ⭐⭐⭐⭐⭐ | 3.7 | ✅ Done |
| 4.2 | Accept `profile.json` upload, run preview, return plan summary | P1 | Medium | High | ⭐⭐⭐⭐⭐ | 4.1 | ✅ Done |
| 4.3 | Accept CV and photo file uploads via Telegram for full submission | P2 | High | High | ⭐⭐⭐⭐ | 4.1, 3.3 | ⬜ Open |
| 4.4 | `/submit <siteId>` command — full browser submission via bot | P2 | High | High | ⭐⭐⭐⭐ | 4.3 | ⬜ Open |
| 4.5 | Job queue / async submission with progress updates | P2 | High | Medium | ⭐⭐⭐ | 4.4 | ⬜ Open |
| 4.6 | Multi-user support with per-user profile storage | P3 | High | High | ⭐⭐⭐ | 4.2 | ⬜ Open |

### Notes

- The bot runs in **preview mode** by default (no browser needed on server).
- Full submission (4.4) requires a server with Playwright and Chromium installed.
- `TELEGRAM_BOT_TOKEN` must be set in the environment (see `.env.example`).

---

## Phase 5 — Railway Deployment (IN PROGRESS 🔄)

**Goal:** Deploy the Telegram bot to Railway for 24/7 availability without local infrastructure.

| ID | Task | Priority | Complexity | Impact | ROI | Depends On | Status |
|----|------|----------|------------|--------|-----|-----------|--------|
| 5.1 | Add `railway.toml` with nixpacks build and bot start command | P1 | Low | High | ⭐⭐⭐⭐⭐ | 4.1 | ✅ Done |
| 5.2 | Set `TELEGRAM_BOT_TOKEN` secret in Railway project settings | P1 | Low | High | ⭐⭐⭐⭐⭐ | 5.1 | ⬜ Ops task |
| 5.3 | Add health-check endpoint (HTTP ping) for Railway uptime monitoring | P2 | Low | Medium | ⭐⭐⭐ | 5.1 | ⬜ Open |
| 5.4 | Add Playwright/Chromium to nixpacks build for full submissions | P2 | Medium | High | ⭐⭐⭐⭐ | 4.4 | ⬜ Open |
| 5.5 | Configure Railway volume for `artifacts/` persistence | P2 | Low | Medium | ⭐⭐⭐ | 5.1 | ⬜ Open |
| 5.6 | Add deploy preview environments per branch | P3 | Medium | Low | ⭐⭐ | 5.1 | ⬜ Open |

### Railway Quick-Start

1. Push repository to GitHub
2. Connect project at [railway.app](https://railway.app)
3. Set `TELEGRAM_BOT_TOKEN` in Railway → Project → Variables
4. Railway auto-detects `railway.toml` and deploys the bot

---

## Dependency Graph

```
Phase 1 (Safety)
  ├── 1.1 JSON.parse safety
  ├── 1.2 npm audit fix
  ├── 1.3 Array.isArray guards
  ├── 1.4 isolatedModules
  └── 1.5 CI/CD  ──────────────────────────┐
                                           │
Phase 2 (Quality)                          │
  ├── 2.1 .env.example                     │
  ├── 2.3 splitCompany util                │
  ├── 2.4 profile fields in adapter        │
  ├── 2.5 ESLint ─────► 2.7 fix any        │
  ├── 2.6 ADRs                             │
  ├── 2.8 waitForFunction in adapters      │
  └── 2.9 Architecture diagram             │
                                           ▼
Phase 3 (Extensibility)            CI runs on all PRs
  ├── 3.1 Lint tests (needs 2.5)
  ├── 3.3 New adapters
  ├── 3.5 Retry logic (needs Phase 1)
  └── 3.7 Zod schema validation ──────────────────┐
                                                   │
Phase 4 (Telegram Bot)                             │
  ├── 4.1 Bot core (needs 3.7) ◄──────────────────┘
  ├── 4.2 Preview flow (needs 4.1)
  ├── 4.3 File uploads (needs 4.1, 3.3)
  └── 4.4 Full submission (needs 4.3)
                  │
Phase 5 (Railway) │
  ├── 5.1 railway.toml (needs 4.1) ◄────────────────
  ├── 5.2 Set secrets (ops)
  ├── 5.3 Health check
  └── 5.4 Playwright in nixpacks (needs 4.4)
```

---

## ROI Summary

| Rank | Task | Why |
|------|------|-----|
| 1 | CI/CD (1.5) | Every future change is automatically validated |
| 2 | JSON.parse safety (1.1) | Eliminates silent crash on user input error |
| 3 | Array.isArray guards (1.3) | Prevents runtime crash on incomplete profiles |
| 4 | npm vulnerabilities (1.2) | Eliminates critical/high CVEs |
| 5 | Telegram bot core (4.1, 4.2) | Zero-install user interface; broadens reach |
| 6 | Railway deployment (5.1) | 24/7 bot availability without local infra |
| 7 | New adapter (3.3) | Direct product value for users |
| 8 | Zod schema (3.7) | Better DX; catches profile errors at parse time |
| 9 | Profile fields in adapter (2.4) | Removes hardcoded data; correctness improvement |
| 10 | splitCompany util (2.3) | DRY; single fix point |
| 11 | waitForFunction in adapters (2.8) | Resilience on slow connections |
| 12 | ESLint (2.5) | Prevents future type/style regressions |

