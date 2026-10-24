export type RawPosition = {
  snapshot_date: string
  account: string
  account_type: string
  account_category: string
  isin: string
  ticker: string
  name: string
  quantity: number | null
  avg_buy_price: number | null
  last_price: number | null
  total_value: number | null
  unrealized_gain: number | null
  unrealized_gain_pct: number | null
  realized_gain: number | null
  total_dividends: number | null
  total_dividends_net: number | null
  total_interest: number | null
  total_interest_net: number | null
  tax_rate: number | null
  unrealized_gain_net: number | null
  realized_gain_net: number | null
  xirr: number | null
  xirr_rolling_3y: number | null
  xirr_rolling_period_years: number | null
  total_return_pct: number | null
}

export type RawPositionRow = Pick<
  RawPosition,
  | 'snapshot_date'
  | 'account'
  | 'account_type'
  | 'account_category'
  | 'quantity'
  | 'avg_buy_price'
  | 'total_value'
  | 'unrealized_gain'
>
