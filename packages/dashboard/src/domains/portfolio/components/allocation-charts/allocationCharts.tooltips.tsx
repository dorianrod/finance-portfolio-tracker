import { fmtEur, fmtFull } from '@/shared/format/money'
import { catColor } from '@/shared/format/colors'
import { TooltipBox } from '@/shared/ui/TooltipBox'
import type { PieEntry } from './allocationCharts.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload as PieEntry
  const pct = item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : '0'
  return (
    <TooltipBox minWidth={160}>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 4, fontWeight: 600 }}>{item.name}</div>
      <div style={{ color: 'var(--tooltip-label)', fontWeight: 700 }}>{fmtFull(item.value)}</div>
      <div style={{ color: 'var(--tooltip-dim)', marginBottom: item.subItems?.length ? 6 : 0 }}>
        {pct}% of total allocated
      </div>
      {item.subItems?.map((sub) => {
        const subPct = item.total > 0 ? ((sub.value / item.total) * 100).toFixed(1) : '0'
        return (
          <div key={sub.name} style={{ color: 'var(--tooltip-dim)', marginTop: 2 }}>
            {sub.name} — {fmtEur(sub.value)} · {subPct}%
          </div>
        )
      })}
    </TooltipBox>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EvolutionTooltip({ active, payload, label, categories }: any) {
  if (!active || !payload?.length) return null
  return (
    <TooltipBox maxWidth={220}>
      <div style={{ color: 'var(--tooltip-text)', marginBottom: 6 }}>
        {new Date(label).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
      </div>
      {(categories as string[]).slice(0).reverse().map((cat: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = payload.find((p: any) => p.dataKey === cat)?.value ?? 0
        if (!val) return null
        return (
          <div key={cat} style={{ color: catColor(cat) }}>
            {cat}: {(val as number).toFixed(1)}%
          </div>
        )
      })}
    </TooltipBox>
  )
}
