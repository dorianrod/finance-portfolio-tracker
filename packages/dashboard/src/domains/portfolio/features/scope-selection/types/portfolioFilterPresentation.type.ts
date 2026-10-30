export type FilterSummaryKey =
  'accounts' | 'period' | 'operations' | 'closed-positions'

export type FilterSummaryItem = {
  key: FilterSummaryKey
  label: string
}

export type FilterVisibility = {
  showPeriod: boolean
  showPositionFilters: boolean
}
