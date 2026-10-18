import { useState } from 'react'
import type { DimensionCoverage } from './allocationCoverage.logic'
import { fmtFull } from '@/shared/format/money'

const LABELS: Record<DimensionCoverage['dimension'], string> = {
  geo: 'Geography', secteur: 'Sector', currency: 'Currency', classe: 'Asset class',
}

export function AllocationDimensionQuality({ coverage }: { coverage: DimensionCoverage[] }) {
  const [open, setOpen] = useState<DimensionCoverage['dimension'] | null>(null)
  return (
    <div className="space-y-4">
      {coverage.map((item) => {
        const total = item.allocated + item.unallocated
        const missingPct = total > 0 ? item.unallocated / total * 100 : 0
        const isOpen = open === item.dimension
        return (
          <div key={item.dimension}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-xs text-gray-400">{LABELS[item.dimension]}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-gray-600">{fmtFull(item.unallocated)} · {formatPercentage(missingPct)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800" title={`${formatPercentage(missingPct)}% not classified for ${LABELS[item.dimension].toLowerCase()}`}>
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, missingPct)}%` }} />
            </div>
            <button type="button" onClick={() => setOpen(isOpen ? null : item.dimension)} className="mt-1.5 text-[11px] text-blue-400 hover:text-blue-300">{isOpen ? 'Hide responsible assets' : `${item.issues.length} responsible assets`}</button>
            {isOpen && <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-lg border border-gray-800 bg-gray-950/40 p-2.5">{item.issues.map((issue) => <div key={issue.id} className="flex gap-3 text-xs"><span className="min-w-0 flex-1 truncate text-gray-400" title={issue.name}>{issue.name}</span><span className="shrink-0 tabular-nums text-amber-300">{fmtFull(issue.unallocated)}</span></div>)}</div>}
          </div>
        )
      })}
    </div>
  )
}

function formatPercentage(value: number) {
  if (value > 0 && value < 0.1) return value.toFixed(2)
  return value.toFixed(1)
}
