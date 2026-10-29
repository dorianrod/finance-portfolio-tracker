import type { OperationType } from './operationType.type'
import type { RawPosition } from './rawPosition.type'
export type RowKind = 'position' | 'group' | 'operation'

export type OperationRow = {
  kind: 'operation'
  id: string
  date: Date
  account: string
  operation_type: OperationType
  // Cash and income operations may have no traded units.
  quantity: number | null
  // Cash and income operations may have no unit price.
  price_per_unit: number | null
  total_amount: number
  // Only sales have an applicable realized gain.
  realized_gain: number | null
}

export type GroupRow = {
  kind: 'group'
  groupType: 'trades' | 'dividends' | 'interest' | 'cash'
  id: string
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

// Closed positions have no current snapshot; nullable snapshot metrics stay unknown.
export type PositionRow = Pick<
  RawPosition,
  | 'name'
  | 'ticker'
  | 'isin'
  | 'account'
  | 'quantity'
  | 'last_price'
  | 'total_value'
  | 'unrealized_gain'
  | 'unrealized_gain_net'
  | 'unrealized_gain_pct'
  | 'realized_gain_net'
  | 'tax_rate'
  | 'total_dividends_net'
  | 'total_interest_net'
  | 'total_return_pct'
  | 'xirr'
  | 'xirr_rolling_3y'
  | 'xirr_rolling_period_years'
> & {
  kind: 'position'
  id: string
  account_type?: string
  account_category: RawPosition['account_category']
  status: 'active' | 'closed'
  operationTypes: Set<OperationType>
  realized_gain: number
  total_dividends: number
  total_interest: number
  total_realized_return: number
  total_invested: number
  subRows: GroupRow[]
}

export type TableRow = PositionRow | GroupRow | OperationRow
