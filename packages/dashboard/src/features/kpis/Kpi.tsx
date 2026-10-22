import type { ReactNode } from 'react'
import { InfoTooltip } from './InfoTooltip'
import type { FilterScopeSpec } from '@/shared/ui/FilterScopeBadges'

export type KpiAccent = 'neutral' | 'portfolio' | 'contributions' | 'positive' | 'negative' | 'income' | 'return'

const ACCENT_CLASSES: Record<KpiAccent, string> = {
  neutral: 'bg-gray-500',
  portfolio: 'bg-cyan-400',
  contributions: 'bg-blue-400',
  positive: 'bg-emerald-400',
  negative: 'bg-red-400',
  income: 'bg-violet-400',
  return: 'bg-teal-400',
}

function KpiRoot({ accent = 'neutral', children }: { accent?: KpiAccent; children: ReactNode }) {
  return (
    <div className="relative min-w-0 flex-1 basis-40 py-1 pl-4">
      <span className={`absolute bottom-1 left-0 top-1 w-[3px] rounded-full ${ACCENT_CLASSES[accent]}`} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-0.5">{children}</div>
    </div>
  )
}

function KpiLabel({ children, tooltip, scope }: {
  children: ReactNode
  tooltip: string
  scope?: FilterScopeSpec
}) {
  return (
    <span className="flex items-center text-[11px] font-semibold uppercase tracking-[0.09em] text-gray-500">
      {children}
      <InfoTooltip text={tooltip} scope={scope} />
    </span>
  )
}

function KpiValueRow({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">{children}</div>
}

function KpiValue({ children, color, title }: {
  children: ReactNode
  color?: string
  title?: string
}) {
  return (
    <span className={`truncate text-2xl font-semibold tracking-tight tabular-nums ${color ?? 'text-white'}`} title={title}>
      {children}
    </span>
  )
}

function KpiInlineNote({ children, color }: { children: ReactNode; color?: string }) {
  return <span className={`shrink-0 text-xs font-semibold tabular-nums ${color ?? 'text-gray-400'}`}>{children}</span>
}

function KpiNote({ children, color, title }: {
  children: ReactNode
  color?: string
  title?: string
}) {
  return <span className={`truncate text-xs ${color ?? 'text-gray-400'}`} title={title}>{children}</span>
}

function KpiDetail({ children, title }: { children: ReactNode; title?: string }) {
  return <span className="truncate text-xs text-gray-600" title={title}>{children}</span>
}

function KpiFooter({ children }: { children: ReactNode }) {
  return <div className="mt-1 text-xs text-gray-500">{children}</div>
}

export function Kpi({ children }: { children: ReactNode }) {
  return children
}

Kpi.Root = KpiRoot
Kpi.Label = KpiLabel
Kpi.ValueRow = KpiValueRow
Kpi.Value = KpiValue
Kpi.InlineNote = KpiInlineNote
Kpi.Note = KpiNote
Kpi.Detail = KpiDetail
Kpi.Footer = KpiFooter

export function KpiCard({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-1 basis-56 py-2">{children}</div>
}
