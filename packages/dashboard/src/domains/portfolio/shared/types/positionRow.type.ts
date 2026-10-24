import type { OperationType } from './operationType.type'
export type RowKind = 'position' | 'group' | 'operation'

export type OperationRow = {
  kind: 'operation'
  id: string
  date: Date
  account: string
  operation_type: OperationType
  quantity: number | null
  price_per_unit: number | null
  total_amount: number
  realized_gain: number | null
}

export type GroupRow = {
  kind: 'group'
  groupType: 'trades' | 'dividends' | 'interest' | 'cash'
  id: string
  label: string
  total_dividends?: number
  dividend_count?: number
  annualized_dividends?: number
  total_interest?: number
  interest_count?: number
  total_invested?: number
  total_sold?: number
  realized_pnl?: number
  trade_count?: number
  avg_buy_price?: number
  deposit_total?: number
  withdrawal_total?: number
  subRows: OperationRow[]
}

export type PositionRow = {
  kind: 'position'
  id: string
  name: string
  ticker: string
  isin: string
  account: string
  account_type?: string
  account_category?: string
  status: 'active' | 'closed'
  operationTypes: Set<OperationType>
  quantity: number | null
  last_price: number | null
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
  xirr_rolling_3y: number | null
  xirr_rolling_period_years: number | null
  subRows: GroupRow[]
}

export type TableRow = PositionRow | GroupRow | OperationRow
