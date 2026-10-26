import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { RollingUnitPricePerf } from './RollingUnitPricePerf.view'

export function OpSummary({ data }: { data?: HoverChartDataPoint }) {
  const formatMoney = useFormatMoney()
  if (!data) return null
  if (!data.buyAmount && !data.sellAmount) return null
  return (
    <Surface variant="strongSectionStart" className="mt-2 pt-2 space-y-1">
      {data.buyAmount != null && (
        <ChartText as="p" tone={'transactionBuy'}>
          {i18n.t('ui.hoverchartsTooltips.buyWithValues', {
            amount: formatMoney(data.buyAmount),
          })}
        </ChartText>
      )}
      {data.sellAmount != null && (
        <>
          <ChartText as="p" tone={'transactionSell'}>
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
      )}
    </Surface>
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
    <TooltipBox variant="raised" className="p-3">
      <Text as="p" tone="muted" className="mb-2">
        {label}
      </Text>
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
        <Text
          as="p"
          variant="strong"
          tone={unrealized >= 0 ? 'positive' : 'negative'}
          className="mt-1"
        >
          {i18n.t('ui.hoverchartsTooltips.unrealizedWithValues', {
            amount: formatMoney(unrealized),
          })}
        </Text>
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
    <TooltipBox variant="raised" className="p-3">
      <Text as="p" tone="muted" className="mb-1">
        {label}
      </Text>
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
      <ChartText as="div" tone={'tooltipText'} style={{ marginBottom: 6 }}>
        {formatDate(`${monthStr}-02`, { style: 'longMonthYear' })}
      </ChartText>
      <ChartText
        as="div"
        tone={'tooltipLabel'}
        variant="strong"
        style={{ marginBottom: 4 }}
      >
        {i18n.t('ui.hoverchartsTooltips.balanceWithValues', {
          amount: formatMoney(balance),
        })}
      </ChartText>
      {delta !== 0 && (
        <ChartText
          as="div"
          tone={delta >= 0 ? 'netContributionsText' : 'performanceNegativeText'}
        >
          {delta >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(delta))}
        </ChartText>
      )}
    </TooltipBox>
  )
}
