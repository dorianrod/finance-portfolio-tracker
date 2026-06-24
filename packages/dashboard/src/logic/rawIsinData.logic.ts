export interface RawIsinRow {
  snapshot_date: string
  isin: string
  name: string
  values: Record<string, number>
}

export function toRawRows(rows: Record<string, string>[]): RawIsinRow[] {
  return rows
    .filter((r) => r.isin)
    .map((r) => ({
      snapshot_date: r.snapshot_date,
      isin: r.isin,
      name: r.name,
      values: Object.fromEntries(
        Object.entries(r)
          .filter(([k]) => !['snapshot_date', 'isin', 'name'].includes(k))
          .map(([k, v]) => [k, parseFloat(v) || 0])
          .filter(([, v]) => (v as number) > 0),
      ),
    }))
}
