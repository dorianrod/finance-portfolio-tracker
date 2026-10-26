import type { OverviewConcentrationComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
export type DriverRow = {
  label: string
  previous: number | null
  current: number | null
  tone: ChartTone
}
export type OverviewConcentrationRowData = NonNullable<
  OverviewConcentrationComparison['current']
>['holdings'][number] & { previousWeight: number | null }
