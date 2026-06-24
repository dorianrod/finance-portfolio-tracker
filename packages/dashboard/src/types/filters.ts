export interface Filters {
  accountTypes: Set<string>
  accounts: Set<string>
  operationTypes: Set<string>
  hideClosedPositions: boolean
  dateFrom?: string  // YYYY-MM-DD
  dateTo?: string    // YYYY-MM-DD
}

export type SortKey =
  | 'total_value'
  | 'unrealized_gain'
  | 'realized_gain'
  | 'total_realized_return'
  | 'total_dividends'
  | 'total_return_pct'
  | 'xirr'
