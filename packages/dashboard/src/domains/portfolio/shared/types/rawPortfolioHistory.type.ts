// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this validated, scoped history to overview comparisons, wealth analysis and performance. See SHARED_OWNERSHIP_AUDIT.md.
export type RawPortfolioHistory = {
  snapshot_date: Date
  total_value: number
  total_cost_basis: number
  unrealized_gain: number
  net_cash_injected: number
  // The first snapshot has no preceding cash-injection value.
  cash_delta: number | null
  // A return may be unsolvable for the available cash flows.
  tri: number | null
  // The rolling cash flows may not define a return.
  tri_rolling_1y: number | null
  // The rolling cash flows may not define a return.
  tri_rolling_3y: number | null
}
