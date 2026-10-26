import type { ReactNode } from 'react'

import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Progress } from '@/shared/ui/Controls.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

type QualityTone = 'neutral' | 'coverage' | 'warning' | 'error' | 'muted'

const TONES = {
  neutral: { text: 'accent', bar: 'netContributions' },
  coverage: { text: 'positive', bar: 'coverage' },
  warning: { text: 'warning', bar: 'coverageGap' },
  error: { text: 'negative', bar: 'performanceNegative' },
  muted: { text: 'muted', bar: 'mutedIndicator' },
} as const

export function QualityIndicatorCard({
  label,
  tooltip,
  amount,
  percentage,
  detail,
  tone = 'neutral',
  children,
}: {
  label: string
  tooltip: string
  amount: number
  percentage: number
  detail?: string
  tone?: QualityTone
  children?: ReactNode
}) {
  const { slot: footer, content } = partitionSlot(children, InfoTooltip.Footer)
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const safePercentage = Number.isFinite(percentage)
    ? Math.max(0, Math.min(100, percentage))
    : 0
  const percentageLabel = formatPercentage(safePercentage)
  const colors = TONES[tone]

  return (
    <Surface variant="qualityCard" className="p-4">
      <Text
        as="div"
        variant="captionLabel"
        tone="muted"
        className="flex items-center"
      >
        <span>{label}</span>
        <InfoTooltip text={tooltip}>{footer}</InfoTooltip>
      </Text>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <Text variant="metricSecondary" tone={colors.text} numeric>
          {percentageLabel}
        </Text>
        <Text variant="caption" tone="subtle" numeric>
          {formatMoney(amount, { style: 'full' })}
        </Text>
      </div>
      <Progress
        variant="track"
        className="mt-3 h-1.5 overflow-hidden"
        label={label}
        value={safePercentage}
      >
        <SeriesSwatch
          as="div"
          shape="dot"
          tone={colors.bar}
          className="h-full"
          style={{ width: `${safePercentage}%` }}
        />
      </Progress>
      {detail && (
        <Text as="div" variant="caption" tone="subtle" className="mt-2">
          {detail}
        </Text>
      )}
      {content}
    </Surface>
  )
}

QualityIndicatorCard.TooltipFooter = InfoTooltip.Footer
