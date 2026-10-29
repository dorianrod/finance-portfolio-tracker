import { type ReactNode, useMemo } from 'react'

import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/types/trailingSavingCapacityPoint.type'

import { groupMonthlyTooltipOperations } from './helpers/aggregators/groupMonthlyTooltipOperations'
import { MonthlySavingsChartView } from './MonthlySavingsChart.view'

export function MonthlySavingsChart({
  data,
  ops,
  children,
}: {
  data: TrailingSavingCapacityPoint[]
  ops: MonthlyOperationsByMonth
  children: ReactNode
}) {
  const operationGroups = useMemo(
    () => groupMonthlyTooltipOperations(ops),
    [ops],
  )
  return (
    <MonthlySavingsChartView data={data} operationGroups={operationGroups}>
      {children}
    </MonthlySavingsChartView>
  )
}
