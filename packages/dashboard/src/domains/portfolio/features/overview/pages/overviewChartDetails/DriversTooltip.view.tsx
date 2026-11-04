import type { DriverRow } from '@/domains/portfolio/features/overview/types/overviewChart.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function DriversTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number | null; payload: DriverRow }>
}) {
  const formatMoney = useFormatMoney()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const row = payload[0].payload
  const difference =
    row.current == null || row.previous == null
      ? null
      : row.current - row.previous
  return (
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {row.label}
      </ChartText>
      <Layout spaceBefore="default">
        <Text as="div" variant="caption">
          <Stack gap="compact">
            <ChartText as="div" tone={'tooltipDim'}>
              <Inline as="div" justify="between" gap="spacious">
                <span>{i18n.t('ui.overviewcharts.current')}</span>
                <ChartText tone={'tooltipLabel'} numeric>
                  {formatMoney(row.current, {
                    fallback: i18n.t('ui.overviewcharts.unavailable'),
                  })}
                </ChartText>
              </Inline>
            </ChartText>
            <ChartText as="div" tone={'tooltipDim'}>
              <Inline as="div" justify="between" gap="spacious">
                <span>{i18n.t('ui.overviewcharts.previous')}</span>
                <ChartText tone={'tooltipLabel'} numeric>
                  {formatMoney(row.previous, {
                    fallback: i18n.t('ui.overviewcharts.unavailable'),
                  })}
                </ChartText>
              </Inline>
            </ChartText>
            <ChartText as="div" separator tone="tooltipDim">
              <Inline as="div" justify="between" gap="spacious" inset="compact">
                <span>{i18n.t('ui.overviewcharts.difference')}</span>
                <ChartText tone={'tooltipLabel'} numeric>
                  {formatMoney(difference, {
                    signed: true,
                    fallback: i18n.t('ui.overviewcharts.unavailable'),
                  })}
                </ChartText>
              </Inline>
            </ChartText>
          </Stack>
        </Text>
      </Layout>
    </TooltipBox>
  )
}
