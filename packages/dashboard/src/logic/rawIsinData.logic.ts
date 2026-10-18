export interface RawIsinRow {
  snapshot_date: string
  account?: string
  account_type?: string
  isin: string
  name: string
  values: Record<string, number>
}

const METADATA_COLUMNS = new Set(['snapshot_date', 'account', 'account_type', 'isin', 'name'])

export function toRawRows(rows: Record<string, string>[]): RawIsinRow[] {
  return rows
    .filter((r) => r.isin)
    .map((r) => ({
      snapshot_date: r.snapshot_date,
      ...(r.account ? { account: r.account } : {}),
      ...(r.account_type ? { account_type: r.account_type } : {}),
      isin: r.isin,
      name: r.name,
      values: Object.fromEntries(
        Object.entries(r)
          .filter(([k]) => !METADATA_COLUMNS.has(k))
          .map(([k, v]) => [k, parseFloat(v) || 0])
          .filter(([, v]) => (v as number) > 0),
      ),
    }))
}
