import type {
  DriverRow,
  OverviewConcentrationRowData,
} from '@/domains/portfolio/features/overview/types/overviewChart.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
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
    <TooltipBox minWidth={190}>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {formatDate(point.timestamp, {
          style: 'dayMonthYear',
          timeZone: 'UTC',
        })}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'} numeric className="mt-1">
        {formatMoney(point.value)}
      </ChartText>
      <ChartText
        as="div"
        tone={'tooltipDim'}
        variant="capitalizedCaption"
        className="mt-1"
      >
        {i18n.t('ui.overviewcharts.periodWithValues', { window: point.window })}
      </ChartText>
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
    <TooltipBox minWidth={205}>
      <ChartText as="div" tone={'tooltipText'} variant="strong">
        {row.label}
      </ChartText>
      <Text as="div" variant="caption" className="mt-2 space-y-1">
        <ChartText
          as="div"
          tone={'tooltipDim'}
          className="flex justify-between gap-6"
        >
          <span>{i18n.t('ui.overviewcharts.current')}</span>
          <ChartText tone={'tooltipLabel'} numeric>
            {formatMoney(row.current, {
              fallback: i18n.t('ui.overviewcharts.unavailable'),
            })}
          </ChartText>
        </ChartText>
        <ChartText
          as="div"
          tone={'tooltipDim'}
          className="flex justify-between gap-6"
        >
          <span>{i18n.t('ui.overviewcharts.previous')}</span>
          <ChartText tone={'tooltipLabel'} numeric>
            {formatMoney(row.previous, {
              fallback: i18n.t('ui.overviewcharts.unavailable'),
            })}
          </ChartText>
        </ChartText>
        <ChartText
          as="div"
          separator
          tone="tooltipDim"
          className="flex justify-between gap-6 pt-1"
        >
          <span>{i18n.t('ui.overviewcharts.difference')}</span>
          <ChartText tone={'tooltipLabel'} numeric>
            {row.current == null || row.previous == null
              ? i18n.t('ui.overviewcharts.unavailable')
              : `${row.current - row.previous > 0 ? '+' : ''}${formatMoney(row.current - row.previous)}`}
          </ChartText>
        </ChartText>
      </Text>
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
      <Text
        as="div"
        variant="caption"
        className="mb-1.5 flex items-center gap-3"
      >
        <Text
          variant="medium"
          tone="secondary"
          truncate
          className="min-w-0 flex-1"
          title={row.name}
        >
          {row.label}
        </Text>
        <Text tone="secondary" numeric className="shrink-0">
          {formatPercentage(row.weight)}
        </Text>
        <Text
          variant="tinyLabel"
          tone={deltaTone}
          align="right"
          numeric
          className="w-14 shrink-0"
        >
          {formatPercentage(delta, { signed: true, unit: ' pp' })}
        </Text>
      </Text>
      <Surface variant="track" className="relative h-2.5">
        <ToneSwatch
          as="div"
          tone="risk"
          shape="dot"
          prominence="strong"
          className="absolute inset-y-0 left-0"
          style={{ width: `${(row.weight / scaleMax) * 100}%` }}
        />
        {previousAvailable && (
          <ToneSwatch
            tone="secondary"
            shape="marker"
            className="absolute -top-1 h-4 w-0.5"
            style={{ left: `${((row.previousWeight ?? 0) / scaleMax) * 100}%` }}
            title={i18n.t('ui.overviewcharts.previousValue0', {
              value0: formatPercentage(row.previousWeight, { fallback: 0 }),
            })}
          />
        )}
      </Surface>
    </div>
  )
}
