import type { AllocationPoint } from '@/hooks/useAllocationData'

export function toLatestByIsin(rows: Record<string, string>[]): Map<string, { name: string; point: AllocationPoint }> {
  const byIsin = new Map<string, Record<string, string>[]>()
  const nameByIsin = new Map<string, string>()
  for (const row of rows) {
    const { isin, name } = row
    if (!isin) continue
    nameByIsin.set(isin, name)
    const arr = byIsin.get(isin) ?? []
    arr.push(row)
    byIsin.set(isin, arr)
  }
  const result = new Map<string, { name: string; point: AllocationPoint }>()
  for (const [isin, isinRows] of byIsin) {
    const latest = [...isinRows].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))[0]
    const categories = Object.entries(latest)
      .filter(([k]) => !['snapshot_date', 'isin', 'name'].includes(k))
      .map(([catName, val]) => ({ name: catName, value: parseFloat(val) || 0 }))
      .filter((c) => c.value > 0)
    categories.sort((a, b) => {
      if (a.name === 'nc') return 1
      if (b.name === 'nc') return -1
      return b.value - a.value
    })
    result.set(isin, {
      name: nameByIsin.get(isin) ?? isin,
      point: { date: latest.snapshot_date, categories },
    })
  }
  return result
}
