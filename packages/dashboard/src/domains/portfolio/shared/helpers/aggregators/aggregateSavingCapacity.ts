import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export type RawSavingCapacityRow = {
  snapshot_date: string
  savings_delta: number
  perf_delta: number
}

export type RawSavingCapacityByAccountRow = {
  snapshot_date: string
  account: string
  savings_delta: number
  perf_delta: number
}

export function mapSavingCapacity(rows: RawSavingCapacityRow[]): SavingCapacityPoint[] {
  return rows.map((r) => ({
    date: r.snapshot_date,
    savings_delta: r.savings_delta,
    perf_delta: r.perf_delta,
  }))
}

export function aggregateSavingCapacityByAccount(
  rows: RawSavingCapacityByAccountRow[],
  accountSet: Set<string>,
): SavingCapacityPoint[] {
  const filtered = rows.filter((r) => accountSet.has(r.account))
  const byDate = new Map<string, { savings_delta: number; perf_delta: number }>()
  for (const r of filtered) {
    const d = r.snapshot_date
    if (!byDate.has(d)) byDate.set(d, { savings_delta: 0, perf_delta: 0 })
    const entry = byDate.get(d)!
    entry.savings_delta += r.savings_delta
    entry.perf_delta += r.perf_delta
  }
  return Array.from(byDate.entries())
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date,
      savings_delta: Math.round(vals.savings_delta * 100) / 100,
      perf_delta: Math.round(vals.perf_delta * 100) / 100,
    }))
}
