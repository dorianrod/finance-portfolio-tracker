import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

import type {
  ComparedMetric,
  OverviewWindows,
} from './buildOverviewComparison.types'
import { compared } from './compared'
import { latestAtOrBefore } from './latestAtOrBefore'

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
