import { fmt, fmtDec } from '@/shared/format/money'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import { tooltipValue, type NumericTooltipProps } from '@/shared/ui/chartTooltip'
import { RollingUnitPricePerf } from './RollingUnitPricePerf'
import type { HoverChartDataPoint } from './hoverCharts.logic'

export function OpSummary({ data }: { data?: HoverChartDataPoint }) {
  if (!data) return null
  if (!data.buyAmount && !data.sellAmount) return null
  return (
    <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
      {data.buyAmount != null && (
        <p style={{ color: SEMANTIC_COLORS.transactionBuy }}>▲ Buy: {fmt.format(data.buyAmount)}</p>
      )}
      {data.sellAmount != null && (
        <>
          <p style={{ color: SEMANTIC_COLORS.transactionSell }}>▼ Sell: {fmt.format(data.sellAmount)}</p>
          {data.sellGain != null && (
            <p className={data.sellGain >= 0 ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}>
              P&L: {fmt.format(data.sellGain)}
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
  if (!active || !payload?.length) return null
  const valueEntry = payload.find((item) => item.dataKey === 'Value')
  const costEntry = payload.find((item) => item.dataKey === 'Cost basis')
  const data = payload[0]?.payload
  return (
    <TooltipBox className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2">{label}</p>
      {valueEntry && <p style={{ color: valueEntry.color }}>{valueEntry.name}: {fmt.format(valueEntry.value ?? 0)}</p>}
      {costEntry && <p style={{ color: costEntry.color }}>{costEntry.name}: {fmt.format(costEntry.value ?? 0)}</p>}
      {valueEntry && costEntry && (
        <p className={`mt-1 font-semibold ${(valueEntry.value ?? 0) >= (costEntry.value ?? 0) ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative}`}>
          Unrealized: {fmt.format((valueEntry.value ?? 0) - (costEntry.value ?? 0))}
        </p>
      )}
      <OpSummary data={data} />
    </TooltipBox>
  )
}

interface TooltipUnitProps extends NumericTooltipProps<HoverChartDataPoint> {
  series: HoverChartDataPoint[]
}

export function TooltipUnit({ active, payload, label, series }: TooltipUnitProps) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const data = p?.payload
  return (
    <TooltipBox className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p style={{ color: p.color }}>Unit price: {fmtDec.format(p.value ?? 0)}</p>
      <RollingUnitPricePerf series={series} label={String(label)} />
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
  if (!active || !payload?.length) return null
  const balance = tooltipValue(payload, 'balance')
  const delta: number = payload[0]?.payload?.delta ?? 0
  const monthStr: string = payload[0]?.payload?.month ?? ''
  return (
    <TooltipBox>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(`${monthStr}-02`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 600, marginBottom: 4 }}>Balance: {fmt.format(balance)}</div>
      {delta !== 0 && (
        <div style={{ color: delta >= 0 ? SEMANTIC_COLORS.netContributionsText : SEMANTIC_COLORS.performanceNegativeText }}>
          {delta >= 0 ? '▲' : '▼'} {fmt.format(Math.abs(delta))}
        </div>
      )}
    </TooltipBox>
  )
}
