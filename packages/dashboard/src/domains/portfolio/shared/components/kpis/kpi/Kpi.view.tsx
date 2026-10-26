import type { ReactNode } from 'react'

import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Metric } from '@/shared/ui/Metric.view'
import { Text } from '@/shared/ui/Text.view'

import type { KpiAccent } from './kpi.types'

export function Kpi({ children }: { children: ReactNode }) {
  return children
}

const ACCENT_TONES = {
  neutral: 'subtle',
  portfolio: 'highlight',
  contributions: 'accent',
  positive: 'positive',
  negative: 'negative',
  income: 'decorative',
  return: 'contrast',
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
    <Text variant="metricLabel" tone="subtle">
      <Inline as="span" align="center">
        {content}
        <InfoTooltip text={tooltip}>{footer}</InfoTooltip>
      </Inline>
    </Text>
  )
}

function KpiValueRow({ children }: { children: ReactNode }) {
  return (
    <Inline as="div" flow="wrap" align="baseline" gap="compact">
      {children}
    </Inline>
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
    <Layout spaceBefore="compact">
      <Text as="div" variant="caption" tone="subtle">
        {children}
      </Text>
    </Layout>
  )
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
