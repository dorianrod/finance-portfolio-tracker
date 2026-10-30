import type { AllocationTrend } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/types/allocationTrend.type'
import { dateTimestamp } from '@/domains/portfolio/features/diversification/features/allocation/helpers/transformers/allocationChartCalculations/dateTimestamp'
import { groupAllocationTail } from '@/domains/portfolio/shared/helpers/transformers/groupAllocationTail'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import { partitionPercentages } from '@/shared/helpers/transformers/partitionPercentages'

export function buildAllocationTrend(
  points: AllocationPoint[],
): AllocationTrend {
  const totalsByCategory = new Map<string, number>()
  for (const point of points) {
    for (const category of point.categories) {
      totalsByCategory.set(
        category.name,
        (totalsByCategory.get(category.name) ?? 0) + category.value,
      )
    }
  }

  const { main, grouped } = groupAllocationTail(
    [...totalsByCategory]
      .map(([name, value]) => ({ name, value }))
      .toSorted((a, b) => b.value - a.value),
  )
  const mainNames = main.map((category) => category.name)
  const groupedNames = new Set(grouped.map((category) => category.name))
  const categories: AllocationTrend['categories'] = mainNames.map((name) => ({
    kind: 'category',
    name,
  }))
  if (grouped.length > 1)
    categories.push({ kind: 'group', count: grouped.length })

  const rows = points.map((point) => {
    const valuesByCategory = new Map(
      point.categories.map((category) => [category.name, category.value]),
    )
    const values = mainNames.map((name) => valuesByCategory.get(name) ?? 0)
    if (grouped.length > 1) {
      values.push(
        point.categories.reduce(
          (sum, category) =>
            groupedNames.has(category.name) ? sum + category.value : sum,
          0,
        ),
      )
    }

    const total = values.reduce((sum, value) => sum + value, 0)
    const percentages =
      total > 0 ? partitionPercentages(values) : values.map(() => null)
    return { date: dateTimestamp(point.date) ?? 0, values: percentages }
  })

  return { categories, rows }
}
