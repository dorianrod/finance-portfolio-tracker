import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData/buildHoverChartData.types'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function OpSummary({ data }: { data?: HoverChartDataPoint }) {
  const formatMoney = useFormatMoney()
  if (!data) return null
  if ((data.buyAmount ?? 0) === 0 && (data.sellAmount ?? 0) === 0) return null
  return (
    <Layout spaceBefore="default">
      <Surface variant="strongSectionStart">
        <Stack inset="compact" gap="compact">
          {data.buyAmount != null && (
            <ChartText as="p" tone={PORTFOLIO_CHART_TONES.transactionBuy}>
              {i18n.t('ui.hoverchartsTooltips.buyWithValues', {
                amount: formatMoney(data.buyAmount),
              })}
            </ChartText>
          )}
          <SellSummary data={data} />
        </Stack>
      </Surface>
    </Layout>
  )
}

function SellSummary({ data }: { data: HoverChartDataPoint }) {
  const formatMoney = useFormatMoney()
  if (data.sellAmount == null) return null
  return (
    <>
      <ChartText as="p" tone={PORTFOLIO_CHART_TONES.transactionSell}>
        {i18n.t('ui.hoverchartsTooltips.sellWithValues', {
          amount: formatMoney(data.sellAmount),
        })}
      </ChartText>
      {data.sellGain != null && (
        <Text as="p" tone={data.sellGain >= 0 ? 'positive' : 'negative'}>
          {i18n.t('ui.hoverchartsTooltips.profitLoss', {
            amount: formatMoney(data.sellGain),
          })}
        </Text>
      )}
    </>
  )
}
