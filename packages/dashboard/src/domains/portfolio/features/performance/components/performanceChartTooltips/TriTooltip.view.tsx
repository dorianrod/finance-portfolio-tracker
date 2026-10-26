import type { TriChartPoint } from '@/domains/portfolio/features/performance/helpers/calculators/performanceCalculations/performanceCalculations.types'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import { type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function TriTooltip({
  active,
  payload,
  label,
}: NumericTooltipProps<TriChartPoint, Date | string | number>) {
  const formatDate = useFormatDate()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const tri1y =
    payload.find((point) => point.dataKey === 'tri_rolling_1y')?.value ?? null
  const tri1yBackfill =
    payload.find((point) => point.dataKey === 'tri_rolling_1y_backfill')
      ?.value ?? null
  const tri3y =
    payload.find((point) => point.dataKey === 'tri_rolling_3y')?.value ?? null
  const tri3yBackfill =
    payload.find((point) => point.dataKey === 'tri_rolling_3y_backfill')
      ?.value ?? null
  const showTri1y = tri1y !== null || tri1yBackfill !== null
  const showTri3y = tri3y !== null || tri3yBackfill !== null
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {label == null ? '' : formatDate(label, { style: 'longMonthYear' })}
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
