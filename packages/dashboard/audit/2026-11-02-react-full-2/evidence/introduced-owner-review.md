# Introduced and moved owner review

Original source manifest and baseline obligations are preserved. The current
phase-2 delta adds 25 paths, modifies 15 and removes eight; eight additions are
reviewed moves (seven runtime owners and one sibling test), leaving 17 genuinely
new authored modules: six runtime owners, nine tests, one derived type and one
fixture. Source manifest has 1,386 entries including the original recorded cache
metadata; the 79 historical formatting targets remain a separate supplement.

## New independent runtime contracts

| Owner                               | Responsibility and applicable obligations                                                                                                                                                                          | Behavior evidence                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EvolutionChart.feature.tsx          | Feature prepares chart-owned reporting data via useMemo and a pure transformer; required children and public source API preserved. Prepared point type prevents view orchestration.                                | Feature sibling exercises keyboard tooltip, signed loss attribution, scale switching and empty history.                                                         |
| buildPortfolioCompositionHistory.ts | Pure transformer consumes canonical readonly history, preserves Date/source data, returns explicit prepared point contract. No transport coercion, state or display text.                                          | Sibling covers source immutability, the established cost-plus-gain denominator and empty input.                                                                 |
| countPipelineIssues.ts              | Data-quality shared source statistic for assessment/errors/reliability; closed canonical severity union, one public helper, immutable input. No application-wide domain leak. Code decision records scope.         | Sibling covers zero, each severity and mixed/repeated issues; controller tests preserve global badges through filtering/sorting.                                |
| computeLookThroughMetrics.ts        | Coverage-component transformer owns selected-scope amounts, confidence cap and percentages/diagnostics; visual tones remain in presenter. Canonical FundCoverageReport input.                                      | Sibling covers selected rather than global denominator, confidence cap, empty and fully not-applicable exposure, frozen input. Presenter sibling retains tones. |
| computeOverviewGrossChanges.ts      | Overview-driver component transformer derives independent gross changes from canonical compared metrics. Missing periods stay independent.                                                                         | Sibling covers complete, missing-current, missing-previous, negative and zero movements.                                                                        |
| withConcentrationChanges.ts         | Concentration component transformer preserves snapshot order and canonical fields; four adjacent threshold changes retain absent/unreachable semantics. Explicit local result contract keeps its absence comments. | Sibling covers first snapshot, unavailable current/previous thresholds, positive/negative change, immutable input and empty history.                            |

All six have same-base sibling tests. No query/mutation/auth/form/store/effect or
new shared UI contract is introduced, so earlier capability-dependent N/A reasons
remain valid. Actual local source-role, helper/import, public-export, sorting,
type and fixture checks apply to the additions. Financial amounts remain numbers
and source dates remain Date; this adds no API validation/coercion barrier.

## Moved and retained contracts

The eight content-fingerprinted mappings in phase2-provenance-review.json account
for every removed path. The original composition calculator is unchanged and
moved to transformers; it gains nominal/missing/negative/zero sibling coverage.
ErrorsTabController changes role while preserving its public errors-to-UI API,
existing four test cases and local visual state; source counts are explicitly
prepared before the localized adapter. Coverage/overview modules move with
private helpers to satisfy the actual import boundary rather than widening it.
Presentation and output contracts remain the same. Original decisions, confidence
policy, null semantics and historical suppression dates remain intact.

Additional caller history checked: OverviewTab and LookThroughQualityContent
(e271d108), coverage view (21e8a46) and fixture ledger (444f8b4); staged/unstaged
changes were reviewed with the coordinated imports. No conflicting decision or
new requirement was found. Tests and external callers use the new owner paths;
no old import reference remains in source/tests.

## New type, fixture and test obligations

PortfolioCompositionPoint is a narrow component-owned derived contract: Date
from the existing history entity plus the composition helper's inferred numeric
result. It does not copy the source entity or acquire server state. Its mock
factory is annotated, deterministic and component-owned; tests use existing
portfolio/report/concentration/pipeline/metric factories for source data. No
assertion casts or clock/random sample defaults were added.

Nine new suites plus strengthened existing suites exercise behavior and edge
paths. The required real-project compiler case rejects a complete raw history
entity and accepts a prepared point. The tooltip regression uses prepared data
with no raw monetary fields; replay against the original tooltip produces Total
0 instead of 100 and fails exactly that assertion (one failed/four passed),
while the corrected five cases pass. The temporary probe was removed before
full-suite collection. Raw failed reproduction is local evidence, not a product
regression claim against the former raw-input API.

The 16 existing fixture candidates and their reasons remain current; new test
exclusions and the added factory were inspected separately. No suppression,
ignore, severity reduction, warning-budget increase or new heuristic detector.
Existing role/helper checks and the stronger required prepared-data type provide
bounded prevention; identifying business arithmetic remains semantic review.
