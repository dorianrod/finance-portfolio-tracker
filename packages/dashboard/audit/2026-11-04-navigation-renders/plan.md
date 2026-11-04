# Audit plan

## Implementation scope and authorization

Phase 1 is complete. The subsequent user request “ok regarde ca”, following the two reported optimization opportunities, authorizes implementing P-001/P-002. Phase 2 is complete; preserve all staged prior work and keep the baseline evidence intact.

## Prioritized actions

| ID    | Finding / impact      | Action                   | Dependencies / scope                                                                                           | Acceptance                                                                              |
| ----- | --------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| P-001 | F-001; related MEDIUM | implemented and verified | Measure shell-only cost before adding memo boundaries; preserve stable page children and actual subscriptions. | Fewer unchanged wrapper/header invocations without stale filter/source state.           |
| P-002 | F-002; related MEDIUM | implemented and verified | Trace duplicate reliability consumer; preserve existing source ownership.                                      | Remove unnecessary unchanged-input position rebuilding, retain accurate quality scopes. |

Both remain performance suggestions, not proven catalog violations. The authorized implementation is limited to two stable memo boundaries and eliminating the duplicate reliability consumer.

## User decisions

Initial request: verify rendering propagation. Subsequent request authorizes acting on the two observed opportunities. No additional decision is required. P-001 memoizes DashboardPanel by its actual active/children props and DashboardHeader by its actual theme/translation subscriptions. P-002 composes CombinedAnalysisReliabilityKpi directly from the existing DashboardReliability model and removes its single-consumer duplicate wrapper.

## Rule and enforcement feedback

No new ESLint, TypeScript, detector or warning-budget change is justified. Render counts and memo lifetimes are semantic/runtime concerns. Use narrow regression checks if either optional optimization is implemented.

## Follow-ups and plan changes

The three-file supporting scope delta is recorded in inputs and coverage. The original inventory is preserved. Implementation adds header behavior coverage, reliability/navigation/source-invalidation coverage and repeats the exact fourteen-transition runtime matrix. Build, focused tests, lint, fixture ownership, colocation and import-cycle checks apply. Existing page retention and error recovery remain acceptance requirements. No global cache, custom memo comparator, catalog rule or suppression is planned.

## Implementation completion

P-001 memoizes only the measured stable header/panel boundaries; the header keeps theme/language subscriptions. P-002 deletes the duplicate reliability consumer. Exact unchanged-input render counts and behavior checks are retained in evidence/implementation-review.md. No pending implementation action or decision remains. Baseline reports and metrics are preserved; final inputs/results are added separately.
