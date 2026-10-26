import type { ReactNode } from 'react'

import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Metric } from '@/shared/ui/Metric.view'
import { Text } from '@/shared/ui/Text.view'

import { InfoTooltip } from './InfoTooltip.view'

export type KpiAccent =
  | 'neutral'
  | 'portfolio'
  | 'contributions'
  | 'positive'
  | 'negative'
  | 'income'
  | 'return'

const ACCENT_TONES = {
  neutral: 'subtle',
  portfolio: 'value',
  contributions: 'accent',
  positive: 'positive',
  negative: 'negative',
  income: 'income',
  return: 'return',
} as const

function KpiRoot({
  accent = 'neutral',
  children,
}: {
  accent?: KpiAccent
  children: ReactNode
}) {
  return <Metric tone={ACCENT_TONES[accent]}>{children}</Metric>
}

function KpiLabel({
  children,
  tooltip,
}: {
  children: ReactNode
  tooltip: string
}) {
  const { slot: footer, content } = partitionSlot(children, InfoTooltip.Footer)
  return (
    <Text variant="metricLabel" tone="subtle" className="flex items-center">
      {content}
      <InfoTooltip text={tooltip}>{footer}</InfoTooltip>
    </Text>
  )
}

function KpiValueRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {children}
    </div>
  )
}

function KpiDetail({
  children,
  title,
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <Text variant="caption" tone="subtle" truncate title={title}>
      {children}
    </Text>
  )
}

function KpiFooter({ children }: { children: ReactNode }) {
  return (
    <Text as="div" variant="caption" tone="subtle" className="mt-1">
      {children}
    </Text>
  )
}

export function Kpi({ children }: { children: ReactNode }) {
  return children
}

Kpi.Root = KpiRoot
Kpi.Label = KpiLabel
Kpi.TooltipFooter = InfoTooltip.Footer
Kpi.ValueRow = KpiValueRow
Kpi.Value = Metric.Value
Kpi.InlineNote = Metric.InlineNote
Kpi.Note = Metric.Note
Kpi.Detail = KpiDetail
Kpi.Footer = KpiFooter

export function KpiCard({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-1 basis-56 py-2">{children}</div>
}
