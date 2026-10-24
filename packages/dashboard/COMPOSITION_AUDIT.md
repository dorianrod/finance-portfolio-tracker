# Composition audit — 2026-10-24

Scope: every React/TypeScript source and test in `src` (379 files after the changes), with a focused review of project-owned component APIs and their callers.

Reference: [Dorian's mandatory composition rule](../../.agents/skills/dorian-react-best-pratices/rules/composition-required-children.md), based on Vercel's `patterns-children-over-render-props` and `architecture-compound-components`.

## Findings and corrections

The AST inventory found 26 JSX-valued content-prop usages and 20 named ReactNode prop declarations before the changes. Those usages, their forwarding layers and all callers now use nested children. The final scan finds zero project-owned JSX content props, zero named ReactNode/ReactElement content-prop declarations and zero explicit `children={...}` attributes.

| Area                     | Resulting composition                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Side panels              | `SidePanel.Title`, `.Description` and `.HeaderActions` replace the corresponding props across filters, allocation positions and quality diagnostics. The title retains its dialog label association.      |
| Active filters           | `ActiveFilterSummary.Leading` and `.Actions` compose comparison controls and reset actions around filter chips; absent optional controls remain absent.                                                   |
| Allocation cards         | `DonutCardView` and `EvoCardView` expose `.Tooltip` and `.PositionsControl` children.                                                                                                                     |
| Concentration history    | `ConcentrationTrendSectionView.ThresholdTooltip` and `.HoldingsTooltip` replace named tooltip props.                                                                                                      |
| KPI and quality tooltips | `Kpi.TooltipFooter`, `QualityIndicatorCard.TooltipFooter` and `InfoTooltip.Footer` compose filter-scope content. Tooltip text is string data, rather than an open ReactNode slot.                         |
| Look-through coverage    | The scope footer enters through `LookThroughCoverageSummaryView.TooltipFooter` and travels as nested children through compact cards and exposure branches. Card body content remains outside the tooltip. |

The review covered JSX literals/fragments, JSX-valued local variables, static render callbacks, spread objects, named ReactNode declarations and forwarding layers. Direct slots retain their identity; the shared `partitionSlot` helper separates them without adding context or hiding slots behind wrapper components.

## Retained external contracts

There are 28 element-valued props at external integration boundaries: 23 Recharts `Tooltip.content` usages, two `YAxis.tick` usages, two chart `dot` usages and one React `Suspense.fallback`. These APIs require their named props and fall under the rule's documented external-contract exception. String labels, descriptions, native titles/ARIA attributes, domain data and callbacks receiving library-provided data remain props.

## Validation

- Skill validator passed; routing, category registration and local reference links checked.
- Full Vitest suite: 83 files, 418 tests passed.
- New interaction regressions cover rich dialog titles/actions, focus and Escape behavior, tooltip-only footer visibility, optional footers and quality-card body/progress rendering.
- TypeScript, production build, Prettier and translation-catalog audit passed.
- ESLint passed with two existing `no-prop-drilling` warnings in `WealthTab.feature.tsx` and `FundLookThroughTab.feature.tsx`, also reproduced against their HEAD versions; neither concerns this composition rule.
