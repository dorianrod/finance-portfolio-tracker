import { getFundQualityPresentation } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/getFundQualityPresentation'
import type { FundQualityCategory } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/getFundQualityPresentation.types'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds/hasMaterialQualityGap'
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
    .toSorted(
      (left, right) =>
        right.residualValue - left.residualValue ||
        right.marketValue - left.marketValue,
    )
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
