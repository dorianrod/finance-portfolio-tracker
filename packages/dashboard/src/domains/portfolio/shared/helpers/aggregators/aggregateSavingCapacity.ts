import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function mapSavingCapacity(
  rows: RawSavingCapacityRow[],
): SavingCapacityPoint[] {
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
  const byDate = new Map<
    number,
    { savings_delta: number; perf_delta: number }
  >()
  for (const r of filtered) {
    const d = r.snapshot_date
    if (!byDate.has(d.getTime()))
      byDate.set(d.getTime(), { savings_delta: 0, perf_delta: 0 })
    const entry = byDate.get(d.getTime())!
    entry.savings_delta += r.savings_delta
    entry.perf_delta += r.perf_delta
  }
  return Array.from(byDate.entries())
    .toSorted(([a], [b]) => a - b)
    .map(([date, vals]) => ({
      date: new Date(date),
      savings_delta: Math.round(vals.savings_delta * 100) / 100,
      perf_delta: Math.round(vals.perf_delta * 100) / 100,
    }))
}

export type RawSavingCapacityRow = {
  snapshot_date: Date
  savings_delta: number
  perf_delta: number
}

export type RawSavingCapacityByAccountRow = {
  snapshot_date: Date
  account: string
  savings_delta: number
  perf_delta: number
}
