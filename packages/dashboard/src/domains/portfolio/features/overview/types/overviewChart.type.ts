import type { OverviewConcentrationComparison } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
export type DriverRow = {
  label: string
  previous: number | null
  current: number | null
  color: string
}
export type OverviewConcentrationRowData = NonNullable<
  OverviewConcentrationComparison['current']
>['holdings'][number] & { previousWeight: number | null }
