import type { ReactNode } from 'react'

import { KpiCard } from '@/domains/portfolio/features/wealth/components/KpiCard.view'
import { useFormatMonthRange } from '@/domains/portfolio/features/wealth/helpers/formatters/useFormatMonthRange'
import type { YearOverYearMetric } from '@/domains/portfolio/features/wealth/types/trailingYearOverYear.type'
import { getPerformanceTone } from '@/domains/portfolio/shared/components/kpis/kpi/helpers/presenters/getPerformanceTone'
import { Kpi } from '@/domains/portfolio/shared/components/kpis/kpi/Kpi.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Text } from '@/shared/ui/Text.view'

export function WealthComparisonKpi({
  label,
  metric,
  currentMonths,
  tone,
  children,
}: {
  label: string
  metric: YearOverYearMetric
  currentMonths: string[]
  tone: 'blue' | 'performance'
  children: ReactNode
}) {
  const formatMonthRange = useFormatMonthRange()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const valueColor =
    tone === 'blue' ? 'accent' : getPerformanceTone(metric.current)
  const changeColor =
    metric.changePct == null ? 'subtle' : getPerformanceTone(metric.changePct)
  const currentLabel = formatMonthRange(currentMonths)
  const value = formatMoney(metric.current)
  let accent: 'contributions' | 'positive' | 'negative' = 'positive'
  if (tone === 'blue') accent = 'contributions'
  else if (metric.current != null && metric.current < 0) accent = 'negative'

  return (
    <KpiCard>
      <Kpi.Root accent={accent}>
        <Kpi.Label
          tooltip={i18n.t(
            'ui.wealthtab.rollingTotalOverTheLatestTwelveCalendarMonthsCompared',
          )}
        >
          <Kpi.TooltipFooter>{children}</Kpi.TooltipFooter>
          {label}
        </Kpi.Label>
        <Kpi.ValueRow>
          <Kpi.Value tone={valueColor} title={value}>
            {value}
          </Kpi.Value>
          <Kpi.InlineNote tone={changeColor}>
            {formatPercentage(metric.changePct, { signed: true })}
          </Kpi.InlineNote>
        </Kpi.ValueRow>
        <Kpi.Detail>
          {currentLabel || i18n.t('ui.wealthtab.insufficientHistory')}
        </Kpi.Detail>
        <Kpi.Footer>
          {i18n.t('ui.wealthtab.previous12m')}{' '}
          <Text variant="medium" tone="secondary">
            {formatMoney(metric.previous)}
          </Text>
        </Kpi.Footer>
      </Kpi.Root>
    </KpiCard>
  )
}
