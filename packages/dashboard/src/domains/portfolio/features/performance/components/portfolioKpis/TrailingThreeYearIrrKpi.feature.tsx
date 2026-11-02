import { useFormatIrrKpiValue } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatIrrKpiValue'
import { getTrailingThreeYearIrr } from '@/domains/portfolio/features/performance/helpers/transformers/getTrailingThreeYearIrr'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { getPerformanceTone } from '@/domains/portfolio/shared/components/kpis/kpi/helpers/presenters/getPerformanceTone'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'

import type { IrrKpiProps } from './portfolioKpis.types'

export function TrailingThreeYearIrrKpi({
  history,
  status = 'ready',
  accountFilters,
}: Omit<IrrKpiProps, 'value'> & { history: PortfolioHistoryPoint[] }) {
  const value = getTrailingThreeYearIrr(history)
  const formatIrrKpiValue = useFormatIrrKpiValue()
  const formattedValue = formatIrrKpiValue(value, status)
  const hasAccountScope =
    status === 'ready' && accountFilters != null && accountFilters.size > 0
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
        {hasAccountScope
          ? i18n.t('ui.portfoliokpis.irrTrailing3ySelectedAccounts')
          : i18n.t('ui.portfoliokpis.irrTrailing3y')}
      </Kpi.Label>
      <Kpi.ValueRow>
        <Kpi.Value tone={getPerformanceTone(value)} title={formattedValue}>
          {formattedValue}
        </Kpi.Value>
      </Kpi.ValueRow>
      {status === 'error' && (
        <Kpi.Detail>
          {i18n.t('ui.getirrkpinoteTs.filteredIrrUnavailable')}
        </Kpi.Detail>
      )}
    </Kpi.Root>
  )
}
