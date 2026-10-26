import type { ComparedMetric } from './buildOverviewComparison.types'

export function compared(
  current: number | null,
  previous: number | null,
): ComparedMetric {
  if (current == null || previous == null) {
    return { current, previous, delta: null, deltaPct: null }
  }
  const delta = current - previous
  return {
    current,
    previous,
    delta,
    deltaPct: previous === 0 ? null : (delta / Math.abs(previous)) * 100,
  }
}
