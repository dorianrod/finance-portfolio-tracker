import type { ReactNode } from 'react'

import { ToneSwatch } from './Swatch.view'
import type { SWATCH_TONES } from './swatchAppearance'
import { Text } from './Text.view'
import type { TextTone } from './textAppearance'

export function Metric({
  tone = 'subtle',
  children,
}: {
  tone?: keyof typeof SWATCH_TONES
  children: ReactNode
}) {
  return (
    <div className="relative min-w-0 flex-1 basis-40 py-1 pl-4">
      <div className="absolute bottom-1 left-0 top-1 w-[3px]">
        <ToneSwatch as="div" tone={tone} shape="dot" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
    </div>
  )
}

type ValueProps = { children: ReactNode; tone?: TextTone; title?: string }

function MetricValue({ children, tone = 'default', title }: ValueProps) {
  return (
    <Text variant="metric" tone={tone} numeric truncate title={title}>
      {children}
    </Text>
  )
}
function MetricInlineNote({ children, tone = 'muted' }: ValueProps) {
  return (
    <span className="shrink-0">
      <Text variant="captionStrong" tone={tone} numeric>
        {children}
      </Text>
    </span>
  )
}
function MetricNote({ children, tone = 'muted', title }: ValueProps) {
  return (
    <Text variant="caption" tone={tone} truncate title={title}>
      {children}
    </Text>
  )
}

Metric.Value = MetricValue
Metric.InlineNote = MetricInlineNote
Metric.Note = MetricNote
