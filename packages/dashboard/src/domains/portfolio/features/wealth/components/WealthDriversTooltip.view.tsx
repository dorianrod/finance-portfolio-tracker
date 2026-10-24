import type { WealthDriverPoint } from '@/domains/portfolio/shared/helpers/calculators/calculatePortfolioCharts'
type DriversTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: WealthDriverPoint }>
  label?: string | number | Date
}

import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

export function DriversTooltip({
  active,
  payload,
  label,
}: DriversTooltipProps) {
  const formatMoney = useFormatMoney()
  const formatDate = useFormatDate()
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload as WealthDriverPoint
  return (
    <div className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-xl">
      <div className="mb-2 font-semibold text-content">
        {label == null ? '' : formatDate(label, { style: 'shortMonthYear' })}
      </div>
      <div className="space-y-1 text-content-secondary">
        <div className="flex justify-between gap-6">
          <span>{i18n.t('ui.wealthdriverschart.netContributions')}</span>
          <span
            className="font-medium"
            style={{ color: SEMANTIC_COLORS.netContributionsText }}
          >
            {formatMoney(row.cumulative_savings, { style: 'full' })}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span>{i18n.t('ui.wealthdriverschart.marketPerformance')}</span>
          <span
            className="font-medium"
            style={{
              color:
                row.cumulative_performance >= 0
                  ? SEMANTIC_COLORS.performancePositiveText
                  : SEMANTIC_COLORS.performanceNegativeText,
            }}
          >
            {formatMoney(row.cumulative_performance, { style: 'full' })}
          </span>
        </div>
        <div className="flex justify-between gap-6 border-t border-border-strong pt-1">
          <span>{i18n.t('ui.wealthdriverschart.totalChange')}</span>
          <span className="font-semibold text-content">
            {formatMoney(row.cumulative_change, { style: 'full' })}
          </span>
        </div>
      </div>
    </div>
  )
}
