import type { ReactNode } from 'react'
import { InfoTooltip } from './InfoTooltip'

interface KpiProps {
  label: string
  tooltip: string
  value: string
  valueColor?: string
  accent?: KpiAccent
  sub?: string
  subColor?: string
  subSmall?: string
  subInline?: boolean
  footer?: ReactNode
}

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

export function Kpi({ label, tooltip, value, valueColor, accent = 'neutral', sub, subColor, subSmall, subInline = false, footer }: KpiProps) {
  return (
    <div className="relative min-w-0 flex-1 basis-40 py-1 pl-4">
      <span className={`absolute bottom-1 left-0 top-1 w-[3px] rounded-full ${ACCENT_CLASSES[accent]}`} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center text-[11px] font-semibold uppercase tracking-[0.09em] text-gray-500">
          {label}
          <InfoTooltip text={tooltip} />
        </span>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={`truncate text-2xl font-semibold tracking-tight tabular-nums ${valueColor ?? 'text-white'}`} title={value}>{value}</span>
          {subInline && sub && <span className={`shrink-0 text-xs font-semibold tabular-nums ${subColor ?? 'text-gray-400'}`}>{sub}</span>}
        </div>
        {!subInline && sub && <span className={`truncate text-xs ${subColor ?? 'text-gray-400'}`} title={sub}>{sub}</span>}
        {subSmall && <span className="truncate text-xs text-gray-600" title={subSmall}>{subSmall}</span>}
        {footer && <div className="mt-1 text-xs text-gray-500">{footer}</div>}
      </div>
    </div>
  )
}

export function KpiCard({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-1 basis-56 py-2">{children}</div>
}
