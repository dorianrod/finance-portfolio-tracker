import type { ReactNode } from 'react'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'
import { fmtFull } from '@/shared/format/money'
import { formatPercentage } from '@/shared/format/percentage'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import type { FilterScopeSpec } from '@/shared/ui/FilterScopeBadges'

type QualityTone = 'neutral' | 'coverage' | 'warning' | 'error' | 'muted'

const TONES: Record<QualityTone, { text: string; bar: string }> = {
  neutral: { text: 'text-blue-400', bar: SEMANTIC_COLORS.netContributions },
  coverage: { text: SEMANTIC_TEXT_CLASSES.coverage, bar: SEMANTIC_COLORS.coverage },
  warning: { text: SEMANTIC_TEXT_CLASSES.warning, bar: SEMANTIC_COLORS.coverageGap },
  error: { text: SEMANTIC_TEXT_CLASSES.error, bar: SEMANTIC_COLORS.performanceNegative },
  muted: { text: 'text-gray-400', bar: '#6b7280' },
}

export function QualityIndicatorCard({
  label,
  tooltip,
  amount,
  percentage,
  detail,
  tone = 'neutral',
  scope = { account: 'filterable', period: 'latest' },
  children,
}: {
  label: string
  tooltip: string
  amount: number
  percentage: number
  detail?: string
  tone?: QualityTone
  scope?: FilterScopeSpec
  children?: ReactNode
}) {
  const safePercentage = Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0
  const percentageLabel = formatPercentage(safePercentage)
  const colors = TONES[tone]

  return (
    <div className="quality-indicator-card rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
      <div className="flex items-center text-xs font-medium text-gray-400">
        <span>{label}</span>
        <InfoTooltip text={tooltip} scope={scope} />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className={`text-xl font-semibold tabular-nums ${colors.text}`}>{percentageLabel}%</span>
        <span className="text-xs tabular-nums text-gray-500">{fmtFull(amount)}</span>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercentage}
      >
        <div className="h-full rounded-full" style={{ width: `${safePercentage}%`, backgroundColor: colors.bar }} />
      </div>
      {detail && <div className="mt-2 text-xs text-gray-600">{detail}</div>}
      {children}
    </div>
  )
}
