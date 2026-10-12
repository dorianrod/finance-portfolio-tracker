import type { IncomeSummary, PerformanceSummary } from '@/features/portfolio-charts/portfolioCharts.logic'
import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { Kpi } from './Kpi'

const gainColor = (value: number | null) => value == null || value >= 0
  ? SEMANTIC_TEXT_CLASSES.performancePositive
  : SEMANTIC_TEXT_CLASSES.performanceNegative

export function NetPortfolioValueKpi({ performance }: { performance: PerformanceSummary }) {
  return (
    <Kpi
      label="Net portfolio value"
      tooltip="Current market value after estimated tax on unrealized gains."
      value={fmt.format(performance.currentValueNet)}
      subSmall={`Gross ${fmt.format(performance.currentValueGross)}`}
    />
  )
}

export function TotalNetPerformanceKpi({ performance }: { performance: PerformanceSummary }) {
  return (
    <Kpi
      label="Total net performance"
      tooltip="Net unrealized and realized P&L plus net passive income."
      value={fmt.format(performance.totalPerformanceNet)}
      valueColor={gainColor(performance.totalPerformanceNet)}
      sub={fmtPct(performance.totalPerformancePct)}
      subColor={gainColor(performance.totalPerformanceNet)}
      subSmall={`Gross ${fmt.format(performance.totalPerformanceGross)}`}
      subInline
    />
  )
}

export function NetContributionsKpi({ value, periodLabel }: { value: number; periodLabel: string }) {
  return (
    <Kpi
      label="Net contributions"
      tooltip="Deposits minus withdrawals over the selected period."
      value={fmt.format(value)}
      valueColor={SEMANTIC_TEXT_CLASSES.netContributions}
      subSmall={periodLabel}
    />
  )
}

export function PassiveIncomeKpi({ income }: { income: IncomeSummary }) {
  return (
    <Kpi
      label="Passive income · trailing 12m"
      tooltip="Dividends and interest over the latest twelve months. The percentage compares this rolling total with the preceding twelve-month window."
      value={fmt.format(income.total)}
      valueColor={SEMANTIC_TEXT_CLASSES.passiveIncome}
      sub={income.changePct == null ? '—' : fmtPct(income.changePct)}
      subColor={income.changePct == null ? 'text-gray-500' : gainColor(income.changePct)}
      subInline
    />
  )
}

export function IrrSinceTrackingKpi({ value }: { value: number | null }) {
  return (
    <Kpi
      label="IRR since tracking"
      tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history."
      value={value == null ? '—' : fmtPct(value, 2)}
      valueColor={gainColor(value)}
    />
  )
}

export function NetUnrealizedKpi({ performance }: { performance: PerformanceSummary }) {
  return (
    <Kpi
      label="Net unrealized P&L"
      tooltip="Current unrealized gain after estimated tax."
      value={fmt.format(performance.unrealizedNet)}
      valueColor={gainColor(performance.unrealizedNet)}
      subSmall={`Gross ${fmt.format(performance.unrealizedGross)}`}
    />
  )
}

export function NetRealizedKpi({ performance }: { performance: PerformanceSummary }) {
  return (
    <Kpi
      label="Net realized P&L"
      tooltip="Crystallized gains and losses after estimated tax."
      value={fmt.format(performance.realizedNet)}
      valueColor={gainColor(performance.realizedNet)}
      subSmall={`Gross ${fmt.format(performance.realizedGross)}`}
    />
  )
}

export function TrailingThreeYearIrrKpi({ value }: { value: number | null }) {
  return (
    <Kpi
      label="IRR · trailing 3y"
      tooltip="Annualized money-weighted return over the latest three years, accounting for deposits and withdrawals during the period."
      value={value == null ? '—' : fmtPct(value, 2)}
      valueColor={gainColor(value)}
    />
  )
}
