import { latestSnapshotAt } from '@/domains/portfolio/shared/helpers/transformers/historicalFundHoldings/latestSnapshotAt'
import { historicalSnapshotsByParent } from '@/domains/portfolio/shared/helpers/transformers/historicalFundSnapshots/historicalSnapshotsByParent'
import { isFundPosition } from '@/domains/portfolio/shared/helpers/transformers/isFundPosition'
import { matchesFilters } from '@/domains/portfolio/shared/helpers/transformers/matchesFilters'
import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

import { concentrationPoint } from './concentrationPoint'
import { isPositiveHistoricalSnapshot } from './isPositiveHistoricalSnapshot'
import { selectConcentrationSnapshots } from './selectConcentrationSnapshots'

export function buildHistoricalLookThroughConcentration(
  rows: RawPosition[],
  history: HistoricalFundHolding[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
  atDates?: Date[],
): HistoricalConcentrationPoint[] {
  if (history.length === 0) return []
  const snapshotsByParent = historicalSnapshotsByParent(history)
  const byDate = groupPositionsByDate(rows, accountFilters, accountTypeFilters)

  const snapshots = atDates
    ? [...byDate.entries()].filter(([date, positions]) =>
        positions.some((position) =>
          latestSnapshotAt(
            snapshotsByParent.get(historicalPositionKey(position)),
            new Date(date),
          ),
        ),
      )
    : [...byDate.entries()]
  return selectConcentrationSnapshots(snapshots, atDates)
    .map(([date, positions]) =>
      buildDatedLookThroughPoint(date, positions, snapshotsByParent),
    )
    .filter(
      ({ hasApplicableHistoricalSnapshot }) => hasApplicableHistoricalSnapshot,
    )
    .map(({ point }) => point)
}

function groupPositionsByDate(
  rows: RawPosition[],
  accountFilters: Set<string>,
  accountTypeFilters: Set<string>,
) {
  const byDate = new Map<number, RawPosition[]>()
  for (const row of rows) {
    if (!isPositiveHistoricalSnapshot(row)) continue
    if (!matchesFilters(row, accountFilters, accountTypeFilters)) continue
    const current = byDate.get(row.snapshot_date.getTime()) ?? []
    current.push(row)
    byDate.set(row.snapshot_date.getTime(), current)
  }

  return byDate
}

type HistoricalSnapshots = ReturnType<typeof historicalSnapshotsByParent>
type AddAsset = (
  key: string,
  label: string,
  name: string,
  value: number,
) => void

function buildDatedLookThroughPoint(
  date: number,
  positions: RawPosition[],
  snapshotsByParent: HistoricalSnapshots,
) {
  const assets = new Map<
    string,
    { label: string; name: string; value: number }
  >()
  let hasApplicableHistoricalSnapshot = false
  let selectedValue = 0
  let identifiedValue = 0
  let undisclosedValue = 0
  let opaqueValue = 0

  const addAsset = (
    key: string,
    label: string,
    name: string,
    value: number,
  ) => {
    const current = assets.get(key) ?? { label, name, value: 0 }
    current.value += value
    assets.set(key, current)
  }

  for (const position of positions) {
    const value = position.total_value
    if (value == null) continue
    selectedValue += value
    const exposure = historicalPositionExposure(
      position,
      value,
      new Date(date),
      snapshotsByParent,
      addAsset,
    )
    hasApplicableHistoricalSnapshot ||= exposure.hasSnapshot
    identifiedValue += exposure.identified
    undisclosedValue += exposure.undisclosed
    opaqueValue += exposure.opaque
  }

  return {
    point: concentrationPoint(
      new Date(date),
      assets,
      selectedValue,
      identifiedValue,
      undisclosedValue,
      opaqueValue,
    ),
    hasApplicableHistoricalSnapshot,
  }
}

function historicalPositionExposure(
  position: RawPosition,
  value: number,
  date: Date,
  snapshotsByParent: HistoricalSnapshots,
  addAsset: AddAsset,
) {
  const parentKey = historicalPositionKey(position)
  const snapshot = latestSnapshotAt(snapshotsByParent.get(parentKey), date)
  if (snapshot) {
    return historicalFundExposure(snapshot, value, addAsset)
  }

  const directKey = position.isin.trim() || position.ticker.trim()
  if (!directKey) {
    return { identified: 0, undisclosed: 0, opaque: value, hasSnapshot: false }
  } else if (isFundPosition(position) || snapshotsByParent.has(parentKey)) {
    return { identified: 0, undisclosed: value, opaque: 0, hasSnapshot: false }
  }
  addAsset(
    directKey,
    historicalPositionLabel(position, directKey),
    historicalPositionName(position, directKey),
    value,
  )
  return { identified: value, undisclosed: 0, opaque: 0, hasSnapshot: false }
}

function historicalFundExposure(
  snapshot: NonNullable<ReturnType<typeof latestSnapshotAt>>,
  value: number,
  addAsset: AddAsset,
) {
  const disclosedWeight = snapshot.holdings.reduce(
    (sum, holding) => sum + holding.weight,
    0,
  )
  const scale = disclosedWeight > 1 ? 1 / disclosedWeight : 1
  for (const holding of snapshot.holdings) {
    addAsset(
      holding.issuerId || holding.holdingId,
      holding.issuerName || holding.holdingName,
      holding.issuerName || holding.holdingName,
      value * holding.weight * scale,
    )
  }
  const explainedWeight = Math.min(1, disclosedWeight)
  return {
    identified: value * explainedWeight,
    undisclosed: value * (1 - explainedWeight),
    opaque: 0,
    hasSnapshot: true,
  }
}

function historicalPositionKey(position: RawPosition) {
  return position.isin.trim() || position.ticker.trim() || position.name.trim()
}
function historicalPositionLabel(position: RawPosition, key: string) {
  return position.ticker.trim() || position.name.trim() || key
}
function historicalPositionName(position: RawPosition, key: string) {
  return position.name.trim() || position.ticker.trim() || key
}
