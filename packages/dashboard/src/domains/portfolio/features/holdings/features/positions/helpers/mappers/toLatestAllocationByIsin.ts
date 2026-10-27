import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { RawIsinRow } from '@/domains/portfolio/shared/types/rawIsinRow.type'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Latest-date selection and same-date allocation coalescing implement one canonical per-identifier breakdown.
export function toLatestByIsin(
  rows: RawIsinRow[],
): Map<string, { name: string; point: AllocationPoint }> {
  const latestByIsin = new Map<
    string,
    { timestamp: number; name: string; values: Map<string, number> }
  >()
  for (const row of rows) {
    if (!row.isin) continue
    const timestamp = row.snapshot_date.getTime()
    let latest = latestByIsin.get(row.isin)
    if (latest && latest.timestamp > timestamp) continue
    if (!latest || latest.timestamp < timestamp) {
      latest = { timestamp, name: row.name, values: new Map() }
      latestByIsin.set(row.isin, latest)
    }
    for (const [name, value] of Object.entries(row.values)) {
      latest.values.set(name, (latest.values.get(name) ?? 0) + value)
    }
  }
  const result = new Map<string, { name: string; point: AllocationPoint }>()
  for (const [isin, latest] of latestByIsin) {
    const categories = [...latest.values]
      .map(([name, value]) => ({ name, value }))
      .filter((category) => category.value > 0)
      .toSorted((left, right) => {
        if (left.name === 'nc') return 1
        if (right.name === 'nc') return -1
        return right.value - left.value
      })
    result.set(isin, {
      name: latest.name,
      point: { date: new Date(latest.timestamp), categories },
    })
  }
  return result
}
