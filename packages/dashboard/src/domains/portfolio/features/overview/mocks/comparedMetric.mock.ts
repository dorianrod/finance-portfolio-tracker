import type { ComparedMetric } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'

export const metric = (
  current: number | null,
  previous: number | null,
): ComparedMetric => ({
  current,
  previous,
  delta: current == null || previous == null ? null : current - previous,
  deltaPct:
    current == null || previous == null || previous === 0
      ? null
      : ((current - previous) / Math.abs(previous)) * 100,
})
