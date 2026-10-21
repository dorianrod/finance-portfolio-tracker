import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { isAssetAnalysisApplicablePosition } from '@/shared/quality/accountApplicability'
import { partitionPercentages } from '@/shared/format/percentage'
import { isFundPosition } from './fundHoldings.logic'

export interface ScopedFundQualityData {
  holdings: FundHolding[]
  statuses: FundHoldingStatus[]
  report: FundCoverageReport | null
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
  notApplicableValue: number
}

export interface FundExposurePercentages {
  identified: number
  unresolved: number
  notApplicable: number
}

export function computeFundExposurePercentages(
  identifiedValue: number,
  unresolvedValue: number,
  notApplicableValue: number,
): FundExposurePercentages {
  const [identified, unresolved, notApplicable] = partitionPercentages([
    identifiedValue,
    unresolvedValue,
    notApplicableValue,
  ])
  return { identified, unresolved, notApplicable }
}

function positiveValue(position: PositionRow): number {
  return position.status === 'active' ? Math.max(0, position.total_value ?? 0) : 0
}

function positionMatchesStatus(position: PositionRow, status: FundHoldingStatus): boolean {
  return (!!position.isin && (position.isin === status.parentIsin || position.isin === status.parentId))
    || (!!position.ticker && (position.ticker === status.parentTicker || position.ticker === status.parentId))
    || (!!position.name && (position.name === status.parentName || position.name === status.parentId))
}

function positionMatchesHolding(position: PositionRow, holding: FundHolding): boolean {
  return (!!position.isin && position.isin === holding.parentIsin)
    || (!!position.ticker && position.ticker === holding.parentTicker)
    || (!!position.name && position.name === holding.parentName)
}

function clampRatio(percentage: number): number {
  return Math.max(0, Math.min(1, percentage / 100))
}

export function scopeFundQualityData(
  positions: PositionRow[],
  holdings: FundHolding[],
  statuses: FundHoldingStatus[],
  snapshots: FundSnapshot[],
  unresolved: FundUnresolved[],
  baseReport: FundCoverageReport | null,
): ScopedFundQualityData {
  const notApplicableValue = positions
    .filter((position) => positiveValue(position) > 0 && !isAssetAnalysisApplicablePosition(position))
    .reduce((sum, position) => sum + positiveValue(position), 0)
  const activePositions = positions.filter(
    (position) => positiveValue(position) > 0 && isAssetAnalysisApplicablePosition(position),
  )
  const statusByPosition = new Map<PositionRow, FundHoldingStatus>()
  for (const position of activePositions) {
    const status = statuses.find((candidate) => positionMatchesStatus(position, candidate))
    if (status) statusByPosition.set(position, status)
  }

  const scopedStatuses = statuses.flatMap((status) => {
    const marketValue = activePositions
      .filter((position) => positionMatchesStatus(position, status))
      .reduce((sum, position) => sum + positiveValue(position), 0)
    if (marketValue <= 0) return []
    const explainedValue = marketValue * clampRatio(status.explainedPct)
    const residualValue = marketValue * clampRatio(status.residualPct)
    return [{ ...status, marketValue, explainedValue, residualValue }]
  })

  const selectedParentKeys = new Set(scopedStatuses.flatMap((status) => [
    status.parentId,
    status.parentIsin,
    status.parentTicker,
    status.parentName,
  ]).filter(Boolean))
  const scopedHoldings = holdings.filter((holding) => (
    activePositions.some((position) => positionMatchesHolding(position, holding))
  ))
  const scopedSnapshots = snapshots.filter((snapshot) => selectedParentKeys.has(snapshot.fundId))
  const scopedUnresolved = unresolved.filter((item) => selectedParentKeys.has(item.parentId))

  let fundValue = 0
  let directIdentifiedValue = 0
  let opaqueValue = 0
  const statuslessFundIds = new Set<string>()
  for (const position of activePositions) {
    const value = positiveValue(position)
    const status = statusByPosition.get(position)
    if (status || isFundPosition(position)) {
      fundValue += value
      if (!status) statuslessFundIds.add(position.isin || position.ticker || position.name)
    } else if (position.isin || position.ticker) {
      directIdentifiedValue += value
    } else {
      opaqueValue += value
    }
  }

  const portfolioValue = activePositions.reduce((sum, position) => sum + positiveValue(position), 0)
  const decomposedValue = scopedStatuses.reduce((sum, status) => sum + status.explainedValue, 0)
  const highConfidenceExplainedValue = scopedStatuses
    .filter((status) => status.qualityTier === 'A' || status.qualityTier === 'B')
    .reduce((sum, status) => sum + status.explainedValue, 0)
  const undisclosedFundValue = Math.max(0, fundValue - decomposedValue)
  const fundCoveragePct = fundValue > 0 ? highConfidenceExplainedValue / fundValue * 100 : 100
  const portfolioCoveragePct = portfolioValue > 0
    ? (directIdentifiedValue + highConfidenceExplainedValue) / portfolioValue * 100
    : 0

  const ranked = [...scopedStatuses].sort((a, b) => b.marketValue - a.marketValue).slice(0, 7)
  const coverageGatePass = fundValue === 0 || fundCoveragePct >= 85
  const topFundsGatePass = ranked.length === 0 || ranked.every(
    (status) => (status.qualityTier === 'A' || status.qualityTier === 'B') && status.explainedPct >= 98,
  )
  const exactProxyGatePass = scopedStatuses
    .filter((status) => status.qualityTier === 'B')
    .every((status) => !!status.indexName.trim() && !!status.proxyIsin.trim())
  const repeatabilityGatePass = ranked.length === 0 || ranked.every((status) => status.refreshStreak >= 2)
  const qualityGatesPass = coverageGatePass && topFundsGatePass && exactProxyGatePass
  const feasibilityStatus: FundCoverageReport['feasibilityStatus'] = qualityGatesPass
    ? repeatabilityGatePass ? 'passed' : 'pending_repeatability'
    : 'limited'

  return {
    holdings: scopedHoldings,
    statuses: scopedStatuses,
    snapshots: scopedSnapshots,
    unresolved: scopedUnresolved,
    notApplicableValue,
    report: baseReport ? {
      asOfDate: baseReport?.asOfDate ?? '',
      portfolioValue,
      fundValue,
      directIdentifiedValue,
      opaqueValue,
      decomposedValue,
      highConfidenceExplainedValue,
      undisclosedFundValue,
      fundCoveragePct,
      portfolioCoveragePct,
      coverageGatePass,
      topFundsGatePass,
      exactProxyGatePass,
      repeatabilityGatePass,
      feasibilityStatus,
      fundCount: scopedStatuses.length + statuslessFundIds.size,
      issueCount: scopedStatuses.filter((status) => status.validationStatus !== 'ok').length,
    } : null,
  }
}
