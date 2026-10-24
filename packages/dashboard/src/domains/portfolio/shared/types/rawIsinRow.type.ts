export type RawIsinRow = {
  snapshot_date: Date
  account?: string
  account_type?: string
  isin: string
  name: string
  values: Record<string, number>
}
