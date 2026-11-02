# Audit findings

Both findings are verified resolved under the user’s implementation request.
The diagnosis below preserves phase-1 evidence; current outcomes are in
[the corrective plan](plan.md#final-implementation-checkpoint) and
[implementation verification](verification.md#phase-2-implementation-verification).

## F-001 — Presenters still derive independent financial and diagnostic metrics

- Kind: violation.
- Rule IDs and actual impact: `arch-component-roles` — CRITICAL for the evolution
  and error-controller views; `helpers-categories` — MEDIUM-HIGH for the six
  calculation owners below. One common ownership failure family.
- Affected files and symbols:
  - `src/domains/portfolio/features/wealth/components/EvolutionChart/helpers/presenters/computePortfolioComposition.ts:6`
    derives cost/gain total and attribution. Its
    `helpers/presenters/withPortfolioComposition.ts:8` adapter is called by
    `EvolutionChart.view.tsx:45`; `EvolutionTooltip.view.tsx:27` also calculates
    the monetary total directly. Production caller: `WealthTab.feature.tsx`.
  - `src/domains/portfolio/features/overview/pages/overviewCharts/helpers/presenters/buildOverviewDriverPresentation.ts:30`
    derives current/previous gross monetary changes from contributions and
    market performance. `OverviewDriversChart.feature.tsx` prepares the model;
    `OverviewDriversChart.view.tsx:63` displays these values as money.
  - `src/domains/portfolio/features/data-quality/features/assessment/components/helpers/presenters/buildLookThroughSummary.ts:9`
    derives identified, unresolved, reliable, other-source and selected-portfolio
    amounts before applying tones. `LookThroughCoverageSummary.feature.tsx`
    calls it; `lookThroughCoverageSummary/LookThroughCoverageSummaryView.view.tsx`
    renders the amounts and confidence breakdown.
  - `src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/presenters/useBuildDataQualityViewModel.ts:104`
    classifies and counts pipeline errors/warnings in private `buildPipelineTheme`.
    Caller: `services/useDataQualityViewModel.ts`, then `DataQualityTab.feature.tsx`.
  - `src/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab/helpers/presenters/buildPipelineErrorsViewModel/useBuildPipelineErrorsViewModel.ts:64`
    independently counts those same domain severity values.
    `ErrorsTabController.view.tsx:27` invokes it; `DashboardDataQuality.feature.tsx`
    composes the controller. `ErrorsTab.view.tsx` displays the resulting counts.
  - `src/domains/portfolio/features/diversification/features/concentration/components/ConcentrationTrendSection/helpers/presenters/buildConcentrationChartRows.ts:11`
    computes four adjacent-snapshot changes in required position counts.
    `useConcentrationTrendController` supplies these to
    `ConcentrationTrendTooltip.view.tsx:41` and its threshold rows. Timestamp
    adaptation remains a valid presenter responsibility; concentration changes
    are independent domain statistics.
- Proposed action: fix; implementation not requested.
- Plan actions and code decisions: P-001–P-003, P-005;
  proposed `prepared-evolution-metrics` and `pipeline-severity-counts` comments.

### Requirement and evidence

The frozen [component role rule](../../../../.agents/skills/generic-react-best-practices/rules/arch-component-roles.md)
reserves business calculations/derived domain data for feature orchestration;
views render supplied values. The [helper contract](../../../../.agents/skills/generic-react-best-practices/rules/helpers-categories.md)
reserves independent calculations, classifications and diagnostics for
transformers; presenters may compose them while owning visual adaptation.
See [semantic review](evidence/semantic-review.md#presenters-and-financial-calculations)
and [presenter dispositions](evidence/presenter-review.json).

These values are not coordinates, clamped widths, formatted strings or
library-payload extraction. `cost + gain` is displayed as Total; contributions
plus market movement is displayed as Gross value change; confidence-limited
fund amounts are displayed as monetary exposure. Severity counts are already
independently computed in the pure `buildDataQualitySummary` transformer and
drive reliability outside the error table. Concentration deltas compare domain
snapshot thresholds independently of coordinates/playback. Canonical `PipelineError.level` is
the closed `error | warning` union. Both presenters recompute its statistics
before making their UI-specific choices.

Lint passes because calculations hide behind valid-looking presenter paths.
[Actual-config calibration](evidence/calibration-review.json) rejects a view
importing an explicit transformer at error severity 2, accepts a display-only
neighbor and reports no component-role error for the current evolution source.
This demonstrates a semantic coverage limit, not a current lint diagnostic.

History was checked before recommending corrections. `6cea357c` moved the
composition calculator from `wealth/helpers/calculators/` into the chart
presenter and renamed evolution to a view. `34d269ec` renamed the error
controller from feature to view. The factual reason for reconsidering these
classifications is the still-executed domain-total/severity chain above,
contradicted by the unchanged contracts. The latest dossier had broad clean
helper/role conclusions; 2026-10-31-react-full F-001/P-001 and F-002/P-003 had
already established feature-prepared totals and separated diagnostics. This is
an earlier missed part of that family, not a new policy preference or application
regression. Preserve its account-chart/page-assessment corrections, the ten
current code decisions and the recent formatter corrections. Staged/unstaged
patches for affected source are empty.

For concentration, `6cea357c` narrowed the component owner and `e271d108` added
absence rationale. Preserve both: separate only statistical differences,
retaining timestamp adaptation and the current null semantics.

### Why this matters

Presentation adapters own calculations with independent financial/diagnostic
meaning. Visual refactors can therefore change domain behavior, and severity
statistics have several owners. View contracts conceal preparation dependencies.
This is a maintainability/convention defect; no numerically incorrect amount or
production failure is asserted.

### Alternatives considered

Keeping independent calculations in presenters contradicts their contract.
Renaming entire mixed adapters to transformers would bring chart keys,
translations, tones or localized sorting into domain calculations. Extract only
independent metrics and compose them from existing adapters/features. Preserve
chart geometry/stack shares, table UI filtering/sorting, theme priority and copy.

Preparing evolution in WealthTab would couple the page to the chart/tooltip
contract. A chart-owned feature follows the neighboring account-chart decision;
the substantial existing chart view has a useful visual contract. The error
controller already has a separate ErrorsTabView, so classifying its preparation
as a feature preserves that boundary. Common severity counting belongs at the
nearest data-quality ancestor of assessment/errors, rather than a sibling leaf
or application-wide shared code.

### Proposed corrective plan

P-001 prepares evolution metrics before chart/tooltip rendering. P-002 shares
severity statistics and classifies the error controller as a feature. P-003
extracts gross-change/coverage/concentration metrics into narrow transformers,
retaining visual adapters. P-005 verifies outputs, ownership and new contracts.

### Decision or clarification required

None. Existing prepared-data and narrowest-owner conventions select the
responsibilities. Equivalent details do not require architectural arbitration.
All actions remain proposals until implementation is requested.

### Acceptance and prevention

Preserve negative/canceling evolution amounts, unavailable shares, confidence
caps, zero/partial coverage, gross-change null propagation, input ordering and
global severity counts while filtering. Preserve text, tones, recommendation
priorities, adjacent-snapshot delta absence and query lifecycles. No view may acquire the new business transformer
transitively.

Require prepared totals in types; exercise rejected raw props and a valid
prepared neighbor through actual compiler/configuration. Add meaningful sibling
nominal/edge tests for new runtime owners with owning fixtures. Existing
component-role/helper checks, strict TypeScript and behavior regressions provide
prevention once ownership is explicit. An arithmetic ban would reject valid
geometry, so no heuristic semantic detector is justified. Full gates,
fixture-review and colocation must pass without increasing the warning budget.

## F-002 — Formatting fails on newly versioned historical audit records

- Kind: violation.
- Rule IDs and actual impact: `quality-formatting-and-sorting` — LOW.
- Affected files and callers: 79 historical records listed in
  [format dispositions](evidence/format-dispositions.json) and the
  [supplemental manifest](evidence/format-target-manifest.json). `package.json`
  `format:check` is also used by `.github/workflows/ci.yml:58`.
- Proposed action: fix; implementation not requested.
- Plan actions and code decisions: P-004, P-005. No architecture decision.

### Requirement and evidence

The formatting rule requires the committed Prettier policy on authored supported
files. `npx prettier --check .` exits 1, listing 79 historical Markdown/JSON
records and one new scratch JSON; no application-source violation. This audit's
artifacts are formatted separately before final verification. The original 79
remain unchanged and fail the actual `npm run format:check` gate (E11/E14).

Git patches establish the trigger: HEAD `444f8b4` replaced the blanket `audit`
Git ignore with a policy that versions durable reports/evidence. Prettier now
discovers those records. Its command and CI still check the whole application
directory. Earlier passing checks under the old ignore cannot establish the
current gate result. No older dossier's substantive conclusions were reopened.

### Why this matters

The documented local/CI format command exits before reaching lint. Failure is
reproduced locally; no remote CI run was inspected. Application source passes
its formatter and lint separately.

### Alternatives considered

Apply pinned Prettier to the exact 79 records, preserving Markdown meaning and
parsed JSON values: this is the mechanical correction. Restoring the blanket
Git ignore reverses HEAD's deliberate durability policy. Adding an audit-wide
formatter ignore widens exclusions to obtain a pass. Neither is proposed.

### Proposed corrective plan

P-004 formats only the enumerated records during phase 2, verifies JSON value
equivalence/Markdown layout and runs the real gate. Preserve finding IDs,
decisions, snapshots and metric values.

### Decision or clarification required

None: retain HEAD's version-control policy and existing formatting requirement.
Implementation is not authorized by this audit-only request.

### Acceptance and prevention

`npm run format:check` passes without unrelated source changes, wider ignores or
a new warning ceiling. CI already runs this gate; no additional detector or test
is needed for mechanical formatting. Parsed JSON remains identical and Markdown
diffs are reviewed as layout only.

## Phase-2 resolution

Both findings are resolved under the user’s “corrige” authorization. The original
proof and proposed corrections above are retained as the phase-1 baseline.
P-001–P-003 extracted all six independent calculation owners, introduced the
required prepared evolution data contract, made controller preparation explicit
and normalized private owner imports with callers. See the
[current source/path review](evidence/file-review-final-delta.json) and
[owner/behavior review](evidence/introduced-owner-review.md).
P-004 formats all 79 exact records with parsed JSON/Markdown AST equivalence.
P-005 verifies full behavior, actual types/import checks, fresh fixtures and
all new/moved-owner obligations. Current outcomes are authoritative in plan.md
and verification.md. No ambiguity, required decision or open violation remains.
