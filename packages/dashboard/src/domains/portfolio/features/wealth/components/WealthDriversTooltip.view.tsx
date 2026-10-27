import type { WealthDriverPoint } from '@/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations/wealthCalculations.types'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
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
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const row = payload[0]?.payload as WealthDriverPoint
  return (
    <Surface variant="tooltip">
      <Layout spaceAfter="default">
        <Text as="div" variant="strong" tone="default">
          {label == null ? '' : formatDate(label, { style: 'shortMonthYear' })}
        </Text>
      </Layout>
      <Text as="div" tone="secondary">
        <Stack gap="compact">
          <Inline as="div" justify="between" gap="spacious">
            <span>{i18n.t('ui.wealthdriverschart.netContributions')}</span>
            <ChartText
              tone={PORTFOLIO_CHART_TONES.netContributionsText}
              variant="medium"
            >
              {formatMoney(row.cumulative_savings, { style: 'full' })}
            </ChartText>
          </Inline>
          <Inline as="div" justify="between" gap="spacious">
            <span>{i18n.t('ui.wealthdriverschart.marketPerformance')}</span>
            <ChartText
              tone={
                row.cumulative_performance >= 0
                  ? PORTFOLIO_CHART_TONES.performancePositiveText
                  : PORTFOLIO_CHART_TONES.performanceNegativeText
              }
              variant="medium"
            >
              {formatMoney(row.cumulative_performance, { style: 'full' })}
            </ChartText>
          </Inline>
          <Surface variant="strongSectionStart">
            <Inline as="div" justify="between" gap="spacious" inset="compact">
              <span>{i18n.t('ui.wealthdriverschart.totalChange')}</span>
              <Text variant="strong" tone="default">
                {formatMoney(row.cumulative_change, { style: 'full' })}
              </Text>
            </Inline>
          </Surface>
        </Stack>
      </Text>
    </Surface>
  )
}
