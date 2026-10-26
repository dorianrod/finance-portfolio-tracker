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
  start_date: Date | null
  end_date: Date | null
  assets: AssetIrrItem[]
}
