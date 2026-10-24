export type RawPortfolioHistory = {
  snapshot_date: string
  total_value: number
  total_cost_basis: number
  unrealized_gain: number
  net_cash_injected: number
  cash_delta: number | null
  tri: number | null
  tri_rolling_1y: number | null
  tri_rolling_3y: number | null
}
