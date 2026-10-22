import type { IncomeSummary, PerformanceSummary } from '@/features/portfolio-charts/portfolioCharts.logic'
import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { Kpi } from './Kpi'
import type { IrrStatus } from '@/types/history'

const gainColor = (value: number | null) => value == null || value >= 0
  ? SEMANTIC_TEXT_CLASSES.performancePositive
  : SEMANTIC_TEXT_CLASSES.performanceNegative

export function NetPortfolioValueKpi({ performance }: { performance: PerformanceSummary }) {
  const value = fmt.format(performance.currentValueNet)
  return (
    <Kpi.Root accent="portfolio">
      <Kpi.Label tooltip="Current market value after estimated tax on unrealized gains." scope={{ account: 'filterable', period: 'as-of' }}>
        Net portfolio value
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>Gross {fmt.format(performance.currentValueGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function TotalNetPerformanceKpi({ performance }: { performance: PerformanceSummary }) {
  const value = fmt.format(performance.totalPerformanceNet)
  return (
    <Kpi.Root accent={performance.totalPerformanceNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Net unrealized and realized P&L plus net passive income." scope={{ account: 'filterable', period: 'since-tracking' }}>
        Total net performance
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value color={gainColor(performance.totalPerformanceNet)} title={value}>{value}</Kpi.Value>
        <Kpi.InlineNote color={gainColor(performance.totalPerformanceNet)}>{fmtPct(performance.totalPerformancePct)}</Kpi.InlineNote>
      </Kpi.ValueRow>
      <Kpi.Detail>Gross {fmt.format(performance.totalPerformanceGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetContributionsKpi({ value, periodLabel }: { value: number; periodLabel: string }) {
  const formattedValue = fmt.format(value)
  return (
    <Kpi.Root accent="contributions">
      <Kpi.Label tooltip="Deposits minus withdrawals over the selected period." scope={{ account: 'filterable', period: 'range' }}>
        Net contributions
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={SEMANTIC_TEXT_CLASSES.netContributions} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>{periodLabel}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function PassiveIncomeKpi({ income }: { income: IncomeSummary }) {
  const value = fmt.format(income.total)
  return (
    <Kpi.Root accent="income">
      <Kpi.Label tooltip="Dividends and interest over the latest twelve months. The percentage compares this rolling total with the preceding twelve-month window." scope={{ account: 'filterable', period: 'trailing-12m' }}>
        Passive income · trailing 12m
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value color={SEMANTIC_TEXT_CLASSES.passiveIncome} title={value}>{value}</Kpi.Value>
        <Kpi.InlineNote color={income.changePct == null ? 'text-gray-500' : gainColor(income.changePct)}>
          {income.changePct == null ? '—' : fmtPct(income.changePct)}
        </Kpi.InlineNote>
      </Kpi.ValueRow>
    </Kpi.Root>
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
  const formattedValue = irrValue(value, status)
  const note = irrNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history." scope={{ account: 'filterable', period: 'since-tracking' }}>
        IRR since tracking{scopeLabel ? ' · selected accounts' : ''}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(value)} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}

export function NetUnrealizedKpi({ performance }: { performance: PerformanceSummary }) {
  const value = fmt.format(performance.unrealizedNet)
  return (
    <Kpi.Root accent={performance.unrealizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Current unrealized gain after estimated tax." scope={{ account: 'filterable', period: 'as-of' }}>
        Net unrealized P&amp;L
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(performance.unrealizedNet)} title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>Gross {fmt.format(performance.unrealizedGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetRealizedKpi({ performance }: { performance: PerformanceSummary }) {
  const value = fmt.format(performance.realizedNet)
  return (
    <Kpi.Root accent={performance.realizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Crystallized gains and losses after estimated tax." scope={{ account: 'filterable', period: 'range' }}>
        Net realized P&amp;L
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(performance.realizedNet)} title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>Gross {fmt.format(performance.realizedGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function TrailingThreeYearIrrKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  const formattedValue = irrValue(value, status)
  const note = irrNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Annualized money-weighted return over the latest three years, accounting for deposits and withdrawals during the period." scope={{ account: 'filterable', period: 'trailing-3y' }}>
        IRR · trailing 3y{scopeLabel ? ' · selected accounts' : ''}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(value)} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}
