import type { WealthDriverPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { ChartText } from '@/shared/ui/ChartText.view'
type DriversTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: WealthDriverPoint }>
  label?: string | number | Date
}

import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function DriversTooltip({
  active,
  payload,
  label,
}: DriversTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatDate = useFormatDate()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as WealthDriverPoint
  return (
    <Surface variant="tooltip" className="px-3 py-2">
      <Text as="div" variant="strong" tone="default" className="mb-2">
        {label == null ? '' : formatDate(label, { style: 'shortMonthYear' })}
      </Text>
      <Text as="div" tone="secondary" className="space-y-1">
        <div className="flex justify-between gap-6">
          <span>{i18n.t('ui.wealthdriverschart.netContributions')}</span>
          <ChartText tone={'netContributionsText'} variant="medium">
            {formatMoney(row.cumulative_savings, { style: 'full' })}
          </ChartText>
        </div>
        <div className="flex justify-between gap-6">
          <span>{i18n.t('ui.wealthdriverschart.marketPerformance')}</span>
          <ChartText
            tone={
              row.cumulative_performance >= 0
                ? 'performancePositiveText'
                : 'performanceNegativeText'
            }
            variant="medium"
          >
            {formatMoney(row.cumulative_performance, { style: 'full' })}
          </ChartText>
        </div>
        <Surface
          variant="strongSectionStart"
          className="flex justify-between gap-6 pt-1"
        >
          <span>{i18n.t('ui.wealthdriverschart.totalChange')}</span>
          <Text variant="strong" tone="default">
            {formatMoney(row.cumulative_change, { style: 'full' })}
          </Text>
        </Surface>
      </Text>
    </Surface>
  )
}
