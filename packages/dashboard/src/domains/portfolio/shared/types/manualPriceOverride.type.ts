export type ManualPriceOverride = {
  name: string
  ticker: string
  isin: string
  price: number
  currency: string
  date_from: Date | null
  date_to: Date | null
  source_file: string
}
