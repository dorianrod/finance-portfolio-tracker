import type { FundCoverageReport } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundCoverageReport.type'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/businessRules/isAssetAnalysisApplicablePosition'
import { isFundPosition } from '@/domains/portfolio/shared/helpers/businessRules/isFundPosition'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import type { ScopedFundQualityData } from './scopeFundQualityData.types'

export function scopeFundQualityData(
  positions: PositionRow[],
  holdings: FundHolding[],
  statuses: FundHoldingStatus[],
  snapshots: FundSnapshot[],
  unresolved: FundUnresolved[],
  baseReport: FundCoverageReport | null,
): ScopedFundQualityData {
  const notApplicableValue = positions
    .filter(
      (position) =>
        positiveValue(position) > 0 &&
        !isAssetAnalysisApplicablePosition(position),
    )
    .reduce((sum, position) => sum + positiveValue(position), 0)
  const activePositions = positions.filter(
    (position) =>
      positiveValue(position) > 0 &&
      isAssetAnalysisApplicablePosition(position),
  )
  const positionIndex = indexPositionsByIdentifiers(activePositions)
  const statusByPosition = new Map<PositionRow, FundHoldingStatus>()
  const scopedStatuses = statuses.flatMap((status) => {
    const matchingPositions = positionsForStatus(positionIndex, status)
    let marketValue = 0
    for (const position of matchingPositions) {
      marketValue += positiveValue(position)
      if (!statusByPosition.has(position))
        statusByPosition.set(position, status)
    }
    if (marketValue <= 0) return []
    const explainedValue = marketValue * clampRatio(status.explainedPct)
    const residualValue = marketValue * clampRatio(status.residualPct)
    return [{ ...status, marketValue, explainedValue, residualValue }]
  })

  const selectedParentKeys = new Set(
    scopedStatuses
      .flatMap((status) => [
        status.parentId,
        status.parentIsin,
        status.parentTicker,
        status.parentName,
      ])
      .filter(Boolean),
  )
  const scopedHoldings = holdings.filter(
    (holding) =>
      positionIndex.isin.has(holding.parentIsin) ||
      positionIndex.ticker.has(holding.parentTicker) ||
      positionIndex.name.has(holding.parentName),
  )
  const scopedSnapshots = snapshots.filter((snapshot) =>
    selectedParentKeys.has(snapshot.fundId),
  )
  const scopedUnresolved = unresolved.filter((item) =>
    selectedParentKeys.has(item.parentId),
  )

  const { fundValue, directIdentifiedValue, opaqueValue, statuslessFundIds } =
    classifyFundPositions(activePositions, statusByPosition)

  const portfolioValue = activePositions.reduce(
    (sum, position) => sum + positiveValue(position),
    0,
  )
  const decomposedValue = scopedStatuses.reduce(
    (sum, status) => sum + status.explainedValue,
    0,
  )
  const highConfidenceExplainedValue = scopedStatuses
    .filter(
      (status) => status.qualityTier === 'A' || status.qualityTier === 'B',
    )
    .reduce((sum, status) => sum + status.explainedValue, 0)
  const undisclosedFundValue = Math.max(0, fundValue - decomposedValue)
  const fundCoveragePct =
    fundValue > 0 ? (highConfidenceExplainedValue / fundValue) * 100 : 100
  const portfolioCoveragePct =
    portfolioValue > 0
      ? ((directIdentifiedValue + highConfidenceExplainedValue) /
          portfolioValue) *
        100
      : 0

  const {
    coverageGatePass,
    topFundsGatePass,
    exactProxyGatePass,
    repeatabilityGatePass,
    feasibilityStatus,
  } = evaluateFundQualityGates(scopedStatuses, fundValue, fundCoveragePct)

  return {
    holdings: scopedHoldings,
    statuses: scopedStatuses,
    snapshots: scopedSnapshots,
    unresolved: scopedUnresolved,
    notApplicableValue,
    report: baseReport
      ? {
          asOfDate: baseReport.asOfDate,
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
          issueCount: scopedStatuses.filter(
            (status) => status.validationStatus !== 'ok',
          ).length,
        }
      : null,
  }
}

function positiveValue(position: PositionRow): number {
  return position.status === 'active'
    ? Math.max(0, position.total_value ?? 0)
    : 0
}

function indexPositionsByIdentifiers(positions: PositionRow[]) {
  const index = {
    isin: new Map<string, PositionRow[]>(),
    ticker: new Map<string, PositionRow[]>(),
    name: new Map<string, PositionRow[]>(),
  }
  for (const position of positions) {
    for (const field of ['isin', 'ticker', 'name'] as const) {
      const key = position[field]
      if (!key) continue
      const matches = index[field].get(key) ?? []
      matches.push(position)
      index[field].set(key, matches)
    }
  }
  return index
}

function positionsForStatus(
  index: ReturnType<typeof indexPositionsByIdentifiers>,
  status: FundHoldingStatus,
): Set<PositionRow> {
  return new Set([
    ...(index.isin.get(status.parentIsin) ?? []),
    ...(index.isin.get(status.parentId) ?? []),
    ...(index.ticker.get(status.parentTicker) ?? []),
    ...(index.ticker.get(status.parentId) ?? []),
    ...(index.name.get(status.parentName) ?? []),
    ...(index.name.get(status.parentId) ?? []),
  ])
}

function clampRatio(percentage: number): number {
  return Math.max(0, Math.min(1, percentage / 100))
}

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; One exclusive classification partitions fund, direct and opaque values without distributing its accumulator.
function classifyFundPositions(
  activePositions: PositionRow[],
  statusByPosition: Map<PositionRow, FundHoldingStatus>,
) {
  let fundValue = 0
  let directIdentifiedValue = 0
  let opaqueValue = 0
  const statuslessFundIds = new Set<string>()
  for (const position of activePositions) {
    const value = positiveValue(position)
    const status = statusByPosition.get(position)
    if (status || isFundPosition(position)) {
      fundValue += value
      if (!status)
        statuslessFundIds.add(position.isin || position.ticker || position.name)
    } else if (position.isin || position.ticker) {
      directIdentifiedValue += value
    } else {
      opaqueValue += value
    }
  }

  return { fundValue, directIdentifiedValue, opaqueValue, statuslessFundIds }
}

function evaluateFundQualityGates(
  scopedStatuses: FundHoldingStatus[],
  fundValue: number,
  fundCoveragePct: number,
) {
  const ranked = [...scopedStatuses]
    .toSorted((a, b) => b.marketValue - a.marketValue)
    .slice(0, 7)
  const coverageGatePass = fundValue === 0 || fundCoveragePct >= 85
  const topFundsGatePass =
    ranked.length === 0 ||
    ranked.every(
      (status) =>
        (status.qualityTier === 'A' || status.qualityTier === 'B') &&
        status.explainedPct >= 98,
    )
  const exactProxyGatePass = scopedStatuses
    .filter((status) => status.qualityTier === 'B')
    .every((status) => !!status.indexName.trim() && !!status.proxyIsin.trim())
  const repeatabilityGatePass =
    ranked.length === 0 || ranked.every((status) => status.refreshStreak >= 2)
  const qualityGatesPass =
    coverageGatePass && topFundsGatePass && exactProxyGatePass
  let feasibilityStatus: FundCoverageReport['feasibilityStatus'] = 'limited'
  if (qualityGatesPass) {
    feasibilityStatus = repeatabilityGatePass
      ? 'passed'
      : 'pending_repeatability'
  }

  return {
    coverageGatePass,
    topFundsGatePass,
    exactProxyGatePass,
    repeatabilityGatePass,
    feasibilityStatus,
  }
}
