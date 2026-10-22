import type { ReactNode } from 'react'
import { InfoTooltip } from '@/domains/portfolio/components/kpis/InfoTooltip.view'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

type QualityTone = 'neutral' | 'coverage' | 'warning' | 'error' | 'muted'

const TONES: Record<QualityTone, { text: string; bar: string }> = {
  neutral: { text: 'text-accent', bar: SEMANTIC_COLORS.netContributions },
  coverage: { text: SEMANTIC_TEXT_CLASSES.coverage, bar: SEMANTIC_COLORS.coverage },
  warning: { text: SEMANTIC_TEXT_CLASSES.warning, bar: SEMANTIC_COLORS.coverageGap },
  error: { text: SEMANTIC_TEXT_CLASSES.error, bar: SEMANTIC_COLORS.performanceNegative },
  muted: { text: 'text-content-muted', bar: '#6b7280' },
}

export function QualityIndicatorCard({
  label,
  tooltip,
  amount,
  percentage,
  detail,
  tone = 'neutral',
  tooltipFooter,
  children,
}: {
  label: string
  tooltip: string
  amount: number
  percentage: number
  detail?: string
  tone?: QualityTone
  tooltipFooter?: ReactNode
  children?: ReactNode
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const safePercentage = Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0
  const percentageLabel = formatPercentage(safePercentage)
  const colors = TONES[tone]

  return (
    <div className="quality-indicator-card rounded-card border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center text-xs font-medium text-content-muted">
        <span>{label}</span>
        <InfoTooltip text={tooltip} footer={tooltipFooter} />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className={`text-xl font-semibold tabular-nums ${colors.text}`}>{percentageLabel}</span>
        <span className="text-xs tabular-nums text-content-subtle">{formatMoney(amount, { style: 'full' })}</span>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercentage}
      >
        <div className="h-full rounded-full" style={{ width: `${safePercentage}%`, backgroundColor: colors.bar }} />
      </div>
      {detail && <div className="mt-2 text-xs text-content-subtle">{detail}</div>}
      {children}
    </div>
  )
}
