import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import type {
  IncomeSummary,
  PerformanceSummary,
} from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { getPerformanceTone } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceTone'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

import { formatIrrKpiValue } from './helpers/formatters/formatIrrKpiValue'
import { getIrrKpiNote } from './helpers/presenters/getIrrKpiNote'
import { Kpi } from './Kpi.view'

export function NetPortfolioValueKpi({
  performance,
}: {
  performance: PerformanceSummary
}) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.currentValueNet)
  return (
    <Kpi.Root accent="portfolio">
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.currentMarketValueAfterEstimatedTaxOnUnrealizedGains',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="as-of" />
        </Kpi.TooltipFooter>
        {i18n.t('ui.portfoliokpis.netPortfolioValue')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value title={value}>{value}</Kpi.Value>
      </Kpi.ValueRow>
      <Kpi.Detail>
        {i18n.t('ui.portfoliokpis.grossWithValues', {
          amount: formatMoney(performance.currentValueGross),
        })}
      </Kpi.Detail>
    </Kpi.Root>
  )
}

export function TotalNetPerformanceKpi({
  performance,
}: {
  performance: PerformanceSummary
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const value = formatMoney(performance.totalPerformanceNet)
  return (
    <Kpi.Root
      accent={performance.totalPerformanceNet >= 0 ? 'positive' : 'negative'}
    >
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.netUnrealizedAndRealizedPLPlusNetPassive',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="since-tracking" />
        </Kpi.TooltipFooter>
        {i18n.t('ui.portfoliokpis.totalNetPerformance')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value
          tone={getPerformanceTone(performance.totalPerformanceNet)}
          title={value}
        >
          {value}
        </Kpi.Value>
        <Kpi.InlineNote
          tone={getPerformanceTone(performance.totalPerformanceNet)}
        >
          {formatPercentage(performance.totalPerformancePct, { signed: true })}
        </Kpi.InlineNote>
      </Kpi.ValueRow>
      <Kpi.Detail>
        {i18n.t('ui.portfoliokpis.grossWithValues', {
          amount: formatMoney(performance.totalPerformanceGross),
        })}
      </Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetContributionsKpi({
  value,
  periodLabel,
}: {
  value: number
  periodLabel: string
}) {
  const formatMoney = useFormatMoney()
  const formattedValue = formatMoney(value)
  return (
    <Kpi.Root accent="contributions">
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.depositsMinusWithdrawalsOverTheSelectedPeriod',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="range" />
        </Kpi.TooltipFooter>
        {i18n.t('ui.portfoliokpis.netContributions')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value tone={'accent'} title={formattedValue}>
          {formattedValue}
        </Kpi.Value>
      </Kpi.ValueRow>
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
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.dividendsAndInterestOverTheLatestTwelveMonthsThe',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="trailing-12m" />
        </Kpi.TooltipFooter>
        {i18n.t('ui.portfoliokpis.passiveIncomeTrailing12m')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value tone={'income'} title={value}>
          {value}
        </Kpi.Value>
        <Kpi.InlineNote
          tone={
            income.changePct == null
              ? 'subtle'
              : getPerformanceTone(income.changePct)
          }
        >
          {formatPercentage(income.changePct, { signed: true })}
        </Kpi.InlineNote>
      </Kpi.ValueRow>
    </Kpi.Root>
  )
}

type IrrKpiProps = {
  value: number | null
  status?: IrrStatus
  scopeLabel?: string
}

export function IrrSinceTrackingKpi({
  value,
  status = 'ready',
  scopeLabel,
}: IrrKpiProps) {
  const formatPercentage = useFormatPercentage()
  const formattedValue = formatIrrKpiValue(value, status, formatPercentage)
  const note = getIrrKpiNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.annualizedMoneyWeightedReturnSinceTheFirstRecordedDeposit',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="since-tracking" />
        </Kpi.TooltipFooter>
        {scopeLabel
          ? i18n.t('ui.portfoliokpis.irrSinceTrackingSelectedAccounts')
          : i18n.t('ui.portfoliokpis.irrSinceTracking')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value tone={getPerformanceTone(value)} title={formattedValue}>
          {formattedValue}
        </Kpi.Value>
      </Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}

export function NetUnrealizedKpi({
  performance,
}: {
  performance: PerformanceSummary
}) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.unrealizedNet)
  return (
    <Kpi.Root accent={performance.unrealizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.currentUnrealizedGainAfterEstimatedTax',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="as-of" />
        </Kpi.TooltipFooter>
        {i18n.t('ui.portfoliokpis.netUnrealizedPandl')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value
          tone={getPerformanceTone(performance.unrealizedNet)}
          title={value}
        >
          {value}
        </Kpi.Value>
      </Kpi.ValueRow>
      <Kpi.Detail>
        {i18n.t('ui.portfoliokpis.grossWithValues', {
          amount: formatMoney(performance.unrealizedGross),
        })}
      </Kpi.Detail>
    </Kpi.Root>
  )
}

export function NetRealizedKpi({
  performance,
}: {
  performance: PerformanceSummary
}) {
  const formatMoney = useFormatMoney()
  const value = formatMoney(performance.realizedNet)
  return (
    <Kpi.Root accent={performance.realizedNet >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.crystallizedGainsAndLossesAfterEstimatedTax',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="range" />
        </Kpi.TooltipFooter>
        {i18n.t('ui.portfoliokpis.netRealizedPandl')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value
          tone={getPerformanceTone(performance.realizedNet)}
          title={value}
        >
          {value}
        </Kpi.Value>
      </Kpi.ValueRow>
      <Kpi.Detail>
        {i18n.t('ui.portfoliokpis.grossWithValues', {
          amount: formatMoney(performance.realizedGross),
        })}
      </Kpi.Detail>
    </Kpi.Root>
  )
}

export function TrailingThreeYearIrrKpi({
  value,
  status = 'ready',
  scopeLabel,
}: IrrKpiProps) {
  const formatPercentage = useFormatPercentage()
  const formattedValue = formatIrrKpiValue(value, status, formatPercentage)
  const note = getIrrKpiNote(status)
  return (
    <Kpi.Root accent={value == null || value >= 0 ? 'positive' : 'negative'}>
      <Kpi.Label
        tooltip={i18n.t(
          'ui.portfoliokpis.annualizedMoneyWeightedReturnOverTheLatestThreeYears',
        )}
      >
        <Kpi.TooltipFooter>
          <FilterScopeBadges account="filterable" period="trailing-3y" />
        </Kpi.TooltipFooter>
        {scopeLabel
          ? i18n.t('ui.portfoliokpis.irrTrailing3ySelectedAccounts')
          : i18n.t('ui.portfoliokpis.irrTrailing3y')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value tone={getPerformanceTone(value)} title={formattedValue}>
          {formattedValue}
        </Kpi.Value>
      </Kpi.ValueRow>
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}
