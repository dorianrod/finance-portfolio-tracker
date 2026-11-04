# Audit scope

## Request and phase status

2026-11-04, Europe/Paris. Focused verification: does switching dashboard tabs re-render the entire React tree? audit: complete. implementation: complete. Subsequent “ok regarde ca” authorizes the existing P-001/P-002 suggestions. Phase-1 inputs remain frozen; phase 2 changes only the authorized shell/model boundaries and their tests. Configuration and rules remain unchanged.

## Frozen inputs

Starting revision `ea6cd3f` with the existing uncommitted navigation-retention and viewport-chart implementation. The exact 17-file source inventory, configuration/rule fingerprints and starting working tree are retained in [inputs](evidence/source-manifest.json). Warning budget: one existing warning; suppression revalidation is excluded.

## File inventory and exclusions

Closed semantic inventory: the 17 source/test files in the manifest. Runtime counters additionally observe loaded application component/hook bodies and selected expensive builders; this is execution evidence, not a semantic audit of every instrumented module. Excluded: whole-catalog compliance, backend/network implementation, third-party component internals, personal data, styling and general typing/search/filter latency. A documented three-file supporting delta in the input manifest traces the reliability/position-model finding; the original inventory remains intact. Runtime verification covers warm Overview, Wealth, Performance, Diversification and Holdings plus both holdings subviews. Data quality is outside this interaction matrix.

## Rule inventory

`ui-vercel-responsive-rendering` (MEDIUM), limited to memoized subtree boundaries, expensive synchronous calculations, and the external-store scheduling caveat during navigation. Controlled-input deferral obligations are outside this navigation-only scope. There is no dedicated semantic lint detector for this claim.

## Required checks and completion criteria

Review prop identity, store subscriptions, retained Activity lifecycle, existing tests and relevant Git/audit history. Run transient Vite source instrumentation in Chromium over two repeated warm navigation cycles and existing retention tests. Retain exact counts, bounded conclusions and any actionable suggestions. Verify source hashes remain unchanged. No timing claim will be made from instrumented development code.

## Checkpoint

The following paragraph preserves the phase-1 checkpoint.

Phase 1 complete. All 17 original files reviewed; three supporting files explicitly added to trace the measured reliability remount. Fourteen transitions and four existing retention tests pass. No source correction authorized or applied; two optional suggestions remain.

## Implementation input delta and checkpoint

The subsequent request authorizes both suggestions. Phase 2 is complete: DashboardPanel and DashboardHeader memo boundaries, direct reliability composition and removal of its duplicate consumer, plus two colocated behavior tests. Exact new/changed/deleted owners and hashes: evidence/implementation-source-manifest.json. Additional constraints and configuration: evidence/implementation-contracts-and-config.json. Acceptance checks: nineteen focused tests, fixture integration, build, global lint, colocation, cycles, unchanged page counts and the fourteen-transition no-reload matrix all pass. No pending work remains in P-001/P-002.
