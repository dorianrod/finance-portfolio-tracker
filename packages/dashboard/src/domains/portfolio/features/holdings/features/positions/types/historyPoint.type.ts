export type HistoryPoint = {
  date: Date
  value: number
  costBasis: number
  // A percentage return is undefined without a positive cost basis.
  pct: number | null
  last_price: number
}
