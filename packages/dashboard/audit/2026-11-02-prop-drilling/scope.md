# Audit scope

## Request and phase status

2026-11-02: review and correct all 29 local/no-prop-drilling suppressions. User selects avoiding exceptions and requires approval before retaining any. Also strengthen the reusable exception-comment policy. audit: complete; implementation: complete.

## Frozen inputs

Starting revision: 1ae15d1b6ebc6b420b18c3c11967cb41cd172576. Initially clean worktree. [Frozen source hashes](evidence/baseline-files.json), [29 original directives](evidence/suppression-review.json). Normal baseline from preceding measurement: 1,364 linted files, 0 errors, 143 warnings (142 suppression trackers, one unproven-sharing warning); warning ceiling 143. Shared preset and package lock remain unchanged. [Lifted diagnostics](evidence/baseline-lifted-review.json) use actual configuration and keep line positions.

## File inventory and exclusions

Closed starting inventory: all files in the source hash manifest. Direct receivers and their callers are inspected as dependencies; additions/removals are recorded in final coverage. Generated output, dependencies and unrelated suppressed rules excluded from technical revalidation. Other suppressions retain their dates and reasons.

## Rule inventory

Focused primary contracts: arch-no-prop-drilling (CRITICAL), quality-eslint-disable-scoped (HIGH). Correction constraints: component roles/module boundaries, scoped state ownership, direct compound slots, caller behavior and source colocation. This is not a full React audit.

## Required checks and completion criteria

Reproduce each lifted diagnostic; remove all avoidable suppressions without lowering checks. Run full lint, TypeScript, application and skill tests, relevant formatting, skill build/validation, architecture and colocation inventory. Review affected component roles and raw inputs independently of lint. Any proposed exception remains awaiting user approval.

## Checkpoint

Phase 1 diagnosis/plan complete; proceed with authorized corrections. No exception proposed. Final metrics, introduced owners and checks remain pending implementation.

## Implementation delta

All 29 directives removed; per-location outcomes are retained in [suppression review](evidence/suppression-review.json). The initial row-composition proposal was refined after applying ui-delegate-mapped-jsx: account type groups consume selection and labels themselves, prepare display rows, and render a shared view. Filter subscriptions return raw inputs through useFilterScopeContext; badge formatting remains in FilterScopePresentation.view, preserving arch-no-visual-logic-below-page. AllocationPositionsToggle owns its own visibility/state writes and keeps chart hooks below the existing limit. getTrailingThreeYearIrr is a pure tested selector shared by the two receiving features. No detector/severity/ignore change and no exception added. Budget reduced from 143 to 114. Final full checks pass; implementation phase complete.

## Final checkpoint

Audit complete; implementation complete. All 29 suppressions removed, zero prop-drilling diagnostics, zero retained/proposed exceptions, no user decision pending. Final lint: 1,376 files, 0 errors, 114 warnings with ceiling 114. All 2,413 application/integration and 756 skill tests pass; build, skill validation, formatting, 24-candidate fixture review and new-owner colocation pass. No detector/configuration bypass introduced. [Results](results.md), [verification](verification.md), [per-location ledger](evidence/suppression-review.json).
