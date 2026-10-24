import type { HoldingConcentration } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

export type ConcentrationTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: HoldingConcentration }>
}

export function ConcentrationTooltip({ active, payload }: ConcentrationTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const row = payload[0].payload as HoldingConcentration
  return (
    <div className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-content">{row.name}</div>
      <div className="mt-1 text-content-secondary">
        {formatMoney(row.value, { style: 'full' })} · {formatPercentage(row.weight)}
      </div>
    </div>
  )
}
