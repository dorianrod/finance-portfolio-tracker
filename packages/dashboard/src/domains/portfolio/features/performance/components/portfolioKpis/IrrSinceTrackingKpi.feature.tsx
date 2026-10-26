import { useFormatIrrKpiValue } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatIrrKpiValue'
import { getIrrKpiNote } from '@/domains/portfolio/features/performance/helpers/presenters/getIrrKpiNote'
import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import { getPerformanceTone } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceTone'
import i18n from '@/i18n/i18n'

import type { IrrKpiProps } from './portfolioKpis.types'

export function IrrSinceTrackingKpi({
  value,
  status = 'ready',
  scopeLabel,
}: IrrKpiProps) {
  const formatIrrKpiValue = useFormatIrrKpiValue()
  const formattedValue = formatIrrKpiValue(value, status)
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
