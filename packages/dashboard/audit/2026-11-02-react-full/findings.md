# Audit findings

## F-001 — Domain labels are still mapped outside formatter hooks

- Kind: violation
- Rule IDs and actual impact: `helpers-formatter-hooks`, `helpers-categories` — MEDIUM-HIGH.
- Affected files, symbols and callers:
  - `src/domains/portfolio/features/diversification/features/allocation/components/FilterChipBar.feature.tsx:43`, `DIM_LABELS`, consumed by `FilterChipBar` at line 31.
  - `src/domains/portfolio/features/data-quality/features/assessment/components/AllocationDimensionRow.view.tsx:81`, `LABELS`, consumed by `AllocationDimensionRowView` at line 26.
  - `src/domains/portfolio/features/data-quality/features/assessment/components/reliability/helpers/presenters/qualityReliabilityPresentation.ts:6`, `RELIABILITY_TONES.label`, consumed by `AnalysisReliabilityKpi.feature.tsx`, `CombinedAnalysisReliabilityKpi.feature.tsx`, `PipelineReliabilityKpi.feature.tsx` and `CompactDataQualityKpi.view.tsx` under `components/reliability/analysisReliabilityKpi/`. `qualityTooltipDetails/QualityTooltipMetricRow.view.tsx` consumes only the valid visual fields.
- Proposed action: fix.
- Plan actions and related code decision identifiers: P-001, P-002, P-003. Routine placement/extraction; no non-obvious ownership change or decision comment required.

### Requirement and evidence

The frozen `helpers-formatter-hooks` requires a `useFormatXxx` hook for value-to-label mappings. `helpers-categories` explicitly separates the label formatter from visual tone configuration. These three exhaustive lookup tables translate a domain dimension/reliability value directly into display text; they are neither technical source keys nor static navigation/column headings. The third table mixes the text contract with valid visual fields. See [semantic evidence](evidence/types-helpers-review.md). The normal lint passes: its formatter contract checks declared helper implementations, not the business meaning of arbitrary constants. This is a semantic violation, not a claimed lint diagnostic.

`useFormatDataQualityDimension` already owns the long dimension labels, with lower-case text by default. Current row labels use title case. Allocation chips use intentionally shorter Geo/Class wording. Existing tests and the reference catalog establish these differences. `RELIABILITY_TONES` reads global i18n; that has no React provider subscription and cannot honor a caller-specific translation instance.

### Why this matters

Display rules live in several component/presenter tables instead of formatter contracts, so new consumers can duplicate them. Global lookup getters cannot consume provider-specific translations. Preserve all existing English words and capitalization while establishing one typed text owner per actual context.

### Alternatives considered

Keeping the maps contradicts the formatter requirement. Replacing them with plain functions still omits nullable input, configurable fallback, provider context and memoized hook output. A portfolio-wide combined dimension formatter would introduce a shared owner and mode surface for unrelated short-chip and quality-label contracts. The catalog's narrowest-owner rule selects the existing quality formatter plus a leaf-owned allocation formatter. Existing visual tone configuration remains a presenter, with its label removed; a new assessment-owned reliability formatter is shared by its actual consumers. No feature hierarchy, business calculation or screen composition changes.

### Proposed corrective plan

P-001: add the allocation formatter and migrate the chip. P-002: add an explicit title style to the existing quality dimension formatter and migrate the row. P-003: add the reliability label formatter, remove only text from the tone table and migrate all four text consumers. Add colocated formatter tests for every closed value, null/undefined/default/custom fallback and provider-specific translations. Reconcile fixture fingerprints only after reviewing source/test deltas and current candidates.

### Decision or clarification required

None. Both phases are explicitly authorized. The owning rules, established short/title/lowercase copy and existing formatter location determine the correction; equivalent code details need no renewed authorization.

### Acceptance and prevention

Original English labels/capitalization stay identical. Closed unions remain exhaustive; formatter callbacks accept null/undefined, return string, own fallback and read `useTranslation`. Existing typed `local/formatter-contract`, `local/helper-module-contract`, import boundaries, single export and public API order protect the extracted modules. Regression tests protect the provider behavior and full closed sets. No new heuristic lint ban on string records is proposed: static navigation/configuration headings and domain label conversion require semantic discrimination. Required lint/typecheck/tests/catalog/build/Storybook/format/colocation and fixture-review gates must pass. This is one stable failure family with three lookup owners, not three independently scored rules.

### Prior-history comparison for F-001

See [coverage history revalidation](coverage.md#prior-dossiers-and-change-history-revalidation). Prior getters deferred translations (de23f754); current formatter callbacks retain deferred lookup and add React provider context. Prior view/type/business-transformer extractions remain intact. Earlier automatic no-finding rows are contradicted by the exact unit-label requirement and original-source provider regression, not by an alternative conforming folder preference. No settled architecture choice is reversed, and no further correction or choice is exposed by the three selected prior dossiers.
