import type { OverviewConcentrationComparison } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import type { SemanticColorKey } from '@/shared/theme/semanticColors'
export type DriverRow = {
  label: string
  previous: number | null
  current: number | null
  tone: SemanticColorKey
}
export type OverviewConcentrationRowData = NonNullable<
  OverviewConcentrationComparison['current']
>['holdings'][number] & { previousWeight: number | null }
