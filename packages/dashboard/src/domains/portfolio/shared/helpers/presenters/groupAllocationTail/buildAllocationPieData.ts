import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'

import { formatGroupedAllocationLabel } from './formatGroupedAllocationLabel'
import { groupAllocationTail } from './groupAllocationTail'

export function buildAllocationPieData(point: AllocationPoint) {
  const total = point.categories.reduce(
    (sum, category) => sum + category.value,
    0,
  )
  const { main, grouped } = groupAllocationTail(point.categories)
  const groupedTotal = grouped.reduce(
    (sum, category) => sum + category.value,
    0,
  )
  const data: PieEntry[] = main.map((category) => ({ ...category, total }))
  if (grouped.length > 1)
    data.push({
      name: formatGroupedAllocationLabel(grouped.length),
      value: groupedTotal,
      total,
      subItems: grouped,
    })
  return { total, data }
}
