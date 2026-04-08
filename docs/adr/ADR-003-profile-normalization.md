# ADR-003: Profile Normalization Before Execution

**Date:** 2026-04-08  
**Status:** Accepted

## Context

Profile data arrives from a user-supplied JSON file. Dates may be in various formats (`YYYY-MM-DD`, `DD.MM.YYYY`, `DD/MM/YYYY`). Some fields may be missing or typed as `null` instead of an empty array. If adapters receive raw, un-normalized data, each adapter must implement its own defensive checks and date parsing, leading to duplication and potential inconsistencies.

## Decision

A dedicated `normalizeProfile` function (`src/normalizers/profileNormalizer.ts`) is applied to the raw JSON immediately after parsing, before it reaches any adapter.

Normalization responsibilities:
- Convert all date fields to canonical ISO format (`YYYY-MM-DD`) using `normalizeDate`
- Guard `certificates` and `seaService` against non-array values (`Array.isArray` check — defaults to `[]`)
- Merge resolved attachment paths (cv, photo) into the profile

After normalization, all downstream code (adapters, validators, engine) can assume:
- All dates are ISO strings or `null`/`undefined`
- `profile.certificates` and `profile.seaService` are always arrays

## Consequences

**Positive:**
- Adapters contain zero date-parsing logic — they receive clean data
- Validation and tests operate on a stable, predictable structure
- A single fix in the normalizer propagates to all adapters

**Negative:**
- Normalization errors (e.g., an unparseable date) surface at startup before any site is contacted — this is intentional and desirable
- The normalizer must be updated when new date fields are added to the profile model
