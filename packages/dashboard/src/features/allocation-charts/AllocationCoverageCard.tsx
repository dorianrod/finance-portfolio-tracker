import { fmtFull } from '@/shared/format/money'
import { accountLabel } from '@/features/filters/filterBar.logic'
import type { AccountCoverage } from './allocationCoverage.logic'

const ALLOCATED_COLOR = '#10b981'
const UNALLOCATED_COLOR = '#f59e0b'

interface AllocationCoverageCardProps {
  coverage: AccountCoverage[]
  accountLabels: Record<string, string>
}

export function AllocationCoverageCard({ coverage, accountLabels }: AllocationCoverageCardProps) {
  const totalAllocated = coverage.reduce((s, c) => s + c.allocated, 0)
  const totalUnallocated = coverage.reduce((s, c) => s + c.unallocated, 0)
  const total = totalAllocated + totalUnallocated
  if (total <= 0) return null

  const overallPct = Math.round((totalAllocated / total) * 100)

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-sm font-medium text-gray-400">Allocation coverage by account</h2>
        <span className="text-xs text-gray-600">{overallPct}% allocated overall</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ALLOCATED_COLOR }} />
          Allocated ({fmtFull(totalAllocated)})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: UNALLOCATED_COLOR }} />
          Not allocated ({fmtFull(totalUnallocated)})
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {coverage.map((c) => {
          const rowTotal = c.allocated + c.unallocated
          if (rowTotal <= 0) return null
          const pct = (c.allocated / rowTotal) * 100
          const label = accountLabel(c.account, accountLabels)
          return (
            <div key={c.account} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-40 truncate shrink-0" title={label}>
                {label}
              </span>
              <div
                className="flex-1 h-4 rounded-sm overflow-hidden flex bg-gray-800"
                title={`${fmtFull(c.allocated)} allocated / ${fmtFull(c.unallocated)} not allocated`}
              >
                {c.allocated > 0 && <div style={{ width: `${pct}%`, backgroundColor: ALLOCATED_COLOR }} />}
                {c.unallocated > 0 && <div style={{ width: `${100 - pct}%`, backgroundColor: UNALLOCATED_COLOR }} />}
              </div>
              <span className="text-xs text-gray-500 w-28 text-right shrink-0">{fmtFull(rowTotal)}</span>
              <span className="text-xs text-gray-600 w-10 text-right shrink-0">{Math.round(pct)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
