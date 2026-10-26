import type { PerformanceSummary } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/performanceCalculations.types'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import { getPerformanceTone } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceTone'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

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
