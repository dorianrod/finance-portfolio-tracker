import type {
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/apis/queries/useFundHoldings'
import {
  fundQualityCategory,
  type FundQualityCategory,
} from '@/domains/portfolio/components/fund-holdings/fundHoldings.logic'
import { hasMaterialQualityGap } from '@/domains/portfolio/helpers/quality/qualityThresholds'

export type FundDiagnosticsFilter = 'all' | 'issues' | FundQualityCategory

export interface FundDiagnosticsRow {
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  status: FundHoldingStatus
  unresolved: FundUnresolved[]
}

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
    .filter((status) => filter === 'all'
      || filter === fundQualityCategory(status.qualityTier)
      || (
        filter === 'issues'
        && (
          status.validationStatus !== 'ok'
          || hasMaterialQualityGap(status.residualPct)
        )
      ))
    .toSorted(
      (left, right) => right.residualValue - left.residualValue
        || right.marketValue - left.marketValue,
    )
    .map((status) => ({
      holdings: holdings.filter(
        (item) => (item.parentIsin || item.parentTicker || item.parentName) === status.parentId,
      ),
      snapshots: snapshots.filter((item) => item.fundId === status.parentId),
      status,
      unresolved: unresolved.filter((item) => item.parentId === status.parentId),
    }))
}
