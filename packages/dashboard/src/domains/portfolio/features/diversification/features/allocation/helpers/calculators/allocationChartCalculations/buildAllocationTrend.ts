import { formatGroupedAllocationLabel } from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail/formatGroupedAllocationLabel'
import { groupAllocationTail } from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail/groupAllocationTail'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import { partitionPercentages } from '@/shared/helpers/calculators/partitionPercentages'

import { dateTimestamp } from './dateTimestamp'

export function buildAllocationTrend(points: AllocationPoint[]): {
  categories: string[]
  groupedCategory: string | null
  rows: Array<Record<string, number | null>>
} {
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
  const groupedKey =
    grouped.length > 1 ? formatGroupedAllocationLabel(grouped.length) : null
  const categories = [...mainNames, ...(groupedKey ? [groupedKey] : [])]

  const rows = points.map((point) => {
    const valuesByCategory = new Map(
      point.categories.map((category) => [category.name, category.value]),
    )
    const values = mainNames.map((name) => valuesByCategory.get(name) ?? 0)
    if (groupedKey) {
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
    const row: Record<string, number | null> = {
      date: dateTimestamp(point.date) ?? 0,
    }
    categories.forEach((category, index) => {
      row[category] = percentages[index]
    })
    return row
  })

  return { categories, groupedCategory: groupedKey, rows }
}
