import type { ReactNode } from 'react'

import { useFormatMonthRange } from '@/domains/portfolio/features/wealth/helpers/formatters/useFormatMonthRange'
import {
  Kpi,
  KpiCard,
} from '@/domains/portfolio/shared/components/kpis/Kpi.view'
import type { YearOverYearMetric } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { getPerformanceColor } from '@/domains/portfolio/shared/helpers/presenters/getPerformanceColor'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

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
    tone === 'blue'
      ? SEMANTIC_TEXT_CLASSES.netContributions
      : getPerformanceColor(metric.current)
  const changeColor =
    metric.changePct == null
      ? 'text-content-subtle'
      : getPerformanceColor(metric.changePct)
  const currentLabel = formatMonthRange(currentMonths)
  const value = metric.current == null ? '—' : formatMoney(metric.current)
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
          <Kpi.Value color={valueColor} title={value}>
            {value}
          </Kpi.Value>
          <Kpi.InlineNote color={changeColor}>
            {metric.changePct == null
              ? '—'
              : formatPercentage(metric.changePct, { signed: true })}
          </Kpi.InlineNote>
        </Kpi.ValueRow>
        <Kpi.Detail>
          {currentLabel || i18n.t('ui.wealthtab.insufficientHistory')}
        </Kpi.Detail>
        <Kpi.Footer>
          {i18n.t('ui.wealthtab.previous12m')}{' '}
          <span className="font-medium text-content-secondary">
            {metric.previous == null ? '—' : formatMoney(metric.previous)}
          </span>
        </Kpi.Footer>
      </Kpi.Root>
    </KpiCard>
  )
}
