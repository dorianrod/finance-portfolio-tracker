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
  start_date: string | null
  end_date: string | null
  assets: AssetIrrItem[]
}
