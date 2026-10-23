export type AccountScopeMode = 'filterable' | 'global'

export type PeriodScopeMode =
  | 'range'
  | 'comparison-range'
  | 'range-or-trailing-12m'
  | 'as-of'
  | 'trailing-12m'
  | 'trailing-3y'
  | 'since-tracking'
  | 'year-range'
  | 'latest'
  | 'mixed'

export interface FilterScopeSpec {
  account: AccountScopeMode
  period: PeriodScopeMode
  effectiveDate?: string | null
}
