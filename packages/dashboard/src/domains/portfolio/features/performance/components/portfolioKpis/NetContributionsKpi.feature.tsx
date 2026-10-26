import { FilterScopeBadges } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

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
