import i18n from '@/i18n/i18n'
import type { IncomeSummary, PerformanceSummary } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import { Kpi } from './Kpi.view'
import type { IrrStatus } from '@/domains/portfolio/shared/types/history'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { getPerformanceColor } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceColor'
import { formatIrrKpiValue } from './helpers/formatters/formatIrrKpiValue'
import { getIrrKpiNote } from './helpers/presenters/getIrrKpiNote'

export function NetPortfolioValueKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.currentValueNet)
  return (
    <Kpi.Root accent="portfolio">
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.currentMarketValueAfterEstimatedTaxOnUnrealizedGains')} tooltipFooter={<FilterScopeBadges account="filterable" period="as-of" />}>

        {i18n.t('ui.portfoliokpis.netPortfolioValue')}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>{i18n.t('ui.portfoliokpis.gross')} {formatMoney(performance.currentValueGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function TotalNetPerformanceKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const value = formatMoney(performance.totalPerformanceNet)
  return (
    <Kpi.Root accent={performance.totalPerformanceNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.netUnrealizedAndRealizedPLPlusNetPassive')} tooltipFooter={<FilterScopeBadges account="filterable" period="since-tracking" />}>

        {i18n.t('ui.portfoliokpis.totalNetPerformance')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value color={getPerformanceColor(performance.totalPerformanceNet)} title={value}>{value}</Kpi.Value>
        <Kpi.InlineNote color={getPerformanceColor(performance.totalPerformanceNet)}>{formatPercentage(performance.totalPerformancePct, { signed: true })}</Kpi.InlineNote>
      </Kpi.ValueRow>
      <Kpi.Detail>{i18n.t('ui.portfoliokpis.gross')} {formatMoney(performance.totalPerformanceGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetContributionsKpi({ value, periodLabel }: { value: number; periodLabel: string }) {
  const formatMoney = useFormatMoney()
  const formattedValue = formatMoney(value)
  return (
    <Kpi.Root accent="contributions">
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.depositsMinusWithdrawalsOverTheSelectedPeriod')} tooltipFooter={<FilterScopeBadges account="filterable" period="range" />}>

        {i18n.t('ui.portfoliokpis.netContributions')}
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
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.dividendsAndInterestOverTheLatestTwelveMonthsThe')} tooltipFooter={<FilterScopeBadges account="filterable" period="trailing-12m" />}>

        {i18n.t('ui.portfoliokpis.passiveIncomeTrailing12m')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value color={SEMANTIC_TEXT_CLASSES.passiveIncome} title={value}>{value}</Kpi.Value>
        <Kpi.InlineNote color={income.changePct == null ? 'text-gray-500' : getPerformanceColor(income.changePct)}>
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

export function IrrSinceTrackingKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  const formatPercentage = useFormatPercentage()
  const formattedValue = formatIrrKpiValue(value, status, formatPercentage)
  const note = getIrrKpiNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.annualizedMoneyWeightedReturnSinceTheFirstRecordedDeposit')} tooltipFooter={<FilterScopeBadges account="filterable" period="since-tracking" />}>

        {scopeLabel
          ? i18n.t('ui.portfoliokpis.irrSinceTrackingSelectedAccounts')
          : i18n.t('ui.portfoliokpis.irrSinceTracking')}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={getPerformanceColor(value)} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}

export function NetUnrealizedKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.unrealizedNet)
  return (
    <Kpi.Root accent={performance.unrealizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.currentUnrealizedGainAfterEstimatedTax')} tooltipFooter={<FilterScopeBadges account="filterable" period="as-of" />}>

        {i18n.t('ui.portfoliokpis.netUnrealizedPandl')}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={getPerformanceColor(performance.unrealizedNet)} title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>{i18n.t('ui.portfoliokpis.gross')} {formatMoney(performance.unrealizedGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetRealizedKpi({ performance }: { performance: PerformanceSummary }) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.realizedNet)
  return (
    <Kpi.Root accent={performance.realizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.crystallizedGainsAndLossesAfterEstimatedTax')} tooltipFooter={<FilterScopeBadges account="filterable" period="range" />}>

        {i18n.t('ui.portfoliokpis.netRealizedPandl')}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={getPerformanceColor(performance.realizedNet)} title={value}>{value}</Kpi.Value></Kpi.ValueRow>
      <Kpi.Detail>{i18n.t('ui.portfoliokpis.gross')} {formatMoney(performance.realizedGross)}</Kpi.Detail>
    </Kpi.Root>
  )
}

export function TrailingThreeYearIrrKpi({ value, status = 'ready', scopeLabel }: IrrKpiProps) {
  const formatPercentage = useFormatPercentage()
  const formattedValue = formatIrrKpiValue(value, status, formatPercentage)
  const note = getIrrKpiNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label tooltip={i18n.t('ui.portfoliokpis.annualizedMoneyWeightedReturnOverTheLatestThreeYears')} tooltipFooter={<FilterScopeBadges account="filterable" period="trailing-3y" />}>

        {scopeLabel
          ? i18n.t('ui.portfoliokpis.irrTrailing3ySelectedAccounts')
          : i18n.t('ui.portfoliokpis.irrTrailing3y')}
      </Kpi.Label>
      <Kpi.ValueRow><Kpi.Value color={getPerformanceColor(value)} title={formattedValue}>{formattedValue}</Kpi.Value></Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}
