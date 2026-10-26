import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
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
