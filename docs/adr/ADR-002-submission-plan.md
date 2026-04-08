# ADR-002: SubmissionPlan as Pure Data Structure

**Date:** 2026-04-08  
**Status:** Accepted

## Context

Browser automation with Playwright requires executing a sequence of form interactions: filling fields, selecting options, clicking buttons, uploading files, and waiting for conditions. If this logic were embedded directly in the adapter, adapters would require a running browser to be tested, and the execution engine would need to know about site-specific concerns.

## Decision

The submission logic is split into two responsibilities:

1. **Plan building** (`SiteAdapter.buildSubmissionPlan`) — pure, synchronous, no I/O.  
   Produces a `SubmissionPlan`: a plain data structure listing all `SubmissionAction` items in order.

2. **Plan execution** (`EngineRunner.run`) — stateful, async, browser-driven.  
   Iterates over the plan's actions and delegates to `BrowserRuntime`.

```
SeafarerProfile → [Adapter] → SubmissionPlan → [EngineRunner] → SubmissionResult
```

## Action types

```typescript
type SubmissionAction =
  | { type: 'jsFill';          name: string; value: string }
  | { type: 'jsSelect';        name: string; text: string }
  | { type: 'jsCheck';         name: string; checked: boolean }
  | { type: 'click';           locator: string }
  | { type: 'upload';          locator: string; path: string }
  | { type: 'wait';            ms: number }
  | { type: 'waitForFunction'; expression: string; timeout?: number };
```

## Consequences

**Positive:**
- Adapters are fully unit-testable without Playwright or a browser
- The plan can be serialized to JSON and printed in `--preview` mode for debugging
- The engine can be replaced (e.g., with a different browser library) without touching adapters
- Each action has a deterministic, inspectable result

**Negative:**
- Complex conditional flows (e.g., "click A only if B is present") must be encoded as `waitForFunction` + conditional `click` sequences, which can be verbose
- The plan is static: it cannot react to unexpected page states mid-execution (errors are caught at the action level)
