import type { CumulativeConcentrationPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

type CumulativeConcentrationTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: CumulativeConcentrationPoint }>
}

export function CumulativeConcentrationTooltip({
  active,
  payload,
}: CumulativeConcentrationTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const assetLabel = point.rank === 1 ? 'asset' : 'assets'

  return (
    <TooltipBox minWidth={220}>
      <div className="font-semibold" style={{ color: 'var(--tooltip-text)' }}>
        {i18n.t('ui.cumulativeconcentrationtooltip.top')} {point.rank}{' '}
        {assetLabel} · {formatPercentage(point.cumulativeWeight)}
      </div>
      <div className="mt-1" style={{ color: 'var(--tooltip-label)' }}>
        #{point.rank} {point.name}
      </div>
      <div className="mt-0.5" style={{ color: SEMANTIC_COLORS.riskSecondary }}>
        {formatMoney(point.value, { style: 'full' })} ·{' '}
        {formatPercentage(point.weight)}
      </div>
    </TooltipBox>
  )
}
