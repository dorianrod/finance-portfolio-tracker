# Audit scope

## Request and phase status

Focused audit and correction of every `local/review-shared-feature-sharing` diagnostic, including existing suppressions. User authorizes conforming fixes and requires approval before any exception. Audit: complete. Implementation: complete.

## Frozen inputs

Revision `2be1ba2`; initial worktree clean. Baseline: 0 errors, 63 warnings, 1 active sharing warning, 60 suppressed sharing warnings. Warning ceiling 63. Exact file hashes and diagnostics: [baseline](evidence/baseline-files.json), [diagnostics](evidence/baseline-diagnostics.json). Toolchain and configured rules are locked by package-lock.json and eslint.config.js; the installed catalog is the local skill.

## File inventory and exclusions

Closed starting inventory: the 61 files in baseline-files.json and their production consumers, especially app/services/useDashboardViewModel.ts, application routing/composition, overview, wealth, performance, holdings, scope selection, quality assessment/errors and diversification allocation/concentration. Tests are verification consumers, not sharing evidence. Generated/vendor files excluded. Only suppressions of the requested sharing rule receive technical revalidation.

## Rule inventory

Primary: arch-shared-no-domain-knowledge (CRITICAL), arch-no-prop-drilling (CRITICAL), quality-eslint-disable-scoped (HIGH). Correction constraints: preserve component roles, domain boundaries, API result contracts, React Query source ownership, independent Suspense requests and persistent loading/error shell. Inspect newly introduced owners and their callers.

## Required checks and completion criteria

Full lint, typecheck, application tests, relevant generic lint regressions, formatting, cycles, fixture ownership and colocation inventory. No sharing diagnostics or suppressions; actual multiple capability consumers for shared modules; no fabricated graph edges or server state in atoms. Record any remaining exception for approval before accepting it.

## Checkpoint

Phase 1 completed before source edits. Findings/plan cover every baseline diagnostic by its consumer family. Phase 2 proceeds under the explicit fix request.

## Implementation input delta

Deleted obsolete shell distribution types/helper and unused cash-source chain. Added owning model/entrypoint services and canonical source options, moved exclusive helpers to their actual capabilities, and moved unchanged shared filter/view state to common owners. Frozen final authored source inventory/hashes and the diagnostic reconciliation supplement the original inventory; they do not replace it. No executable catalog or ESLint rule changed. Existing source contract protections remain enabled; warning ceiling decreases to one.

## Final checkpoint

Audit and implementation are complete. All 61 baseline candidates have a final disposition. No unresolved inspection, violation, user choice or proposed sharing exception remains. The 42 retained shared modules have proven multiple capability consumers; eight exclusive modules moved, four dead cash-source modules were removed and seven source wrappers were replaced. The unchanged TanStack Table exception remains outside technical revalidation.
