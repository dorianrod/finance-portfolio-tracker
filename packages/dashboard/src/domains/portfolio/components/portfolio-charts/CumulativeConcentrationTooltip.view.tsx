import { fmtFull } from '@/shared/format/money'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'
import type { CumulativeConcentrationPoint } from './portfolioCharts.logic'

interface CumulativeConcentrationTooltipProps {
  active?: boolean
  payload?: Array<{ payload: CumulativeConcentrationPoint }>
}

export function CumulativeConcentrationTooltip({
  active,
  payload,
}: CumulativeConcentrationTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const assetLabel = point.rank === 1 ? 'asset' : 'assets'

  return (
    <TooltipBox minWidth={220}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        Top {point.rank} {assetLabel} · {point.cumulativeWeight.toFixed(1)}%
      </div>
      <div className="mt-1" style={{ color: 'var(--tooltip-label)' }}>
        #{point.rank} {point.name}
      </div>
      <div className="mt-0.5" style={{ color: SEMANTIC_COLORS.riskSecondary }}>
        {fmtFull(point.value)} · {point.weight.toFixed(1)}%
      </div>
    </TooltipBox>
  )
}
