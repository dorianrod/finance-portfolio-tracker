import type { TriChartPoint } from '@/domains/portfolio/features/performance/components/TriChart/types/triChartPoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import type { NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { selectTriTooltipSeries } from './helpers/presenters/selectTriTooltipSeries'

export function TriTooltip({
  active,
  payload,
  label,
}: NumericTooltipProps<TriChartPoint, Date | string | number>) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const { tri1y, tri3y, showTri1y, showTri3y } = selectTriTooltipSeries(payload)
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {formatDate(label, { style: 'longMonthYear', fallback: '' })}
        </ChartText>
      </Layout>
      {showTri1y && (
        <ChartText
          as="div"
          tone={PORTFOLIO_CHART_TONES.totalChange}
          variant="strong"
        >
          {i18n.t('ui.portfoliochartsTooltips.irr1yWithValues', {
            value: formatPercentage(tri1y, {
              decimals: 2,
              signed: true,
              fallback: i18n.t('ui.portfoliochartsTooltips.notYetAvailable'),
            }),
          })}
        </ChartText>
      )}
      {showTri3y && (
        <Layout as="div" spaceBefore="compact">
          <ChartText
            as="div"
            tone={PORTFOLIO_CHART_TONES.returnRate}
            variant="strong"
          >
            {i18n.t('ui.portfoliochartsTooltips.irr3yWithValues', {
              value: formatPercentage(tri3y, {
                decimals: 2,
                signed: true,
                fallback: i18n.t('ui.portfoliochartsTooltips.notYetAvailable'),
              }),
            })}
          </ChartText>
        </Layout>
      )}
    </TooltipBox>
  )
}
