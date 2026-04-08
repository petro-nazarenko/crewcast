# ADR-001: Adapter Pattern for Site-Specific Form Submission Logic

**Date:** 2026-04-08  
**Status:** Accepted

## Context

CrewCast must submit a seafarer profile to multiple third-party job sites (Sailinga, CrewInspector, and future ones). Each site has a different form structure, field names, date formats, and submission flow. A naive approach would embed all site logic in a single module, making it difficult to extend or test independently.

## Decision

We adopt the **Adapter pattern** to isolate site-specific form-filling logic.

Each adapter:
- Implements the `SiteAdapter` interface (`src/adapters/types.ts`)
- Receives a normalized `SeafarerProfile` as input
- Produces a `SubmissionPlan` — a pure, serializable data structure describing all form actions

All adapters are registered in a single lookup table (`src/adapters/registry.ts`), giving a single extension point.

## Interface contract

```typescript
interface SiteAdapter {
  readonly siteId: string;
  readonly siteUrl: string;
  buildSubmissionPlan(profile: SeafarerProfile): SubmissionPlan;
}
```

Adding a new site requires:
1. Creating `src/adapters/<siteId>/index.ts` implementing `SiteAdapter`
2. Registering it in `src/adapters/registry.ts`

## Consequences

**Positive:**
- Each adapter is independently testable without a browser (pure function: profile → plan)
- New sites can be added without touching the engine or CLI
- `SubmissionPlan` acts as a seam: it can be serialized, previewed, and validated before execution

**Negative:**
- Boilerplate per adapter (config, mappings, index)
- Site-specific type casting (dates, select option texts) must be handled per adapter
