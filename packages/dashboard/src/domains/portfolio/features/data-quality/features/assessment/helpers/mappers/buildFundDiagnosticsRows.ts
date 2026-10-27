import { hasMaterialQualityGap } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/quality/qualityThresholds/hasMaterialQualityGap'
import { getFundQualityPresentation } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/getFundQualityPresentation'
import type { FundQualityCategory } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/getFundQualityPresentation.types'
import type {
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'

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
  return statuses
    .filter(
      (status) =>
        filter === 'all' ||
        filter === getFundQualityPresentation(status.qualityTier).category ||
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
      holdings: holdings.filter(
        (item) =>
          (item.parentIsin || item.parentTicker || item.parentName) ===
          status.parentId,
      ),
      snapshots: snapshots.filter((item) => item.fundId === status.parentId),
      status,
      unresolved: unresolved.filter(
        (item) => item.parentId === status.parentId,
      ),
    }))
}

export type FundDiagnosticsFilter = 'all' | 'issues' | FundQualityCategory

export type FundDiagnosticsRow = {
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  status: FundHoldingStatus
  unresolved: FundUnresolved[]
}
