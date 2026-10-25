import type { HoverChartDataPoint } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/helpers/calculators/buildHoverChartData'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import {
  SEMANTIC_COLORS,
  SEMANTIC_TEXT_CLASSES,
} from '@/shared/theme/semanticColors'
import {
  type NumericTooltipProps,
  tooltipValue,
} from '@/shared/ui/chartTooltip'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

import { RollingUnitPricePerf } from './RollingUnitPricePerf.view'

export function OpSummary({ data }: { data?: HoverChartDataPoint }) {
  const formatMoney = useFormatMoney()
  if (!data) return null
  if (!data.buyAmount && !data.sellAmount) return null
  return (
    <div className="mt-2 pt-2 border-t border-border-strong space-y-1">
      {data.buyAmount != null && (
        <p style={{ color: SEMANTIC_COLORS.transactionBuy }}>
          {i18n.t('ui.hoverchartsTooltips.buyWithValues', {
            amount: formatMoney(data.buyAmount),
          })}
        </p>
      )}
      {data.sellAmount != null && (
        <>
          <p style={{ color: SEMANTIC_COLORS.transactionSell }}>
            {i18n.t('ui.hoverchartsTooltips.sellWithValues', {
              amount: formatMoney(data.sellAmount),
            })}
          </p>
          {data.sellGain != null && (
            <p
              className={
                data.sellGain >= 0
                  ? SEMANTIC_TEXT_CLASSES.performancePositive
                  : SEMANTIC_TEXT_CLASSES.performanceNegative
              }
            >
              {i18n.t('ui.hoverchartsTooltips.profitLoss', {
                amount: formatMoney(data.sellGain),
              })}
            </p>
          )}
        </>
      )}
    </div>
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
    <TooltipBox className="bg-surface-raised border border-border-strong rounded-lg p-3 text-xs shadow-xl">
      <p className="text-content-muted mb-2">{label}</p>
      {valueEntry && (
        <p style={{ color: valueEntry.color }}>
          {valueEntry.name}: {formatMoney(valueEntry.value, { fallback: 0 })}
        </p>
      )}
      {costEntry && (
        <p style={{ color: costEntry.color }}>
          {costEntry.name}: {formatMoney(costEntry.value, { fallback: 0 })}
        </p>
      )}
      {unrealized != null && (
        <p
          className={`mt-1 font-semibold ${unrealized >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}`}
        >
          {i18n.t('ui.hoverchartsTooltips.unrealizedWithValues', {
            amount: formatMoney(unrealized),
          })}
        </p>
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
    <TooltipBox className="bg-surface-raised border border-border-strong rounded-lg p-3 text-xs shadow-xl">
      <p className="text-content-muted mb-1">{label}</p>
      <p style={{ color: p.color }}>
        {i18n.t('ui.hoverchartsTooltips.unitPriceWithValues', {
          amount: formatMoney(p.value, { style: 'decimal', fallback: 0 }),
        })}
      </p>
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
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {formatDate(`${monthStr}-02`, { style: 'longMonthYear' })}
      </div>
      <div
        style={{
          color: 'var(--tooltip-label)',
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {i18n.t('ui.hoverchartsTooltips.balanceWithValues', {
          amount: formatMoney(balance),
        })}
      </div>
      {delta !== 0 && (
        <div
          style={{
            color:
              delta >= 0
                ? SEMANTIC_COLORS.netContributionsText
                : SEMANTIC_COLORS.performanceNegativeText,
          }}
        >
          {delta >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(delta))}
        </div>
      )}
    </TooltipBox>
  )
}
