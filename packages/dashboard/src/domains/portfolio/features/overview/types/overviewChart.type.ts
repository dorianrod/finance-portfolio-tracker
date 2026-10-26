import type { OverviewConcentrationComparison } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import type { ChartTone } from '@/shared/theme/chartColors'
export type DriverRow = {
  label: string
  previous: number | null
  current: number | null
  tone: ChartTone
}
export type OverviewConcentrationRowData = NonNullable<
  OverviewConcentrationComparison['current']
>['holdings'][number] & { previousWeight: number | null }
