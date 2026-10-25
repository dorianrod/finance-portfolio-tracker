import type { ReactNode } from 'react'

import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Decorative } from '@/shared/ui/Controls.view'

import { InfoTooltip } from './InfoTooltip.view'

export type KpiAccent =
  | 'neutral'
  | 'portfolio'
  | 'contributions'
  | 'positive'
  | 'negative'
  | 'income'
  | 'return'

const ACCENT_CLASSES: Record<KpiAccent, string> = {
  neutral: 'bg-content-subtle',
  portfolio: 'bg-value',
  contributions: 'bg-accent',
  positive: 'bg-positive',
  negative: 'bg-danger',
  income: 'bg-income',
  return: 'bg-return',
}

function KpiRoot({
  accent = 'neutral',
  children,
}: {
  accent?: KpiAccent
  children: ReactNode
}) {
  return (
    <div className="relative min-w-0 flex-1 basis-40 py-1 pl-4">
      <Decorative
        className={`absolute bottom-1 left-0 top-1 w-[3px] rounded-full ${ACCENT_CLASSES[accent]}`}
      />
      <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
    </div>
  )
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
    <span className="flex items-center text-[11px] font-semibold uppercase tracking-[0.09em] text-content-subtle">
      {content}
      <InfoTooltip text={tooltip}>{footer}</InfoTooltip>
    </span>
  )
}

function KpiValueRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {children}
    </div>
  )
}

function KpiValue({
  children,
  color,
  title,
}: {
  children: ReactNode
  color?: string
  title?: string
}) {
  return (
    <span
      className={`truncate text-2xl font-semibold tracking-tight tabular-nums ${color ?? 'text-content'}`}
      title={title}
    >
      {children}
    </span>
  )
}

function KpiInlineNote({
  children,
  color,
}: {
  children: ReactNode
  color?: string
}) {
  return (
    <span
      className={`shrink-0 text-xs font-semibold tabular-nums ${color ?? 'text-content-muted'}`}
    >
      {children}
    </span>
  )
}

function KpiNote({
  children,
  color,
  title,
}: {
  children: ReactNode
  color?: string
  title?: string
}) {
  return (
    <span
      className={`truncate text-xs ${color ?? 'text-content-muted'}`}
      title={title}
    >
      {children}
    </span>
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
    <span className="truncate text-xs text-content-subtle" title={title}>
      {children}
    </span>
  )
}

function KpiFooter({ children }: { children: ReactNode }) {
  return <div className="mt-1 text-xs text-content-subtle">{children}</div>
}

export function Kpi({ children }: { children: ReactNode }) {
  return children
}

Kpi.Root = KpiRoot
Kpi.Label = KpiLabel
Kpi.TooltipFooter = InfoTooltip.Footer
Kpi.ValueRow = KpiValueRow
Kpi.Value = KpiValue
Kpi.InlineNote = KpiInlineNote
Kpi.Note = KpiNote
Kpi.Detail = KpiDetail
Kpi.Footer = KpiFooter

export function KpiCard({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-1 basis-56 py-2">{children}</div>
}
