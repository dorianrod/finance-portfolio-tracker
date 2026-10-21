import type { IncomeSummary, PerformanceSummary } from '@/features/portfolio-charts/portfolioCharts.logic'
import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { Kpi } from './Kpi'
import type { IrrStatus } from '@/types/history'

const gainColor = (value: number | null) => value == null || value >= 0
  ? SEMANTIC_TEXT_CLASSES.performancePositive
  : SEMANTIC_TEXT_CLASSES.performanceNegative

export function NetPortfolioValueKpi({ performance }: { performance: PerformanceSummary }) {
  return (
    <Kpi
      label="Net portfolio value"
      tooltip="Current market value after estimated tax on unrealized gains."
      value={fmt.format(performance.currentValueNet)}
      accent="portfolio"
      subSmall={`Gross ${fmt.format(performance.currentValueGross)}`}
      scope={{ account: 'filterable', period: 'as-of' }}
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
      accent={performance.totalPerformanceNet >= 0 ? 'positive' : 'negative'}
      sub={fmtPct(performance.totalPerformancePct)}
      subColor={gainColor(performance.totalPerformanceNet)}
      subSmall={`Gross ${fmt.format(performance.totalPerformanceGross)}`}
      subInline
      scope={{ account: 'filterable', period: 'since-tracking' }}
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
      accent="contributions"
      subSmall={periodLabel}
      scope={{ account: 'filterable', period: 'range' }}
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
      accent="income"
      sub={income.changePct == null ? '—' : fmtPct(income.changePct)}
      subColor={income.changePct == null ? 'text-gray-500' : gainColor(income.changePct)}
      subInline
      scope={{ account: 'filterable', period: 'trailing-12m' }}
    />
  )
}

interface IrrKpiProps {
  value: number | null
  status?: IrrStatus
  scopeLabel?: string
}

function irrValue(value: number | null, status: IrrStatus): string {
  if (status === 'loading') return 'Calculating…'
  return value == null ? '—' : fmtPct(value, 2)
}

function irrNote(status: IrrStatus): string | undefined {
  if (status === 'error') return 'Filtered IRR unavailable'
  return undefined
}

export function IrrSinceTrackingKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  return (
    <Kpi
      label={`IRR since tracking${scopeLabel ? ' · selected accounts' : ''}`}
      tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history."
      value={irrValue(value, status)}
      valueColor={gainColor(value)}
      accent={value == null || value >= 0 ? 'positive' : 'negative'}
      subSmall={irrNote(status)}
      scope={{ account: 'filterable', period: 'since-tracking' }}
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
      accent={performance.unrealizedNet >= 0 ? 'positive' : 'negative'}
      subSmall={`Gross ${fmt.format(performance.unrealizedGross)}`}
      scope={{ account: 'filterable', period: 'as-of' }}
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
      accent={performance.realizedNet >= 0 ? 'positive' : 'negative'}
      subSmall={`Gross ${fmt.format(performance.realizedGross)}`}
      scope={{ account: 'filterable', period: 'range' }}
    />
  )
}

export function TrailingThreeYearIrrKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  return (
    <Kpi
      label={`IRR · trailing 3y${scopeLabel ? ' · selected accounts' : ''}`}
      tooltip="Annualized money-weighted return over the latest three years, accounting for deposits and withdrawals during the period."
      value={irrValue(value, status)}
      valueColor={gainColor(value)}
      accent={value == null || value >= 0 ? 'positive' : 'negative'}
      subSmall={irrNote(status)}
      scope={{ account: 'filterable', period: 'trailing-3y' }}
    />
  )
}
