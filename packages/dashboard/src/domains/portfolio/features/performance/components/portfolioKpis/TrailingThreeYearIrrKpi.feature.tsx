import { useFormatIrrKpiValue } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatIrrKpiValue'
import { getIrrKpiNote } from '@/domains/portfolio/features/performance/helpers/presenters/getIrrKpiNote'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import { getPerformanceTone } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceTone'
import i18n from '@/i18n/i18n'

import type { IrrKpiProps } from './portfolioKpis.types'

export function TrailingThreeYearIrrKpi({
  value,
  status = 'ready',
  accountFilters,
}: IrrKpiProps) {
  const formatIrrKpiValue = useFormatIrrKpiValue()
  const formattedValue = formatIrrKpiValue(value, status)
  const note = getIrrKpiNote(status)
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
      {note ? <Kpi.Detail>{note}</Kpi.Detail> : null}
    </Kpi.Root>
  )
}
