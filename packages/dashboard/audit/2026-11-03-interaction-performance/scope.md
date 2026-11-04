# Audit scope

## Request and phase status

2026-11-03, Europe/Paris. Investigate latency when expanding underlying holdings and switching dashboard tabs. Focused performance diagnosis in `packages/dashboard`.

audit: complete. implementation: complete. Subsequent user “implémente” authorizes P-001–P-003. The original phase-1 baseline is preserved; phase 2 implements the accepted plan.

## Frozen inputs

Starting revision: `cb107d088dda865c4c5dddaba46112789d0ca8ab`; initial worktree clean. Exact source inventory and hashes: [manifest](evidence/source-manifest.json). Rule/configuration hashes, installed versions and warning ceiling: [contracts](evidence/contracts-and-config.json). Baseline warning ceiling: 1; no configuration changes.

Local datasets are excluded from version control. They contain 7,528 current fund holdings, 145,248 historical rows and 3,234 distinct non-ISIN issuer identifiers. Reports retain aggregate measurements only, without account names, amounts or holdings identifiers.

## File inventory and exclusions

Closed inventory: 34 production files and five existing tests in the source manifest. It covers app navigation/mounting, the exposure model and virtualized list, issuer aggregation, position scope, quality consumers, overview comparisons and historical concentration. Other imports were traced only to establish input and rendering contracts.

Exclude backend implementation, personal data, generated output, dependency code, unrelated UI/style conventions and a whole-application React audit. Existing lint ignores are not technically revalidated. Shared UI primitives were traced for element roles and list structure; no shared UI implementation review or styling change is proposed.

## Rule inventory

Selected contracts: `ui-vercel-lazy-loading` (HIGH), `ui-vercel-offscreen-content` (MEDIUM-HIGH), `ui-vercel-responsive-rendering` (MEDIUM), `helpers-vercel-indexed-lookups` (MEDIUM). See coverage for applicability and limits. Performance opportunities are suggestions, not invented catalog violations.

## Required checks and completion criteria

From the dashboard root: production build, the five targeted existing test files, Chromium CPU sampling on development code, repeated production interactions without CPU profiling, an isolated prefix-index equivalence/timing probe, packaged audit metrics, formatting of dossier Markdown and final source-diff/hash verification. The selected performance rules have no dedicated packaged semantic detector; runtime profiling and source/caller analysis provide that evidence. Full lint and unrelated audit scripts are not required for this source-unchanged diagnosis.

Complete phase 1 when the declared files/rules have dispositions, measured and inferred costs are distinguished, and a concrete ordered plan exists. Proposed implementation requires separate acceptance evidence after changes.

## Checkpoint

The following paragraph preserves the phase-1 checkpoint.

Diagnosis complete; no pending inspection or required user arbitration. Three proposed performance actions. Source, tests, skills, configuration and warning ceilings unchanged. Findings are limited to measured interactions; other tab combinations and devices may behave differently.

## Implementation input delta and final checkpoint

User “implémente” authorized the three proposed actions. Phase 2 is complete; [implementation manifest](evidence/implementation-source-manifest.json) freezes the 22 changed/introduced source/test/fixture files plus the fixture review ledger. The original 39-file baseline is preserved. Five new runtime helpers and seven new sibling tests were introduced, alongside one owning fixture; all callers and shared full-series behavior were re-reviewed.

Additional rule contracts triggered by extraction/testing are frozen in [implementation contracts](evidence/implementation-contracts-and-config.json), with their separate coverage below. Required phase-2 checks: build/typecheck, full lint, application tests with the stale fixture-gate failure resolved by targeted rerun, packaged skill tests, fixture ownership gate, introduced-owner colocation, cycles, complete local output equivalence, formatting and production measurements. All are satisfied; no source/config/rule change remains unverified.
