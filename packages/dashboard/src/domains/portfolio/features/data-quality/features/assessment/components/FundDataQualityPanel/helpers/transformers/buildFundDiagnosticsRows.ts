import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/hasMaterialQualityGap'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import { getFundQualityCategory } from '@/domains/portfolio/shared/helpers/transformers/getFundQualityCategory'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { FundQualityCategory } from '@/domains/portfolio/shared/types/fundQualityCategory.type'

export function buildFundDiagnosticsRows({
  filter,
  holdings,
  snapshots,
  statuses,
  unresolved,
}: {
  filter: FundDiagnosticsFilter
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  statuses: FundHoldingStatus[]
  unresolved: FundUnresolved[]
}): FundDiagnosticsRow[] {
  const holdingsByParent = indexBy(
    holdings,
    (item) => item.parentIsin || item.parentTicker || item.parentName,
  )
  const snapshotsByFund = indexBy(snapshots, (item) => item.fundId)
  const unresolvedByParent = indexBy(unresolved, (item) => item.parentId)
  return statuses
    .filter(
      (status) =>
        filter === 'all' ||
        filter === getFundQualityCategory(status.qualityTier) ||
        (filter === 'issues' &&
          (status.validationStatus !== 'ok' ||
            hasMaterialQualityGap(status.residualPct))),
    )
    .toSorted((left, right) => {
      const residualDifference = right.residualValue - left.residualValue
      return residualDifference === 0
        ? right.marketValue - left.marketValue
        : residualDifference
    })
    .map((status) => ({
      holdings: holdingsByParent.get(status.parentId) ?? [],
      snapshots: snapshotsByFund.get(status.parentId) ?? [],
      status,
      unresolved: unresolvedByParent.get(status.parentId) ?? [],
    }))
}

export type FundDiagnosticsFilter = 'all' | 'issues' | FundQualityCategory

export type FundDiagnosticsRow = {
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  status: FundHoldingStatus
  unresolved: FundUnresolved[]
}

function indexBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const result = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    const group = result.get(key) ?? []
    group.push(item)
    result.set(key, group)
  }
  return result
}
