import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'

export type IncomeSummary = {
  dividends: number
  interest: number
  total: number
  previousTotal: number
  changePct: number | null
  dateFrom: Date | null
  dateTo: Date | null
}

export type PerformanceSummary = {
  currentValueNet: number
  currentValueGross: number
  unrealizedNet: number
  unrealizedGross: number
  realizedNet: number
  realizedGross: number
  incomeNet: number
  totalPerformanceGross: number
  totalPerformanceNet: number
  totalPerformancePct: number
}

export type TriChartPoint = PortfolioHistoryPoint & {
  tri_rolling_1y_backfill: number | null
  tri_rolling_3y_backfill: number | null
}

export type TopPerformer = {
  label: string
  name: string
  pct: number
  gain: number
  value: number
  account_type: string
}
