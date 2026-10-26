import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Layout, Stack } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { RollingUnitPricePerf } from './RollingUnitPricePerf.view'

export function OpSummary({ data }: { data?: HoverChartDataPoint }) {
  const formatMoney = useFormatMoney()
  if (!data) return null
  if (!data.buyAmount && !data.sellAmount) return null
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
          {data.sellAmount != null && (
            <>
              <ChartText as="p" tone={PORTFOLIO_CHART_TONES.transactionSell}>
                {i18n.t('ui.hoverchartsTooltips.sellWithValues', {
                  amount: formatMoney(data.sellAmount),
                })}
              </ChartText>
              {data.sellGain != null && (
                <Text
                  as="p"
                  tone={data.sellGain >= 0 ? 'positive' : 'negative'}
                >
                  {i18n.t('ui.hoverchartsTooltips.profitLoss', {
                    amount: formatMoney(data.sellGain),
                  })}
                </Text>
              )}
            </>
          )}
        </Stack>
      </Surface>
    </Layout>
  )
}

export function TooltipPortfolio({
  active,
  payload,
  label,
}: NumericTooltipProps<HoverChartDataPoint>) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const valueEntry = payload.find((item) => item.dataKey === 'Value')
  const costEntry = payload.find((item) => item.dataKey === 'Cost basis')
  const data = payload[0]?.payload
  const unrealized = valueEntry && costEntry && data ? data.unrealized : null
  return (
    <TooltipBox variant="raised">
      <Layout spaceAfter="default">
        <Text as="p" tone="muted">
          {label}
        </Text>
      </Layout>
      {valueEntry && (
        <ChartText as="p" series={valueEntry}>
          {valueEntry.name}: {formatMoney(valueEntry.value, { fallback: 0 })}
        </ChartText>
      )}
      {costEntry && (
        <ChartText as="p" series={costEntry}>
          {costEntry.name}: {formatMoney(costEntry.value, { fallback: 0 })}
        </ChartText>
      )}
      {unrealized != null && (
        <Layout spaceBefore="compact">
          <Text
            as="p"
            variant="strong"
            tone={unrealized >= 0 ? 'positive' : 'negative'}
          >
            {i18n.t('ui.hoverchartsTooltips.unrealizedWithValues', {
              amount: formatMoney(unrealized),
            })}
          </Text>
        </Layout>
      )}
      <OpSummary data={data} />
    </TooltipBox>
  )
}

export function TooltipUnit({
  active,
  payload,
  label,
}: NumericTooltipProps<HoverChartDataPoint>) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const p = payload[0]
  const data = p?.payload
  return (
    <TooltipBox variant="raised">
      <Layout spaceAfter="compact">
        <Text as="p" tone="muted">
          {label}
        </Text>
      </Layout>
      <ChartText as="p" series={p}>
        {i18n.t('ui.hoverchartsTooltips.unitPriceWithValues', {
          amount: formatMoney(p.value, { style: 'decimal', fallback: 0 }),
        })}
      </ChartText>
      <RollingUnitPricePerf rows={data?.rollingReturns ?? []} />
      <OpSummary data={data} />
    </TooltipBox>
  )
}

type SavingsPoint = {
  balance: number
  delta: number
  month: string
}

export function SavingsTooltip({
  active,
  payload,
}: NumericTooltipProps<SavingsPoint>) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const balance = tooltipValue(payload, 'balance')
  const delta: number = payload[0]?.payload?.delta ?? 0
  const monthStr: string = payload[0]?.payload?.month ?? ''
  return (
    <TooltipBox>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipText'}>
          {formatDate(`${monthStr}-02`, { style: 'longMonthYear' })}
        </ChartText>
      </Layout>
      <Layout as="div" spaceAfter="compact">
        <ChartText as="div" tone={'tooltipLabel'} variant="strong">
          {i18n.t('ui.hoverchartsTooltips.balanceWithValues', {
            amount: formatMoney(balance),
          })}
        </ChartText>
      </Layout>
      {delta !== 0 && (
        <ChartText
          as="div"
          tone={delta >= 0 ? PORTFOLIO_CHART_TONES.netContributionsText : PORTFOLIO_CHART_TONES.performanceNegativeText}
        >
          {delta >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(delta))}
        </ChartText>
      )}
    </TooltipBox>
  )
}
