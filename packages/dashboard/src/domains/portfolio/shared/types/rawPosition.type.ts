export type RawPosition = {
  snapshot_date: Date
  account: string
  account_type: string
  account_category: string
  isin: string
  ticker: string
  name: string
  // A partial source snapshot may omit the unit count.
  quantity: number | null
  // Acquisition cost may be absent from a source snapshot.
  avg_buy_price: number | null
  // A source snapshot may lack a unit-price quote.
  last_price: number | null
  // An incomplete source valuation must stay unknown rather than become zero.
  total_value: number | null
  // A source snapshot may omit its valuation gain.
  unrealized_gain: number | null
  // No percentage is defined without a positive cost basis.
  unrealized_gain_pct: number | null
  // Older position exports may omit cumulative sale proceeds.
  realized_gain: number | null
  // Older position exports may omit cumulative dividends.
  total_dividends: number | null
  // Net dividends are unavailable without the gross amount or tax data.
  total_dividends_net: number | null
  // Older position exports may omit cumulative interest.
  total_interest: number | null
  // Net interest is unavailable without the gross amount or tax data.
  total_interest_net: number | null
  // Older source snapshots may omit the applicable tax rate.
  tax_rate: number | null
  // Net gain is unknown when its valuation or tax data is absent.
  unrealized_gain_net: number | null
  // Net realized gain may be absent from older exports.
  realized_gain_net: number | null
  // Cash products and cash flows without a solvable return have no XIRR.
  xirr: number | null
  // Cash products and unsolvable rolling cash flows have no rolling XIRR.
  xirr_rolling_3y: number | null
  // No rolling horizon exists for excluded products or missing cash-flow history.
  xirr_rolling_period_years: number | null
  // Cash products or positions without invested capital have no return percentage.
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
