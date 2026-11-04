export type AssetIrrItem = {
  key: string
  label: string
  name: string
  irr: number
  value: number
  accounts: string[]
  account_types: string[]
}

export type AssetIrrSummary = {
  available: boolean
  // No comparable interval exists when the summary is unavailable.
  start_date: Date | null
  // No comparable interval exists when the summary is unavailable.
  end_date: Date | null
  assets: AssetIrrItem[]
}
