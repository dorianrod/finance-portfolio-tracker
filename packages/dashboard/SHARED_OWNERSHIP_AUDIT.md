# Shared portfolio source ownership — 2026-10-27

The application shell distributes validated source data to independent portfolio
capabilities. Static import analysis cannot follow every property supplied through
application props, so some common-source modules retain narrow reviewed
`local/review-shared-feature-sharing` directives. Those directives identify their
actual consumers and refer to this evidence.

The production composition is
[`useDashboardViewModel`](src/app/services/useDashboardViewModel.ts),
[`DashboardContent`](src/app/DashboardContent.feature.tsx) and
[`DashboardHoldings`](src/app/DashboardHoldings.feature.tsx).
The shell calls feature-owned models; common source modules do not import their
descendants.

| Common input or contract                             | Production consumer capabilities                                                      | Distribution                                                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operations, current/raw positions and account labels | Scope selection, overview, wealth, performance, holdings, diversification and quality | `useGetDashboardDataQuery`, `useGetPositionsQuery` and their shared source options feed position selection and feature models. Scope controls observe the validated dashboard cache. |
| Portfolio and account-filtered history               | Overview, wealth and performance                                                      | `useDashboardHistory` supplies `accountHistory` to overview comparisons and `displayedHistory`/IRR state to wealth and performance.                                                  |
| Broker cash history                                  | Overview, wealth and performance                                                      | `buildDashboardSourceData` enriches the common history before these capabilities consume it.                                                                                         |
| Saving capacity                                      | Overview and wealth                                                                   | `useGetSavingCapacityQuery` feeds `useOverviewComparison` and `useDashboardWealth`; account scopes share validated source options.                                                   |
| Allocation rows by identifier                        | Diversification and quality assessment                                                | The shell passes `rawAllocationData` to diversification charts and classification/coverage assessment.                                                                               |
| Fund holdings and composition history                | Overview, diversification, holdings and quality assessment                            | The common query supplies historical comparisons, concentration/allocation calculations, position look-through and coverage assessment.                                              |
| Fund holding statuses                                | Holdings and quality assessment                                                       | Position status controls and fund quality diagnostics consume the same validated status contracts.                                                                                   |

The following inputs have **one business owner**, assessment, and are no longer
part of the common fund query or common fund type module:

| Assessment source            | Owning query and consumers                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `fund_holdings_coverage.csv` | `useGetFundDiagnosticsQuery`; scoped fund coverage and feasibility summaries             |
| `fund_snapshot_manifest.csv` | `useGetFundDiagnosticsQuery`; source manifests and fund diagnostics                      |
| `fund_unresolved.csv`        | `useGetFundDiagnosticsQuery`; unresolved-source diagnostics and scoped quality summaries |

Their schemas and entity types live under
`domains/portfolio/features/data-quality/features/assessment/`. The shell combines
these diagnostics with common holdings inputs for assessment. Common portfolio
code only knows the holdings, historical composition and status contracts.

The shared CSV number and text schema helpers serve both common holdings sources
and assessment diagnostics. Their cross-capability consumers are now visible in
the import graph, so their previous ownership suppressions were removed. Generic
CSV boolean schemas live in `src/shared/schemas` and encode no portfolio rules.
