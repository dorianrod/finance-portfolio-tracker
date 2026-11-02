# Audit findings

## F-001 — Account-type chart views aggregate business collections

- Kind: violation
- Rule IDs and actual impact: `arch-component-roles` (CRITICAL), `helpers-categories` (MEDIUM-HIGH).
- Affected files, symbols and callers: `src/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/AccountTypeTooltip.view.tsx:31` calls `helpers/presenters/computeAccountTypeTooltipMetrics.ts:7`, which reduces the complete `AccountTypePoint[]`. `AccountTypeHistoryChart/AccountTypeHistoryTooltip.view.tsx:28` calls `helpers/presenters/buildAccountTypeTooltipData.ts:13`, which totals the account values. Their chart views supply unprepared domain inputs; `pages/WealthTab.feature.tsx` is their production caller.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-001; `prepared-account-type-breakdown`, `prepared-account-type-history`.

### Requirement and evidence

The frozen component-role rule expressly reserves domain collection aggregation to feature orchestration, including chart/tooltip totals. Presenter naming does not change the observed reductions over account balances. These are financial totals, not coordinate or visibility calculations. The chart views import their tooltip views, which call the reductions. Baseline lint passes because the business meaning of an inline reduction hidden in a presenter is outside its runtime role-path detector. The source paths and call sequence establish the violation independently of script candidates.

### Why this matters

Pure chart views require business aggregation to exercise their tooltip contracts, and the totals are recomputed as tooltips render. Separating preparation makes the reporting denominator explicit and preserves one owner when changing the display mode.

### Alternatives considered

Keep the existing placement: conflicts with the explicit aggregation boundary. Prepare totals in WealthTab: can conform, but enlarges that page and couples its interface to two independent chart contracts. Prepare totals in each chart feature and give the existing views scalar totals/prepared rows: conforms at the narrowest owner and follows the application's established rule that chart features prepare tooltip data (README, Architecture and TypeScript prevention). The existing application choice selects that last option; no new structural arbitration is needed. Geometry, chart-series rounding and point-level display ratios remain presenters.

### Proposed corrective plan

Add chart-owned pure total transformers with nominal/empty/selection/immutability tests. Add feature components that memoize preparation and retain the existing display-ready chart views. Pass the full raw portfolio total to the current tooltip (preserve negative balances); attach selected-account totals to history points before visual share partitioning. Remove reductions from tooltip presenters; update WealthTab and callers/tests. Record the two code decisions beside the owning feature declarations.

### Decision or clarification required

None. The explicit audit-and-fix request authorizes implementation; the existing chart-preparation convention selects the correction.

### Acceptance and prevention

Portfolio share remains 30% for a 90-value point in a 300 portfolio. History totals include the selected account keys only, keep unusual source names literal, preserve zero/missing semantics and do not mutate inputs. Views receive required typed prepared data. Existing `local/component-role` rejects direct transformer imports; E12 demonstrates that pure presenter indirection remains a semantic review obligation, so this is not claimed as automated protection. Exercise that boundary with invalid/valid isolated probes and run colocation, typecheck, lint, relevant behavior tests and full tests/build. No new semantic ESLint heuristic: geometry also legitimately reduces arrays, so a blanket reduction ban would be unsound.

## F-002 — Data-quality diagnostics are calculated inside a presenter

- Kind: violation
- Rule IDs and actual impact: `helpers-categories` (MEDIUM-HIGH).
- Affected files, symbols and callers: `src/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/helpers/presenters/useBuildDataQualityViewModel.ts:35-106`, private `buildAffectedAssets` at line 150; called by `services/useDataQualityViewModel.ts` and the DataQualityTab feature.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-003; `data-quality-assessment-before-presentation`.

### Requirement and evidence

The frozen helper contract reserves independent selection, aggregation, calculations and structured business diagnostics to pure transformers. The presenter groups classification issues into canonical `AffectedAsset` records, calculates applicable/unmapped exposure and counts fund issues before choosing labels. These values also drive inspection availability, rather than merely chart geometry or display wording. Canonical `AffectedAsset` and `DataQualityTabProps` contracts, the downstream inspection hook and source reductions establish independent business responsibility.

### Why this matters

The diagnostic calculation requires mounting a presentation hook to test and is mixed with translated theme construction. It can drift from coverage policies without a focused pure behavior check.

### Alternatives considered

Keep private algorithms in the presenter: conflicts with the owning helper rule. Move the complete presenter to transformers: conflicts with its translation/formatting dependencies. Extract its cohesive diagnostic stage into page-owned `helpers/transformers/buildDataQualityAssessment.ts`, retaining theme construction, translated metrics and recommended visual theme in the presenter: conforms and preserves the current page owner. Splitting every reduction into a separate helper would fragment this single assessment without a separate consumer.

