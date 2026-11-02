import type { HistoryPoint } from '@/domains/portfolio/features/holdings/features/positions/types/historyPoint.type'
import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

// Aggregates raw per-account-per-date rows into one time series per asset
// (isin/ticker/name), summing value/cost basis across accounts that hold
// the same asset on the same date.
export function buildPositionsHistory(
  rows: RawPositionsHistoryRow[],
): HistoryMap {
  const map: HistoryMap = new Map()
  for (const row of rows) {
    const key = row.isin || row.ticker || row.name
    if (!key) continue
    const point = toHistoryPoint(row)
    if (!point) continue
    const points = map.get(key) ?? []
    points.push(point)
    map.set(key, points)
  }

  // sort by date asc, aggregate across accounts by summing value/costBasis
  const result: HistoryMap = new Map()
  for (const [key, points] of map) {
    result.set(key, aggregateHistoryDates(points))
  }
  return result
}

export type RawPositionsHistoryRow = Pick<
  RawPosition,
  | 'snapshot_date'
  | 'account'
  | 'isin'
  | 'ticker'
  | 'name'
  | 'total_value'
  | 'avg_buy_price'
  | 'quantity'
  | 'last_price'
  | 'unrealized_gain_pct'
>

export type HistoryMap = Map<string, HistoryPoint[]>

function toHistoryPoint(row: RawPositionsHistoryRow): HistoryPoint | null {
  const { total_value: value, avg_buy_price: price, quantity } = row
  if (value == null || price == null || quantity == null) return null
  return {
    date: row.snapshot_date,
    value,
    costBasis: Math.round(price * quantity * 100) / 100,
    pct: row.unrealized_gain_pct,
    last_price: row.last_price ?? 0,
  }
}

function aggregateHistoryDates(points: HistoryPoint[]): HistoryPoint[] {
  const byDate = new Map<
    number,
    {
      value: number
      costBasis: number
      // A source snapshot may have no defined return percentage.
      pct: number | null
      last_price: number
    }
  >()
  for (const p of points) {
    const existing = byDate.get(p.date.getTime())
    if (existing) {
      existing.value += p.value
      existing.costBasis += p.costBasis
    } else {
      byDate.set(p.date.getTime(), {
        value: p.value,
        costBasis: p.costBasis,
        pct: p.pct,
        last_price: p.last_price,
      })
    }
  }
  return [...byDate.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([date, v]) => ({ date: new Date(date), ...v }))
}
