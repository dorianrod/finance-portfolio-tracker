export interface RawPortfolioHistory {
  snapshot_date: string
  total_value: string
  total_cost_basis: string
  unrealized_gain: string
  net_cash_injected: string
  cash_delta: string
  tri: string
}

export interface PortfolioHistoryPoint {
  date: string
  total_value: number
  total_cost_basis: number
  unrealized_gain: number
  net_cash_injected: number
  cash_delta: number | null
  tri: number | null
  total_broker_cash?: number
}

export interface AccountTypePoint {
  account_type: string
  total_cost_basis: number
  unrealized_gain: number
  total_value: number
}
