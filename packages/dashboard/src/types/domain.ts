export interface RawOperation {
  date: string
  account: string
  isin: string
  ticker: string
  name: string
  operation_type: string
  quantity: string
  price_per_unit: string
  total_amount: string
  currency: string
  realized_gain: string
}

export interface RawPosition {
  snapshot_date: string
  account: string
  account_type?: string
  account_category?: string
  isin: string
  ticker: string
  name: string
  quantity: string
  avg_buy_price: string
  last_price: string
  total_value: string
  unrealized_gain: string
  unrealized_gain_pct: string
  realized_gain: string
  total_dividends: string
  total_dividends_net: string
  total_interest: string
  total_interest_net: string
  tax_rate: string
  unrealized_gain_net: string
  realized_gain_net: string
  xirr: string
  total_return_pct: string
}

export type RowKind = 'position' | 'group' | 'operation'

export interface OperationRow {
  kind: 'operation'
  id: string
  date: string
  account: string
  operation_type: string
  quantity: number | null
  price_per_unit: number | null
  total_amount: number
  realized_gain: number | null
}

export interface GroupRow {
  kind: 'group'
  id: string
  label: string
  // dividends group
  total_dividends?: number
  dividend_count?: number
  annualized_dividends?: number
  // interest group
  total_interest?: number
  interest_count?: number
  // buy/sell group
  total_invested?: number
  total_sold?: number
  realized_pnl?: number
  trade_count?: number
  avg_buy_price?: number
  // deposits group (livret/savings)
  deposit_total?: number
  withdrawal_total?: number
  subRows: OperationRow[]
}

export interface PositionRow {
  kind: 'position'
  id: string
  name: string
  ticker: string
  isin: string
  account: string
  account_type?: string
  account_category?: string
  status: 'active' | 'closed'
  operationTypes: Set<string>
  total_value: number | null
  unrealized_gain: number | null
  unrealized_gain_net: number | null
  unrealized_gain_pct: number | null
  realized_gain: number
  realized_gain_net: number | null
  tax_rate: number | null
  total_dividends: number
  total_dividends_net: number | null
  total_interest: number
  total_interest_net: number | null
  total_realized_return: number
  total_invested: number
  total_return_pct: number | null
  xirr: number | null
  subRows: GroupRow[]
}

export type TableRow = PositionRow | GroupRow | OperationRow
