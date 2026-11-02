# Corrective plan

## Implementation scope and authorization

The user's “audit et fixe dans la foulée” authorizes phase 1 and implementation of all proven in-scope violations. Phase 1 is complete before any application source edits. The only proven family is F-001. No user choice is pending. No commit/push/release requested.

## Prioritized actions

| Action | Findings/priority  | Proposed correction and files                                                                                                                                                                           | Status   | Authorization/dependencies                       | Acceptance/outcome                                                                                                                                                                                 |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-001  | F-001; MEDIUM-HIGH | Add allocation-owned `helpers/formatters/useFormatAllocationDimension.ts` plus sibling test; replace `FilterChipBar.DIM_LABELS` with its hook.                                                          | verified | Explicit audit-and-fix request; no dependencies. | Exhaustive short labels, nullable/fallback/provider behavior; focused lint/tests/typecheck then full gates. Implemented; full lint/typecheck, regression, test and build evidence in verification. |
| P-002  | F-001; MEDIUM-HIGH | Extend `useFormatDataQualityDimension` with closed `style: title/lowercase`, retain default; migrate `AllocationDimensionRowView`; extend sibling tests.                                                | verified | Same request; independent of P-001.              | Preserve title-case row and lower-case existing consumers, provider and fallback tests. Implemented; full lint/typecheck, regression, test and build evidence in verification.                     |
| P-003  | F-001; MEDIUM-HIGH | Add assessment-owned `useFormatAnalysisReliabilityTone` plus sibling test; remove text from `RELIABILITY_TONES`; update all four consumers.                                                             | verified | Same request; independent of P-001/P-002.        | Existing words remain, visual fields unchanged, no remaining `.label` tone access; full checks. Implemented; full lint/typecheck, regression, test and build evidence in verification.             |
| P-004  | F-001 closure      | Review actual additions/callers, run colocation against baseline; collect fixture inventory, review changed inputs/current candidates before updating ledger; run required gates and add final metrics. | verified | P-001–P-003.                                     | Colocation has no pending owners; fixture ledger fresh with actual reasons; all required gates pass. Implemented; full lint/typecheck, regression, test and build evidence in verification.        |

## User decisions

None pending. No rule ambiguity or materially different unsettled business choice was established. Existing ten code-local decisions remain supported.

## Rule and enforcement feedback

Use existing typed formatter/helper enforcement and exhaustive TypeScript records, with nominal/missing/provider regression tests. No new ESLint detector or policy is proposed: distinguishing entity label conversion from static UI configuration is semantic. The local preset already rejects malformed new formatter signatures and global i18n dependencies. No warning ceiling increase, new ignore, rule weakening or suppression is authorized by this plan.

## Follow-ups and plan changes

P-004 delta: added a real allocation-chip/provider/clear-action regression and a reliability-view provider regression. The new explicit atom seed adds one fixture-review candidate (16 total); the application inventory integration test expected snapshot is updated accordingly after inspecting definitions/consumers. See [fixture delta](evidence/fixture-review-delta.md). Implementation deltas must be appended, preserving this baseline plan. Broader performance tuning and alternative folder structures are outside required corrections because no violation was established.

Historical P-004 checkpoint: source/caller/introduced-contract review, fixture gate, cycle graph, both builds and all test cases pass. A normal-script test retry and final formatting gate remain in progress; no source or check policy changes are pending.

Final P-004 outcome: all required gates passed, including the unchanged normal test command (2368 application + 756 generic tests), full Prettier, typecheck, lint (143 existing warnings), both builds, catalog, fixture ownership (16 explicit reviewed candidates), cycles and colocation (0 missing/0 pending). The closed title-style API rejects unsupported input with TS2322 in the isolated actual-project type probe. New owners have meaningful sibling tests; provider regressions pass and the chip regression fails on the original source. No source/configuration drift, pending action, user decision or required follow-up remains. Earlier checkpoints above are historical. No additional ESLint detector was needed; existing formatter/helper checks and closed types protect the new APIs, with 22 added behavioral cases.

Closure input delta: externally changed audit-workflow documents add history/prior-dossier review. Completed that review for all changed/extracted owners and the three newest prior dossiers, linking exact commits and supported choices in coverage/findings. Existing correction verdicts stand; no additional source action, permission, code decision update or test rerun is needed because executable/source/config/rule inputs did not change. Concurrent workflow files are preserved outside the audit-authored application delta.
