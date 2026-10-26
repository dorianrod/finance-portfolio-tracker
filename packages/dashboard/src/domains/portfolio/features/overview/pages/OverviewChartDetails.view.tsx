import type {
  DriverRow,
  OverviewConcentrationRowData,
} from '@/domains/portfolio/features/overview/types/overviewChart.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { PlotMarker, Proportion } from '@/shared/ui/Proportion.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'
import type { TextTone } from '@/shared/ui/textAppearance'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function ValueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    payload: {
      timestamp: number
      value: number
      window: 'previous' | 'current'
    }
  }>
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <TooltipBox>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {formatDate(point.timestamp, {
          style: 'dayMonthYear',
          timeZone: 'UTC',
        })}
      </ChartText>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipLabel'} numeric>
          {formatMoney(point.value)}
        </ChartText>
      </Layout>
      <Layout spaceBefore="compact">
        <ChartText as="div" tone={'tooltipDim'} variant="capitalizedCaption">
          {i18n.t('ui.overviewcharts.periodWithValues', {
            window: point.window,
          })}
        </ChartText>
      </Layout>
    </TooltipBox>
  )
}

export function DriversTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number | null; payload: DriverRow }>
}) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const row = payload[0].payload
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
                  {row.current == null || row.previous == null
                    ? i18n.t('ui.overviewcharts.unavailable')
                    : `${row.current - row.previous > 0 ? '+' : ''}${formatMoney(row.current - row.previous)}`}
                </ChartText>
              </Inline>
            </ChartText>
          </Stack>
        </Text>
      </Layout>
    </TooltipBox>
  )
}

export function OverviewConcentrationRow({
  previousAvailable,
  row,
  scaleMax,
}: {
  previousAvailable: boolean
  row: OverviewConcentrationRowData
  scaleMax: number
}) {
  const formatPercentage = useFormatPercentage()
  const delta =
    row.previousWeight == null ? null : row.weight - row.previousWeight
  let deltaTone: TextTone = 'subtle'
  if (delta != null && delta > 0) deltaTone = 'negative'
  else if (delta != null && delta < 0) deltaTone = 'positive'
  return (
    <div>
      <Layout spaceAfter="default">
        <Text as="div" variant="caption">
          <Inline as="div" align="center" gap="default">
            <Layout as="span" flow="inline" sizing="flexible">
              <Text variant="medium" tone="secondary" truncate title={row.name}>
                {row.label}
              </Text>
            </Layout>
            <Layout as="span" flow="inline" sizing="fixed">
              <Text tone="secondary" numeric>
                {formatPercentage(row.weight)}
              </Text>
            </Layout>
            <Layout as="span" flow="inline" sizing="fixed">
              <Text variant="tinyLabel" tone={deltaTone} align="right" numeric>
                {formatPercentage(delta, { signed: true, unit: ' pp' })}
              </Text>
            </Layout>
          </Inline>
        </Text>
      </Layout>
      <Layout placement="inset" height="indicator">
        <Surface variant="annotatedTrack">
          <Proportion value={row.weight} total={scaleMax}>
            <ToneSwatch as="div" tone={'attention'} shape="dot" prominence="strong" />
          </Proportion>
          {previousAvailable && (
            <PlotMarker value={row.previousWeight ?? 0} total={scaleMax}>
              <ToneSwatch
                tone="secondary"
                shape="marker"
                title={i18n.t('ui.overviewcharts.previousValue0', {
                  value0: formatPercentage(row.previousWeight, { fallback: 0 }),
                })}
              ></ToneSwatch>
            </PlotMarker>
          )}
        </Surface>
      </Layout>
    </div>
  )
}
