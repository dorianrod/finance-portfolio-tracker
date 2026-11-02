import type { PortfolioCompositionPoint } from '@/domains/portfolio/features/wealth/components/EvolutionChart/types/portfolioCompositionPoint.type'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { ChartText } from '@/shared/ui/ChartText.view'
import type { NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export function EvolutionTooltip({
  active,
  payload,
  label,
  percentageMode = false,
}: EvolutionTooltipProps) {
  const formatDate = useFormatDate()
  if (payload == null) return null
  if (!active || payload.length === 0) return null
  const row = payload[0]?.payload
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {formatDate(label, { style: 'longMonthYear', fallback: '' })}
        </ChartText>
      </Layout>
      <EvolutionAmounts
        composition={row?.composition ?? EMPTY_COMPOSITION}
        percentageMode={percentageMode}
      />
    </TooltipBox>
  )
}

type EvolutionTooltipProps = NumericTooltipProps<
  PortfolioCompositionPoint,
  Date | string | number
> & {
  percentageMode?: boolean
}

const EMPTY_COMPOSITION: PortfolioCompositionPoint['composition'] = {
  cost: 0,
  gain: 0,
  total: 0,
  costShare: null,
  gainShare: null,
}

function EvolutionAmounts({
  composition,
  percentageMode,
}: {
  composition: PortfolioCompositionPoint['composition']
  percentageMode: boolean
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { cost, gain, total, costShare, gainShare } = composition
  return (
    <>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.portfoliochartsTooltips.totalWithValues', {
            amount: formatMoney(total, { style: 'full' }),
          })}
        </ChartText>
      </Layout>
      <ChartText as="div" tone={PORTFOLIO_CHART_TONES.costBasisText}>
        {i18n.t('ui.portfoliochartsTooltips.costBasisWithValues', {
          amount: formatMoney(cost, { style: 'full' }),
          value: percentageMode
            ? i18n.t('ui.formatters.detail', {
                value: formatPercentage(costShare),
              })
            : '',
        })}
      </ChartText>
      <ChartText
        as="div"
        tone={
          gain >= 0
            ? PORTFOLIO_CHART_TONES.performancePositiveText
            : PORTFOLIO_CHART_TONES.performanceNegativeText
        }
      >
        {i18n.t('ui.portfoliochartsTooltips.unrealizedProfitLoss', {
          amount: formatMoney(gain, { style: 'full' }),
          share: percentageMode
            ? i18n.t('ui.formatters.detail', {
                value: formatPercentage(gainShare),
              })
            : '',
        })}
      </ChartText>
    </>
  )
}
