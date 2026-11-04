export type TrailingYearOverYear = {
  currentMonths: string[]
  comparisonMonths: string[]
  savings: YearOverYearMetric
  performance: YearOverYearMetric
}

export type YearOverYearMetric = {
  // Incomplete current-year month coverage cannot establish an annual total.
  current: number | null
  // Incomplete preceding-year month coverage prevents comparison.
  previous: number | null
  // A missing period or a zero preceding total can make percentage change undefined.
  changePct: number | null
}
