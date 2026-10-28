export type ManualPriceOverride = {
  name: string
  ticker: string
  isin: string
  price: number
  currency: string
  // An override without a start bound applies to all earlier dates.
  date_from: Date | null
  // An override without an end bound remains applicable afterward.
  date_to: Date | null
  source_file: string
}
