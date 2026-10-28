import type { PerformanceSummary } from '@/domains/portfolio/features/performance/types/performanceSummary.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { getPerformanceTone } from '@/domains/portfolio/shared/components/kpis/kpi/helpers/presenters/getPerformanceTone'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

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
