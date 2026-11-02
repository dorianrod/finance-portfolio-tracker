import type { OverviewComparison } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'

export function computeOverviewGrossChanges({
  contributions,
  marketPerformance,
}: Pick<OverviewComparison, 'contributions' | 'marketPerformance'>) {
  return {
    currentChange:
      contributions.current == null || marketPerformance.current == null
        ? null
        : contributions.current + marketPerformance.current,
    previousChange:
      contributions.previous == null || marketPerformance.previous == null
        ? null
        : contributions.previous + marketPerformance.previous,
  }
}
