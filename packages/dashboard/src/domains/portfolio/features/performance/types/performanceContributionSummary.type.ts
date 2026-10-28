export type ContributionHorizon = 'since-tracking' | 'trailing-3y'

export type PerformanceContribution = {
  key: string
  label: string
  name: string
  amount: number
  share: number
  accounts: string[]
}

export type PerformanceContributionSummary = {
  horizon: ContributionHorizon
  available: boolean
  // No reporting window exists when there is insufficient scoped history.
  startDate: Date | null
  // The end snapshot is unknown when the contribution summary is unavailable.
  endDate: Date | null
  netContribution: number
  positiveTotal: number
  negativeTotal: number
  contributors: PerformanceContribution[]
  detractors: PerformanceContribution[]
}
