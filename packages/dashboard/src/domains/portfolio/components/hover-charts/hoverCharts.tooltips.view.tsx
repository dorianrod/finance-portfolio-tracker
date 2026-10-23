import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import { tooltipValue, type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { RollingUnitPricePerf } from './RollingUnitPricePerf.view'
import type { HoverChartDataPoint } from './hoverCharts.logic'

export function OpSummary({ data }: { data?: HoverChartDataPoint }) {
  const formatMoney = useFormatMoney()
  if (!data) return null
  if (!data.buyAmount && !data.sellAmount) return null
  return (
    <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
      {data.buyAmount != null && (
        <p style={{ color: SEMANTIC_COLORS.transactionBuy }}>▲ Buy: {formatMoney(data.buyAmount)}</p>
      )}
      {data.sellAmount != null && (
        <>
          <p style={{ color: SEMANTIC_COLORS.transactionSell }}>▼ Sell: {formatMoney(data.sellAmount)}</p>
          {data.sellGain != null && (
            <p className={data.sellGain >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}>
              P&L: {formatMoney(data.sellGain)}
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
    <TooltipBox className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2">{label}</p>
      {valueEntry && <p style={{ color: valueEntry.color }}>{valueEntry.name}: {formatMoney(valueEntry.value ?? 0)}</p>}
      {costEntry && <p style={{ color: costEntry.color }}>{costEntry.name}: {formatMoney(costEntry.value ?? 0)}</p>}
      {unrealized != null && (
        <p className={`mt-1 font-semibold ${unrealized >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}`}>
          Unrealized: {formatMoney(unrealized)}
        </p>
      )}
      <OpSummary data={data} />
    </TooltipBox>
  )
}

export function TooltipUnit({ active, payload, label }: NumericTooltipProps<HoverChartDataPoint>) {
  const formatMoney = useFormatMoney()
  if (!active || !payload?.length) return null
  const p = payload[0]
  const data = p?.payload
  return (
    <TooltipBox className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p style={{ color: p.color }}>Unit price: {formatMoney(p.value ?? 0, { style: 'decimal' })}</p>
      <RollingUnitPricePerf rows={data?.rollingReturns ?? []} />
      <OpSummary data={data} />
    </TooltipBox>
  )
}

interface SavingsPoint {
  balance: number
  delta: number
  month: string
}

export function SavingsTooltip({ active, payload }: NumericTooltipProps<SavingsPoint>) {
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
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Balance: {formatMoney(balance)}</div>
      {delta !== 0 && (
        <div style={{ color: delta >= 0 ? SEMANTIC_COLORS.netContributionsText : SEMANTIC_COLORS.performanceNegativeText }}>
          {delta >= 0 ? '▲' : '▼'} {formatMoney(Math.abs(delta))}
        </div>
      )}
    </TooltipBox>
  )
}
