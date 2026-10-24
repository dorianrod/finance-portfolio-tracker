export type RawOperation = {
  date: string
  account: string
  isin: string
  ticker: string
  name: string
  operation_type: string
  quantity: number
  price_per_unit: number
  total_amount: number
  currency: string
  realized_gain: number
}
