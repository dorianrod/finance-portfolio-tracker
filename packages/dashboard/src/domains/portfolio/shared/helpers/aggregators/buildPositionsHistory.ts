import type { HistoryPoint } from '@/domains/portfolio/shared/types/historyPoint.type'

export type RawPositionsHistoryRow = {
  snapshot_date: string
  account: string
  isin: string
  ticker: string
  name: string
  total_value: number | null
  avg_buy_price: number | null
  quantity: number | null
  last_price: number | null
  unrealized_gain_pct: number | null
}

export type HistoryMap = Map<string, HistoryPoint[]>

// Aggregates raw per-account-per-date rows into one time series per asset
// (isin/ticker/name), summing value/cost basis across accounts that hold
// the same asset on the same date.
export function buildPositionsHistory(rows: RawPositionsHistoryRow[]): HistoryMap {
  const map: HistoryMap = new Map()
  for (const row of rows) {
    const key = row.isin || row.ticker || row.name
    if (!key) continue
    const val = row.total_value
    const avgP = row.avg_buy_price
    const qty = row.quantity
    const lp = row.last_price
    if (val == null || avgP == null || qty == null) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push({
      date: row.snapshot_date,
      value: val,
      costBasis: Math.round(avgP * qty * 100) / 100,
      pct: row.unrealized_gain_pct,
      last_price: lp ?? 0,
    })
  }

  // sort by date asc, aggregate across accounts by summing value/costBasis
  const result: HistoryMap = new Map()
  for (const [key, points] of map) {
    const byDate = new Map<string, { value: number; costBasis: number; pct: number | null; last_price: number }>()
    for (const p of points) {
      const existing = byDate.get(p.date)
      if (existing) {
        existing.value += p.value
        existing.costBasis += p.costBasis
      } else {
        byDate.set(p.date, { value: p.value, costBasis: p.costBasis, pct: p.pct, last_price: p.last_price })
      }
    }
    result.set(key, [...byDate.entries()]
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))
    )
  }
  return result
}
