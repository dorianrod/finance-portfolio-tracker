import type { IncomeSummary } from '@/domains/portfolio/features/performance/types/incomeSummary.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { getPerformanceTone } from '@/domains/portfolio/shared/components/kpis/kpi/helpers/presenters/getPerformanceTone'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

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
        <Kpi.Value tone={'decorative'} title={value}>
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
