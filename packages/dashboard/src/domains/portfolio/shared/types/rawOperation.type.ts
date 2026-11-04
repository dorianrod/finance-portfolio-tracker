import type { OperationType } from './operationType.type'
export type RawOperation = {
  date: Date
  account: string
  isin: string
  ticker: string
  name: string
  operation_type: OperationType
  quantity: number
  price_per_unit: number
  total_amount: number
  currency: string
  realized_gain: number
}
