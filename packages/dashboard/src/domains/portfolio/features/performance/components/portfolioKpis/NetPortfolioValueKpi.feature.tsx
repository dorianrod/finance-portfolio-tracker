import type { PerformanceSummary } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/performanceCalculations.types'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

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
