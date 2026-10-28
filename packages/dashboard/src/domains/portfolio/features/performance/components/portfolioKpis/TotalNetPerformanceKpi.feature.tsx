import type { PerformanceSummary } from '@/domains/portfolio/features/performance/types/performanceSummary.type'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { getPerformanceTone } from '@/domains/portfolio/shared/components/kpis/kpi/helpers/presenters/getPerformanceTone'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

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
