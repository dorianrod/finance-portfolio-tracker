# Portfolio capabilities and ownership

The dashboard has one business domain, `portfolio`: positions, cash flows,
valuation and exposure share account selection, dates and financial entities.
These concepts do not currently need independent sub-domains.

| Capability         | User outcome                                                    | Parent and reason                                                    | Rules, data and state owner                                                                                   |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Overview           | Compare the portfolio with the preceding period                 | Portfolio; synthesizes the other financial measures                  | `features/overview`: comparison windows, metrics and summary presentation                                     |
| Wealth             | Understand value, contributions and saving capacity             | Portfolio; explains changes in wealth                                | `features/wealth`: wealth drivers, account breakdown and savings models                                       |
| Performance        | Understand returns and investment income                        | Portfolio; measures investment results                               | `features/performance`: return summaries, income and rankings                                                 |
| Diversification    | Understand how exposure is spread and concentrated              | Portfolio; combines complementary measures of diversification        | `features/diversification`: common applicability, inputs and current/trend selection                          |
| Allocation         | Explore exposure by geography, sector, currency and asset class | Diversification; explains the distribution of exposure               | `features/diversification/features/allocation`: breakdown calculations, selection and matching-position state |
| Concentration      | Identify dominant assets and how dominance changes              | Diversification; measures dependence on the largest exposures        | `features/diversification/features/concentration`: current metrics, historical models and playback state      |
| Holdings           | Inspect owned positions and underlying fund assets              | Portfolio; explores the assets behind portfolio totals               | `features/holdings`: composition of positions and fund look-through                                           |
| Positions          | Inspect, sort and preview held positions                        | Holdings; operates at held-position grain                            | `features/holdings/features/positions`: table, sorting, overlays and contracts                                |
| Fund look-through  | Explore direct and indirect underlying exposure                 | Holdings; operates at underlying-asset grain                         | `features/holdings/features/fund-look-through`: exposure exploration and search state                         |
| Data quality       | Assess reliability and diagnose missing or invalid data         | Portfolio; explains the trustworthiness of its analyses              | `features/data-quality`: diagnostic models and panels                                                         |
| Quality assessment | Assess coverage, classification and fund reliability            | Data quality; owns the assessment workflow and its inspection panels | `features/data-quality/features/assessment`: assessment UI, models and state                                  |
| Pipeline errors    | Inspect pipeline errors and manual price overrides              | Data quality; diagnoses one source of unreliable financial data      | `features/data-quality/features/errors`: error presentation                                                   |

Current versus historical views, exposure dimensions, periods and held versus
underlying modes remain variants within their capability. They do not introduce
additional feature levels.

`portfolio/shared` owns entities, source queries used across capabilities,
account/period selection, navigation, common financial calculations and reliability
contracts consumed throughout the dashboard. A source query can stay shared even
when a feature owns the interpretation of its result. Code used by one capability
belongs to that capability; shared non-UI code never imports its descendant features.

`src/app` loads common sources and composes feature entry points. Business
derivations belong to the domain or the feature that owns their result. Shared
source requests continue to use the same query keys and React Query cache.

A feature with a `features/` directory keeps only `features/` and genuine
`shared/` implementation at that level. A leaf feature owns its role folders
directly. `local/feature-folder-layout` enforces both shapes, including files
without imports. The layout never grants shared ownership to parent-specific code.

Application components compose feature entry points. Sibling features cannot
import each other, and shared code cannot import descendants, including child UI
entry components. Cross-domain imports require an explicit transverse-domain
decision; none is currently declared. `local/import-boundaries` enforces these
directions for resolved aliases, types, re-exports and dynamic imports.

`local/shared-feature-usage` checks actual production consumers of business scoped
`shared/` modules. Require at least two distinct child capabilities at that scope;
several files within one capability still count as one consumer. Shared wrappers
and re-exports are followed, with named aliases resolved to their declarations so
that unrelated exports from one facade do not manufacture sharing. Tests, stories,
mocks and generated code are excluded. Application wrappers never count as features.

The usage rule reports one-feature ownership, missing production consumers and
sharing that imports cannot establish. It is enabled as a warning because common
inputs distributed through application props require manual evidence. It does
not claim to infer business capabilities from file counts, automatically move
files, or duplicate existing layout and import violations. All three checks use
`business-ownership.js`; graph edges use the same `import-boundary-policy.js` as
the import rule, so forbidden dependencies cannot establish valid shared use.

The architecture audit corrected three ownership problems: allocation was implicit
in diversification while concentration had an explicit child boundary; feature
calculations and interaction state remained in broad shared modules; and the
application's wealth model also implemented overview comparisons. Both
diversification children now own their complete models, and performance, wealth,
overview and quality assessment own their specific derivations. Common position and
history selection stays in `portfolio/shared` because several capabilities consume
the same financial scope.

Global filter reset is composed in `app`: it resets the common portfolio filters
and allocation selection together. Opening fund look-through from a position uses
a position-owned navigation action and a search target shared by both holdings
children; sorting and expanded rows remain local to their respective children. These coordination contracts do
not give siblings access to each other's private stores.

Financial calculations, filtering, loading, source queries and navigation retain
their existing contracts. Diversification prepares common input scope and retains
the existing loading, applicability and missing-breakdown gates. The current
concentration method survives switching between current and historical views.

Shared ownership requires consumers from at least two distinct child capabilities
at the owning boundary. Parent-owned implementation is not automatically shared.
Quality assessment therefore has its own feature alongside pipeline errors;
application components compose those capabilities. Application navigation and
composition also own the diversification and holdings screen controls.

The reuse audit moved the confirmed single-owner modules into performance and
position inspection, extracted quality assessment from `data-quality/shared`,
and relocated screen composition and navigation controls to `app`. Unused shared
KPI and category wrappers were removed. Remaining `unprovenSharing` diagnostics
identify source-query, filter and reliability data routed through the shell. They
are review requests, not proof that those inputs are specific to one feature;
inspect `DashboardContent`, `useDashboardViewModel` and their feature props before
choosing an owner. Do not silence them by adding fake imports or weakening the
business boundaries.
