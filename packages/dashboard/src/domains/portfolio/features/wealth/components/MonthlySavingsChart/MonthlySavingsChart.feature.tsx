import { type ReactNode, useMemo } from 'react'

import { groupMonthlyTooltipOperations } from '@/domains/portfolio/features/wealth/components/MonthlySavingsChart/helpers/transformers/groupMonthlyTooltipOperations'
import type { MonthlyOperationsByMonth } from '@/domains/portfolio/features/wealth/types/monthlyOperation.type'
import type { TrailingSavingCapacityPoint } from '@/domains/portfolio/features/wealth/types/trailingSavingCapacityPoint.type'

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
