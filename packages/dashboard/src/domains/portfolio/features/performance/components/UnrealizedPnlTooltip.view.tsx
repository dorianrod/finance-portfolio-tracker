import type { PortfolioHistoryPoint } from '@/domains/portfolio/shared/types/portfolioHistoryPoint.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { CHART_THEME } from '@/shared/theme/chartTheme'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'
import { TooltipBox } from '@/shared/ui/TooltipBox.view'

export type UnrealizedPnlPoint = PortfolioHistoryPoint & {
  unrealized_gain_pct: number | null
  snapshot_change: number | null
}

export type UnrealizedPnlTooltipProps = {
  active?: boolean
  payload?: Array<{ payload: UnrealizedPnlPoint }>
}

export function UnrealizedPnlTooltip({
  active,
  payload,
}: UnrealizedPnlTooltipProps) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null

  const valueColor =
    point.unrealized_gain >= 0
      ? SEMANTIC_COLORS.performancePositiveText
      : SEMANTIC_COLORS.performanceNegativeText
  const date = formatDate(point.date, { style: 'longDayMonthYear' })

  return (
    <TooltipBox>
      <div
        style={{
          color: 'var(--tooltip-text)',
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {date}
      </div>
      <div style={{ color: valueColor, fontWeight: 600 }}>
        {i18n.t('ui.unrealizedpnlchart.grossUnrealizedAmount', {
          amount: formatMoney(point.unrealized_gain, { style: 'full' }),
        })}
      </div>
      <div style={{ color: 'var(--tooltip-label)', marginTop: 4 }}>
        {i18n.t('ui.unrealizedpnlchart.capitalReturn', {
          percentage:
            point.unrealized_gain_pct == null
              ? '—'
              : formatPercentage(point.unrealized_gain_pct, { signed: true }),
        })}
      </div>
      <div style={{ color: CHART_THEME.label, marginTop: 4 }}>
        {i18n.t('ui.unrealizedpnlchart.costBasisWithValues', {
          amount: formatMoney(point.total_cost_basis, { style: 'full' }),
        })}
      </div>
      {point.snapshot_change != null && (
        <div
          style={{
            borderTop: '1px solid var(--tooltip-border)',
            color: CHART_THEME.label,
            marginTop: 6,
            paddingTop: 6,
          }}
        >
          {i18n.t(
            'ui.unrealizedpnlchart.changeSincePreviousSnapshotWithValues',
            { amount: formatMoney(point.snapshot_change, { style: 'full' }) },
          )}
        </div>
      )}
    </TooltipBox>
  )
}
