# Implementation review

The subsequent “ok regarde ca” authorizes the two previously identified suggestions. The original source/count/metric snapshots remain the baseline. Final source hashes and deleted owner are in implementation-source-manifest.json; supplementary implementation contracts are frozen separately.

## Final behavior and bounded measurements

Exactly the same fourteen warm development transitions pass with unchanged sources/filters. All seven page-root counts equal their baseline values: inactive roots remain zero, active roots retain their expected StrictMode pair. No other page becomes eager or loses its retained lifetime.

| Target                                            | Baseline body invocations | Final body invocations |
| ------------------------------------------------- | ------------------------: | ---------------------: |
| Header, every transition                          |                         2 |                      0 |
| All panel wrappers, primary navigation            |                        12 |                      4 |
| All panel wrappers, holdings subview navigation   |                        16 |                      4 |
| Position builder, return Overview/Diversification |                         4 |                      0 |
| Position builder, other sampled navigation        |                         0 |                      0 |

Counts include development StrictMode replay. Four panel calls mean the two changed panel instances execute twice each. They are not milliseconds, DOM replacements or production commit counts. The remaining App/navigation work, active subscription reconnection and chart renderer work are not claimed eliminated. Exact paired results: implementation-render-review.json.

A preliminary implementation probe overlapped source/test edits and experienced a Vite reload during its second cycle. It is excluded. The final probe adds an explicit main-frame/HMR guard, freezes the application inputs and completes both cycles without reload or page errors. Probe working file: `/tmp/finance-renders-phase2-browser.mjs`; ignored local supplementary evidence.

## Ownership and invalidation

DashboardPanel uses the default memo comparator over actual `active` and `children` props. Its own visited state and descendant store/query subscriptions remain active according to the existing Activity lifecycle. No custom equality rule can conceal source changes. Existing retention, fresh-store, lazy-loading and error-isolation regressions pass.

DashboardHeader owns its existing theme and now explicitly subscribes to translations through useTranslation. Memoization skips parent-only navigation renders; its own theme and language updates still render. Two new behavior tests exercise those updates.

DashboardReliability already owns the required model. It now composes CombinedAnalysisReliabilityKpi from that result instead of conditionally mounting DashboardCombinedReliability with another model consumer. The single-use wrapper is deleted and has no remaining source imports. This does not restore broad shell model forwarding or move server data into atoms. Existing cache ownership, tab-specific labels, quality navigation and source/filter invalidation are retained; two new real-hook integration tests cover them.

The first reliability test incorrectly expected pipeline navigation for the existing fixture whose weakest quality theme is classification; the expectation was corrected to the fixture's actual policy. No production policy was changed to satisfy it. The final six-file focused run passes 19 tests.

## Tests and prevention

Both new test files are colocated with their existing owners. They use fresh stores/query clients and owning financial fixtures; there are no internal module mocks. All 25 existing fixture candidates retain their exact locations, test hashes and decisions; only the aggregate source fingerprint is refreshed. Its integration gate passes.

No ESLint/TypeScript rule, comparator exception, warning budget or suppression is added. The optimization concerns measured memo lifetimes and consumer duplication; existing types/lint plus behavior and runtime counting are appropriate protection. Colocation reports zero missing/pending owners; import cycles report none. Build and global lint pass, with the single previously reviewed TanStack warning unchanged. Relevant checks and initial failed/stale attempts are recorded in verification.md.
