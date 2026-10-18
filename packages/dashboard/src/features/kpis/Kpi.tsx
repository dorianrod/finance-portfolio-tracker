import type { ReactNode } from 'react'
import { InfoTooltip } from './InfoTooltip'

interface KpiProps {
  label: string
  tooltip: string
  value: string
  valueColor?: string
  sub?: string
  subColor?: string
  subSmall?: string
  subInline?: boolean
}

export function Kpi({ label, tooltip, value, valueColor, sub, subColor, subSmall, subInline = false }: KpiProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
        <InfoTooltip text={tooltip} />
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`truncate text-xl font-semibold tabular-nums ${valueColor ?? 'text-white'}`} title={value}>{value}</span>
        {subInline && sub && <span className={`shrink-0 text-xs font-medium tabular-nums ${subColor ?? 'text-gray-400'}`}>{sub}</span>}
      </div>
      {!subInline && sub && <span className={`truncate text-xs ${subColor ?? 'text-gray-400'}`} title={sub}>{sub}</span>}
      {subSmall && <span className="truncate text-xs text-gray-600" title={subSmall}>{subSmall}</span>}
    </div>
  )
}

export function KpiCard({ children }: { children: ReactNode }) {
  return <div className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">{children}</div>
}
