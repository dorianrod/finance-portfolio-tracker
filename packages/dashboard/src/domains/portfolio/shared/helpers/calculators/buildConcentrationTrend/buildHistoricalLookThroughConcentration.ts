import type { HistoricalFundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { HistoricalConcentrationPoint } from '@/domains/portfolio/shared/types/historicalConcentrationPoint.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

import { concentrationPoint } from './concentrationPoint'
import { historicalSnapshotsByParent } from './historicalSnapshotsByParent'
import { latestSnapshotAt } from './latestSnapshotAt'
import { matchesFilters } from './matchesFilters'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Historical snapshot applicability and account scope define one look-through history pipeline.
export function buildHistoricalLookThroughConcentration(
  rows: RawPosition[],
  history: HistoricalFundHolding[],
  accountFilters: Set<string> = new Set(),
  accountTypeFilters: Set<string> = new Set(),
): HistoricalConcentrationPoint[] {
  if (history.length === 0) return []
  const snapshotsByParent = historicalSnapshotsByParent(history)
  const byDate = new Map<number, RawPosition[]>()
  for (const row of rows) {
    if (
      row.snapshot_date == null ||
      !matchesFilters(row, accountFilters, accountTypeFilters)
    )
      continue
    const value = row.total_value
    if (value == null || !Number.isFinite(value) || value <= 0) continue
    const current = byDate.get(row.snapshot_date.getTime()) ?? []
    current.push(row)
    byDate.set(row.snapshot_date.getTime(), current)
  }

  return (
    [...byDate.entries()]
      .toSorted(([left], [right]) => left - right)
      // eslint-disable-next-line complexity -- reviewed: 2026-10-27; Each dated accumulator conserves identified, undisclosed and opaque totals against the same selected value.
      .map(([date, positions]) => {
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
          const parentKey =
            position.isin.trim() ||
            position.ticker.trim() ||
            position.name.trim()
          const snapshot = latestSnapshotAt(
            snapshotsByParent.get(parentKey),
            new Date(date),
          )
          if (snapshot) {
            hasApplicableHistoricalSnapshot = true
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
            identifiedValue += value * explainedWeight
            undisclosedValue += value * (1 - explainedWeight)
            continue
          }

          const directKey = position.isin.trim() || position.ticker.trim()
          if (!directKey) {
            opaqueValue += value
          } else if (
            isFundPosition(position) ||
            snapshotsByParent.has(parentKey)
          ) {
            undisclosedValue += value
          } else {
            addAsset(
              directKey,
              position.ticker.trim() || position.name.trim() || directKey,
              position.name.trim() || position.ticker.trim() || directKey,
              value,
            )
            identifiedValue += value
          }
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
      })
      .filter(
        ({ hasApplicableHistoricalSnapshot }) =>
          hasApplicableHistoricalSnapshot,
      )
      .map(({ point }) => point)
  )
}

function isFundPosition(row: RawPosition): boolean {
  return (
    /\b(?:ETF|UCITS|FUND|FCP|FCPE|SICAV|OPCVM|PEE|PEI|PERCO)\b/i.test(
      row.name,
    ) ||
    /^(?:Amundi|BNP Paribas Easy|Global X|iShares|L&G|Xtrackers|DWS|SPDR|Vanguard|Invesco|UBS|HSBC)\b/i.test(
      row.name,
    )
  )
}
