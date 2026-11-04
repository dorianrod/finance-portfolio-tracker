# Audit coverage

## File review

This is a navigation propagation review; dispositions concern the selected rendering obligations, not unrelated architecture or financial correctness. Frozen hashes: [inputs](evidence/source-manifest.json).

| Project-relative file                                                                                   | Rule                           | Evidence                                                                                                               | Status            |
| ------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `src/app/App.feature.tsx`                                                                               | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardContent.feature.tsx`                                                                  | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardPanel.feature.tsx`                                                                    | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardPanelErrorBoundary.view.tsx`                                                          | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardHoldings.feature.tsx`                                                                 | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardPanel.feature.test.tsx`                                                               | ui-vercel-responsive-rendering | Existing DOM/model retention, store freshness, lazy loading and error-isolation tests; V-003.                          | manually reviewed |
| `src/app/DashboardFilters.feature.tsx`                                                                  | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardSectionHeader.feature.tsx`                                                            | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/dashboardNavigation/DashboardNavigation.feature.tsx`                                           | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardReliability.feature.tsx`                                                              | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/DashboardCombinedReliability.feature.tsx`                                                      | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/app/services/useDashboardViewModel.ts`                                                             | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/shared/ui/ViewNavigation.view.tsx`                                                                 | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/shared/ui/services/useScopedInput.ts`                                                              | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/domains/portfolio/features/wealth/services/useWealthModel.ts`                                      | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/domains/portfolio/features/overview/pages/OverviewTab.feature.tsx`                                 | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/main.tsx`                                                                                          | ui-vercel-responsive-rendering | Source review of navigation state, stable element identity and Activity/consumer lifecycle; runtime counters in V-002. | manually reviewed |
| `src/domains/portfolio/features/data-quality/features/assessment/services/useQualityAssessmentModel.ts` | ui-vercel-responsive-rendering | Supporting scope delta: trace conditional reliability consumer to local position memo; F-002.                          | manually reviewed |
| `src/domains/portfolio/shared/services/usePortfolioPositionScope.ts`                                    | ui-vercel-responsive-rendering | Supporting scope delta: trace conditional reliability consumer to local position memo; F-002.                          | manually reviewed |
| `src/domains/portfolio/shared/helpers/transformers/usePortfolioPositions.ts`                            | ui-vercel-responsive-rendering | Supporting scope delta: trace conditional reliability consumer to local position memo; F-002.                          | manually reviewed |

## Rule review

| Rule / actual impact                    | Eligible targets                                            | Coverage and limits                                                                                                                                                                                                                                                                                                        | Status            |
| --------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| ui-vercel-responsive-rendering / MEDIUM | Shell subscriptions, retained panels, model memo boundaries | Stable JSX identity and consumer-local models traced; 550 loaded project function bodies instrumented, including all seven sampled domain page roots and seven selected builders. Fourteen warm transitions have explicit counts. No new scheduling policy, controlled-input review or third-party Fiber coverage claimed. | manually reviewed |

## Existing decisions and ignores

`visited-dashboard-panels` is retained: hidden pages preserve their DOM/state but that does not promise zero render-body execution on reveal. `dashboard-models-at-consumers` is retained: no server data moves into atoms or broad shell forwarding.

Selected prior dossiers, newest first: 2026-11-03-interaction-performance (F-001–F-003 and plan completion: prior aggregation optimizations and unchanged keyed lifecycle were historical implementation outcomes; the current uncommitted Activity change supersedes that lifecycle); 2026-11-02-shared-feature-sharing (F-001/P-001: source caches remain persistent and calculations belong to consumers); 2026-11-02-react-full (scope examined, unrelated formatter/unit findings skipped). Git history `cb107d0` and the current unstaged App/Content/Holdings/Boundary patches were inspected. The later retention/viewport changes are uncommitted inputs, not assumed part of `ea6cd3f`.

No existing ignore is technically revalidated. The one global warning budget is unchanged; no in-scope rendering suppression is used. No existing conforming ownership decision is reversed.

## Pending inspection

None within the declared scope. Data quality navigation, changed filters/sources, first downloads, production invocation counts and third-party internals are outside this matrix, not passed checks.

## Implementation coverage delta

The original file/rule inventory above remains the diagnostic baseline. P-001 modifies existing DashboardPanel and adds DashboardHeader to the corrective scope; P-002 modifies DashboardReliability and deletes its exclusive duplicate consumer. DashboardHeader.feature.test.tsx and DashboardReliability.feature.test.tsx are the only new owners; both are tests, each colocated with its runtime owner. Authored hashes and deletion are retained in the implementation manifest.

| Obligation                                             | Evidence and disposition                                                                                                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Memo invalidation and Activity lifetime                | Default comparator, actual active/children inputs, source review and nineteen passing targeted tests; manually reviewed.                                                   |
| Feature boundaries / provenance                        | Existing consumers retain acquisition ownership; single-use duplicate wrapper removed, no forwarding facade restored; manually reviewed.                                   |
| Theme and translation reactivity                       | Header directly subscribes to theme and useTranslation; both new tests pass; manually reviewed.                                                                            |
| Reliability source/account invalidation and navigation | Fresh QueryClient/store integration tests update errors/account filters and follow the quality action; manually reviewed.                                                  |
| Colocation and fixture ownership                       | Two sibling tests; owning pipeline fixture; zero missing/pending colocation; 25 unchanged fixture decisions and passing gate; automatically checked and manually reviewed. |
| Accessible test interaction / store isolation          | Role/name queries, userEvent, fresh providers per test; manually reviewed.                                                                                                 |
| Local decisions and prevention                         | Three code-local decisions reflect the measured memo/model boundaries; no new suppression or unreliable timing detector; manually reviewed.                                |
| Import graph, types and warning ceiling                | No runtime cycles; production build passes; global lint 0 errors and one unchanged reviewed warning; automatically checked.                                                |

No further extraction, move, semantic obligation or decision remains pending within the authorized corrective scope. These constraint checks do not expand the original one-rule audit into a whole-catalog audit.
