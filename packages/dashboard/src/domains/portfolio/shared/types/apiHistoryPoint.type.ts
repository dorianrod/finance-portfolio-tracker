// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
export type ApiHistoryPoint = {
  snapshot_date: Date
  total_value: number
  total_cost_basis: number
  unrealized_gain: number
  net_cash_injected: number
  cash_delta: number | null
  tri: number | null
  tri_rolling_1y: number | null
  tri_rolling_3y: number | null
}