### Proposed corrective plan

Extract the existing diagnostic stage unchanged, including affected-asset aggregation as private support. Have the presenter call it and keep its public result unchanged. Test partial coverage, multiple dimensions for one asset, empty/loading/not-applicable states, fund residual/error counts and input immutability. Record the chosen boundary beside the presenter.

### Decision or clarification required

None; helper contracts and the existing owner select this mechanical responsibility extraction.

### Acceptance and prevention

Existing count formatting and DataQualityTab behavior tests remain green. New transformer has a sibling test with meaningful normal/edge cases. Existing helper, dependency and component-role checks protect the extracted boundary. Business-versus-visual meaning remains manual; do not add a category detector based solely on field names or arithmetic.

## F-003 — Nullable support fields lack their absence rationale

- Kind: violation
- Rule IDs and actual impact: `types-explicit-nullability` (HIGH).
- Affected files, symbols and callers: exact field-level inventory in [nullable contracts](evidence/nullable-contract-candidates.json), including overview comparisons, optional fund reports, unavailable IRRs, unselected previews/categories and threshold deltas.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-002. Self-explanatory documentation correction; no structural decision identifier needed.

### Requirement and evidence

The frozen rule explicitly requires a short reason for each nullable field. The inventory records nullable property declarations lacking that comment. Owning producers and consumers distinguish missing report/source history, missing comparison baselines, undefined returns and idle visual selection; the union types are generally correct. Existing canonical entity comments are preserved. Grouped threshold declarations may share one reason where identical.

### Why this matters

Without the reason, callers cannot tell whether null denotes unavailable evidence, an undefined ratio or idle client state, and may incorrectly replace it with zero. This is a contract-documentation violation; no observed runtime failure is claimed.

### Alternatives considered

Remove null or widen optionals: contradicts actual producers and changes behavior. Add precise comments to the existing contracts: satisfies the explicit requirement without changing their meaning. Re-declaring all support fields through unrelated entities solely to avoid comments would obscure local contracts.

### Proposed corrective plan

Read the relevant producers/callers and document the actual absence conditions. Keep existing types and behavior. Do not add redundant comments to inherited fields whose absence rationale is already owned elsewhere.

### Decision or clarification required

None; all listed absence cases are established by source branches and existing tests.

### Acceptance and prevention

Comments match current null-producing branches; typecheck and formatting pass. No tests for comment-only changes. Syntax cannot validate the truth of a business rationale, so keep this semantic review manual rather than adding a comment-presence check that would accept empty prose.

## Baseline volumes and score

Formula: `weighted-rule-compliance/v1`. Score: **95.07**. Scope: full dashboard React; 110 rules reviewed, 100 applicable, 0 pending; 143 existing exceptions not technically revalidated. Open affected files: 33.

| Actual impact | Baseline families | Open | Resolved |
| --- | ---: | ---: | ---: |
| CRITICAL | 1 | 1 | 0 |
| HIGH | 1 | 1 | 0 |
| MEDIUM-HIGH | 1 | 1 | 0 |
| MEDIUM | 0 | 0 | 0 |
| LOW-MEDIUM | 0 | 0 | 0 |
| LOW | 0 | 0 | 0 |

The score counts each violated rule once, not every field or diagnostic. The nullable candidate inventory includes three already documented threshold fields retained after review; they do not count as open defects. See the preserved machine inputs/results in evidence.

## Final volumes and score

All three original families are resolved by the verified actions in plan.md; no ambiguity or user choice remains pending. Formula: `weighted-rule-compliance/v1`. Baseline **95.07**, final **100**; 110 selected/reviewed rules, 100 applicable, zero pending; 143 exceptions not technically revalidated. Open affected files: **0** (baseline 33). Preserve the original family grouping; location/comment counts are not separate defects.

| Actual impact | Baseline families | Open | Resolved |
| --- | ---: | ---: | ---: |
| CRITICAL | 1 | 0 | 1 |
| HIGH | 1 | 0 | 1 |
| MEDIUM-HIGH | 1 | 0 | 1 |
| MEDIUM | 0 | 0 | 0 |
| LOW-MEDIUM | 0 | 0 | 0 |
| LOW | 0 | 0 | 0 |

Machine inputs/results: [baseline](evidence/baseline-metrics-input.json), [baseline result](evidence/baseline-metrics.json), [final](evidence/final-metrics-input.json), [final result](evidence/final-metrics.json). A score of 100 excludes unrevalidated exceptions and expresses no remaining proven violation in the reviewed scope.
