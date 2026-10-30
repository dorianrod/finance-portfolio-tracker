import { latestAtOrBefore } from '@/domains/portfolio/features/overview/helpers/selectors/latestAtOrBefore'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import type {
  ComparedMetric,
  OverviewWindows,
} from './buildOverviewComparison.types'
import { compared } from './compared'

export function compareRollingThreeYearIrr(
  history: PortfolioHistoryPoint[],
  windows: OverviewWindows,
): ComparedMetric {
  const points = [...history].toSorted(
    (left, right) => left.date.getTime() - right.date.getTime(),
  )
  const current =
    latestAtOrBefore(points, windows.current.end)?.tri_rolling_3y ?? null
  const previous =
    latestAtOrBefore(points, windows.previous.end)?.tri_rolling_3y ?? null
  return compared(current, previous)
}
