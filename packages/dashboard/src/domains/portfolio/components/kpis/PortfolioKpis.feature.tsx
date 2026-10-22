import type { IncomeSummary, PerformanceSummary } from '@/domains/portfolio/components/portfolio-charts/portfolioCharts.logic'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import { Kpi } from './Kpi.view'
import type { IrrStatus } from '@/domains/portfolio/types/history'
import { FilterScopeBadges } from '@/domains/portfolio/components/filters/FilterScopeBadges.feature'

const gainColor = (value: number | null) => value == null || value >= 0
  ? SEMANTIC_TEXT_CLASSES.performancePositive
  : SEMANTIC_TEXT_CLASSES.performanceNegative

export function NetPortfolioValueKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.currentValueNet)
  return (
    <Kpi.Root accent="portfolio">
      <Kpi.Label tooltip="Current market value after estimated tax on unrealized gains." tooltipFooter={<FilterScopeBadges account="filterable" period="as-of" />}>
        Net portfolio value
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>Gross {formatMoney(performance.currentValueGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function TotalNetPerformanceKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const value = formatMoney(performance.totalPerformanceNet)
  return (
    <Kpi.Root accent={performance.totalPerformanceNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Net unrealized and realized P&L plus net passive income." tooltipFooter={<FilterScopeBadges account="filterable" period="since-tracking" />}>
        Total net performance
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value color={gainColor(performance.totalPerformanceNet)} title={value}>{value}</Kpi.Value>
        <Kpi.InlineNote color={gainColor(performance.totalPerformanceNet)}>{formatPercentage(performance.totalPerformancePct, { signed: true })}</Kpi.InlineNote>
      </Kpi.ValueRow>
      <Kpi.Detail>Gross {formatMoney(performance.totalPerformanceGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetContributionsKpi({ value, periodLabel }: { value: number; periodLabel: string }) {
  const formatMoney = useFormatMoney()
  const formattedValue = formatMoney(value)
  return (
    <Kpi.Root accent="contributions">
      <Kpi.Label tooltip="Deposits minus withdrawals over the selected period." tooltipFooter={<FilterScopeBadges account="filterable" period="range" />}>
        Net contributions
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={SEMANTIC_TEXT_CLASSES.netContributions} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>{periodLabel}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function PassiveIncomeKpi({ income }: { income: IncomeSummary }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const value = formatMoney(income.total)
  return (
    <Kpi.Root accent="income">
      <Kpi.Label tooltip="Dividends and interest over the latest twelve months. The percentage compares this rolling total with the preceding twelve-month window." tooltipFooter={<FilterScopeBadges account="filterable" period="trailing-12m" />}>
        Passive income · trailing 12m
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value color={SEMANTIC_TEXT_CLASSES.passiveIncome} title={value}>{value}</Kpi.Value>
        <Kpi.InlineNote color={income.changePct == null ? 'text-gray-500' : gainColor(income.changePct)}>
          {income.changePct == null ? '—' : formatPercentage(income.changePct, { signed: true })}
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

function irrValue(value: number | null, status: IrrStatus, formatPercentage: ReturnType<typeof useFormatPercentage>): string {
  if (status === 'loading') return 'Calculating…'
  return value == null ? '—' : formatPercentage(value, { decimals: 2, signed: true })
}

function irrNote(status: IrrStatus): string | undefined {
  if (status === 'error') return 'Filtered IRR unavailable'
  return undefined
}

export function IrrSinceTrackingKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  const formatPercentage = useFormatPercentage()
  const formattedValue = irrValue(value, status, formatPercentage)
  const note = irrNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Annualized money-weighted return since the first recorded deposit, or since the first portfolio valuation when it predates the available cash-flow history." tooltipFooter={<FilterScopeBadges account="filterable" period="since-tracking" />}>
        IRR since tracking{scopeLabel ? ' · selected accounts' : ''}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(value)} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}

export function NetUnrealizedKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.unrealizedNet)
  return (
    <Kpi.Root accent={performance.unrealizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Current unrealized gain after estimated tax." tooltipFooter={<FilterScopeBadges account="filterable" period="as-of" />}>
        Net unrealized P&amp;L
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(performance.unrealizedNet)} title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>Gross {formatMoney(performance.unrealizedGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetRealizedKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.realizedNet)
  return (
    <Kpi.Root accent={performance.realizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Crystallized gains and losses after estimated tax." tooltipFooter={<FilterScopeBadges account="filterable" period="range" />}>
        Net realized P&amp;L
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(performance.realizedNet)} title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>Gross {formatMoney(performance.realizedGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function TrailingThreeYearIrrKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  const formatPercentage = useFormatPercentage()
  const formattedValue = irrValue(value, status, formatPercentage)
  const note = irrNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip="Annualized money-weighted return over the latest three years, accounting for deposits and withdrawals during the period." tooltipFooter={<FilterScopeBadges account="filterable" period="trailing-3y" />}>
        IRR · trailing 3y{scopeLabel ? ' · selected accounts' : ''}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={gainColor(value)} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}
