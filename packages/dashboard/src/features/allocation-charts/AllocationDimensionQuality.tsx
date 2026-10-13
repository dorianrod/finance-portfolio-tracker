import { useState } from 'react'
import type { DimensionCoverage } from './allocationCoverage.logic'
import { fmtFull } from '@/shared/format/money'

const LABELS: Record<DimensionCoverage['dimension'], string> = {
  geo: 'Geography', secteur: 'Sector', currency: 'Currency', classe: 'Asset class',
}

export function AllocationDimensionQuality({ coverage }: { coverage: DimensionCoverage[] }) {
  const [open, setOpen] = useState<DimensionCoverage['dimension'] | null>(null)
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {coverage.map((item) => {
        const total = item.allocated + item.unallocated
        const missingPct = total > 0 ? item.unallocated / total * 100 : 0
        const missingLabel = missingPct > 0 && missingPct < 0.1
          ? missingPct.toFixed(2)
          : missingPct.toFixed(1)
        const isOpen = open === item.dimension
        return (
          <div key={item.dimension} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="text-xs font-medium text-gray-400">{LABELS[item.dimension]}</div>
            <div className="mt-2 flex items-baseline justify-between gap-3"><span className="text-xl font-semibold text-white">{missingLabel}% NC</span><span className="text-xs tabular-nums text-gray-500">{fmtFull(item.unallocated)}</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-amber-500" style={{ width: `${Math.min(100, missingPct)}%` }} /></div>
            <button type="button" onClick={() => setOpen(isOpen ? null : item.dimension)} className="mt-3 text-xs text-blue-400 hover:text-blue-300">{isOpen ? 'Hide responsible assets' : `${item.issues.length} responsible assets`}</button>
            {isOpen && <div className="mt-3 max-h-48 space-y-2 overflow-auto border-t border-gray-800 pt-3">{item.issues.map((issue) => <div key={issue.id} className="flex gap-3 text-xs"><span className="min-w-0 flex-1 truncate text-gray-400" title={issue.name}>{issue.name}</span><span className="shrink-0 tabular-nums text-amber-300">{fmtFull(issue.unallocated)}</span></div>)}</div>}
          </div>
        )
      })}
    </div>
  )
}
