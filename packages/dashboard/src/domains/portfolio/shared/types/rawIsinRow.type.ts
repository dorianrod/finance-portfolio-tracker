export type RawIsinRow = {
  snapshot_date: string
  account?: string
  account_type?: string
  isin: string
  name: string
  values: Record<string, number>
}
