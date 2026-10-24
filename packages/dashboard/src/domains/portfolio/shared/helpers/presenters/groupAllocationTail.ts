import i18n from '@/i18n/i18n'

const PINNED_CATEGORIES = new Set(['Not concerned', 'nc'])

export function formatGroupedAllocationLabel(count: number): string {
  return i18n.t('ui.groupallocationtail.othersCount', { count })
}

export function groupAllocationTail(
  cats: Array<{ name: string; value: number }>,
): {
  main: Array<{ name: string; value: number }>
  grouped: Array<{ name: string; value: number }>
} {
  const withValue = cats.filter((category) => category.value > 0)
  if (withValue.length <= 3) return { main: withValue, grouped: [] }
  const total = withValue.reduce((sum, category) => sum + category.value, 0)
  const sorted = withValue.toSorted((a, b) => b.value - a.value)
  let cumulative = 0
  let splitIndex = 0
  for (let index = 0; index < sorted.length; index++) {
    cumulative += sorted[index].value
    splitIndex = index + 1
    if (cumulative >= total * 0.85) break
  }
  const grouped = sorted.slice(splitIndex)
  const pinned = grouped.filter((category) =>
    PINNED_CATEGORIES.has(category.name),
  )
  const groupable = grouped.filter(
    (category) => !PINNED_CATEGORIES.has(category.name),
  )
  if (groupable.length <= 1) return { main: sorted, grouped: [] }
  return {
    main: [...sorted.slice(0, splitIndex), ...pinned],
    grouped: groupable,
  }
}
