import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export type UnrealizedPnlPoint = PortfolioHistoryPoint & {
  unrealized_gain_pct: number | null
  snapshot_change: number | null
}

export type UnrealizedPnlTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: UnrealizedPnlPoint }>
}

export function UnrealizedPnlTooltip({
  active,
  payload,
}: UnrealizedPnlTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  const valueTone =
    point.unrealized_gain >= 0
      ? 'performancePositiveText'
      : 'performanceNegativeText'
  const date = formatDate(point.date, { style: 'longDayMonthYear' })

  return (
    <TooltipBox>
      <ChartText
        as="div"
        tone={'tooltipText'}
        variant="strong"
        style={{ marginBottom: 6 }}
      >
        {date}
      </ChartText>
      <ChartText as="div" tone={valueTone} variant="strong">
        {i18n.t('ui.unrealizedpnlchart.grossUnrealizedAmount', {
          amount: formatMoney(point.unrealized_gain, { style: 'full' }),
        })}
      </ChartText>
      <ChartText as="div" tone={'tooltipLabel'} style={{ marginTop: 4 }}>
        {i18n.t('ui.unrealizedpnlchart.capitalReturn', {
          percentage: formatPercentage(point.unrealized_gain_pct, {
            signed: true,
          }),
        })}
      </ChartText>
      <ChartText as="div" tone={'label'} style={{ marginTop: 4 }}>
        {i18n.t('ui.unrealizedpnlchart.costBasisWithValues', {
          amount: formatMoney(point.total_cost_basis, { style: 'full' }),
        })}
      </ChartText>
      {point.snapshot_change != null && (
        <ChartText
          as="div"
          tone={'label'}
          separator
          style={{ marginTop: 6, paddingTop: 6 }}
        >
          {i18n.t(
            'ui.unrealizedpnlchart.changeSincePreviousSnapshotWithValues',
            { amount: formatMoney(point.snapshot_change, { style: 'full' }) },
          )}
        </ChartText>
      )}
    </TooltipBox>
  )
}
