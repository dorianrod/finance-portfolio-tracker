import type { OverviewConcentrationComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
export type DriverRow = {
  label: string
  // The preceding comparison window may have no usable data.
  previous: number | null
  // The current comparison window may have no usable data.
  current: number | null
  tone: ChartTone
}
export type OverviewConcentrationRowData = NonNullable<
  OverviewConcentrationComparison['current']
>['holdings'][number] & {
  // A holding absent from the comparison snapshot has no previous weight.
  previousWeight: number | null
}
