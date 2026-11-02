# Corrective plan

## Implementation scope and authorization

The user's explicit audit-and-fix request authorizes both phases, including prevention addressing previous misses. Finish phase 1 before changing source/tests/rules/configuration. No dependency, warning ceiling, suppression or runtime business change is planned.

## Prioritized actions

| Action | Findings / impact | Option / affected owners | Status | Authorization / dependencies | Acceptance / outcome |
| --- | --- | --- | --- | --- | --- |
| P-004 | F-004 / MEDIUM-HIGH | fix; existing month formatter owns unavailable-period text; extend existing ESLint check for result fallbacks and immutable aliases | verified | explicit user request; discovered after P-001/P-002/P-003 implementation; next priority | configured bad/good error probes; existing component/formatter behaviors; full lint family reconciliation |
| P-001 | F-001 / MEDIUM | fix; reconcile canonical type files with the actual compiler program; portable sibling and CLI tests | verified | explicit user request; none | omitted contracts exit 2, complete neighbor exits 0; baseline-boundaries.json |
| P-002 | F-002 / MEDIUM | fix; bound call-based exclusions at the nearest call; preserve direct supported exclusions | verified | explicit user request; independent of P-001 | three paired probes, new candidate makes review exit 1, real inventory dispositions inspected |
| P-003 | F-003 / MEDIUM | fix; bind source fingerprint to all analyzed in-source files, document conservative re-review, manually refresh actual ledger after inspection | verified | explicit user request; P-001/P-002 | other-test edits/additions/removals invalidate prior ledger; fresh valid neighbor and relocated checkout pass |

All actions update existing owners with existing sibling tests; no extraction or new application source owner is proposed. Reusable invariant/limits belong in test-mock-data and project-enforcement; application commands and actual decisions stay in the dashboard.

## User decisions

No unresolved choice. Existing architecture choices and 15 keep reasons are not reversed by a new audit request. Review the changed analysis and actual definitions/consumers before metadata renewal. No business code decision comment is needed for these routine tooling corrections.

## Rule and enforcement feedback

Preserve three outcomes: unavailable inputs exit 2; available inventory needing semantic decisions exits 1 in review mode; fresh reviewed inventory exits 0. Inventory-only success remains collection only. Prevent missing matching inputs, overbroad ancestor exemptions and incomplete freshness binding with explicit invalid/valid regression pairs. Keep the normal lint gate unchanged.

## Follow-ups and plan changes

Opaque builders, dynamic computed fields, arbitrary noncanonical contracts, truth of keep reasons and inputs outside the selected source remain semantic limits. No universal ownership inference is proposed. Further unrelated hardening is outside these actions.

Phase-2 plan delta: fresh reading of WealthComparisonKpi for an existing fixture decision exposed F-004 in unchanged baseline source. The original phase-1 diagnosis/metrics remain preserved. Add P-004 and an amended baseline metric snapshot before its application correction. It extends the existing formatter rule without inventing a new fallback preference. Revisit only this contradicted requirement/consumer family; all other supported choices remain retained.

Documentation compilation also exposed the pre-existing generic word `tsconfig` rejected by the catalog's portability guard. Replace it with equivalent project-configuration wording while updating the planned documentation, then regenerate/check AGENTS.md. No portability guard is relaxed. A future CI catalog-compilation step is a separate optional proposal.

P-001 validation delta: relocated project executed from a directory without dashboard dependencies exposed ambient-type resolution against the invoking cwd. Pass the selected project filename into the existing compiler parser, test a project-local ambient library from an unrelated cwd, and rerun the actual relocated gate. Preserve the failed result before rerunning. Compiler-options and collector fingerprints change; retain semantic decisions only after comparing current inputs again. This is within the input-availability/root-options action, not a new application defect.

## Verified outcomes

All four actions are verified. P-001 rejects omitted contracts and resolves ambient types from the selected project, including an actual copied checkout invoked from repository cwd. P-002 retains wrapped business inputs while preserving direct valid exclusions. P-003 binds the ledger to all analyzed in-source inputs; all 15 existing decisions were inspected and retained. P-004 moves the month fallback to its existing formatter and adds a configured ESLint error for direct/immutable-result fallbacks. See verification.md I-001 through I-008 and final-tests-checks.json. No user decision, confirmed violation or authorized action remains open.
