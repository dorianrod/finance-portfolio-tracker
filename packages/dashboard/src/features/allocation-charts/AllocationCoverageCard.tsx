import { useId, useState } from 'react'
import { fmtFull } from '@/shared/format/money'
import { SEMANTIC_COLORS, SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { accountLabel } from '@/features/filters/filterBar.logic'
import type { AccountCoverage } from './allocationCoverage.logic'

interface AllocationCoverageCardProps {
  coverage: AccountCoverage[]
  accountLabels: Record<string, string>
}

export function AllocationCoverageCard({ coverage, accountLabels }: AllocationCoverageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const detailsId = useId()
  const totalAllocated = coverage.reduce((s, c) => s + c.allocated, 0)
  const totalUnallocated = coverage.reduce((s, c) => s + c.unallocated, 0)
  const total = totalAllocated + totalUnallocated
  if (total <= 0) return null

  const overallPct = (totalAllocated / total) * 100
  const roundedOverallPct = Math.round(overallPct)
  const roundedUnallocatedPct = 100 - roundedOverallPct

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-xs font-medium text-gray-500">Allocation-row coverage</h2>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? 'Hide details' : 'Account details'}
          <svg
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-600">Position mapping</div>
          <div className={`mt-2 text-2xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.coverage}`}>{roundedOverallPct}%</div>
          <div
            className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-800"
            role="progressbar"
            aria-label="Positions mapped to an allocation row"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={roundedOverallPct}
            title={`${fmtFull(totalAllocated)} allocated / ${fmtFull(totalUnallocated)} not allocated`}
          >
            {totalAllocated > 0 && <div style={{ width: `${overallPct}%`, backgroundColor: SEMANTIC_COLORS.coverage }} />}
            {totalUnallocated > 0 && (
              <div style={{ width: `${100 - overallPct}%`, backgroundColor: SEMANTIC_COLORS.coverageGap }} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.coverage }} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">Mapped to a row</span>
          </div>
          <div className="mt-2 truncate text-xl font-semibold tabular-nums text-gray-200" title={fmtFull(totalAllocated)}>
            {fmtFull(totalAllocated)}
          </div>
          <div className="mt-2 text-xs tabular-nums text-gray-600">{roundedOverallPct}% of the portfolio</div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEMANTIC_COLORS.coverageGap }} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-600">No allocation row</span>
          </div>
          <div className="mt-2 truncate text-xl font-semibold tabular-nums text-gray-200" title={fmtFull(totalUnallocated)}>
            {fmtFull(totalUnallocated)}
          </div>
          <div className="mt-2 text-xs tabular-nums text-gray-600">{roundedUnallocatedPct}% of the portfolio</div>
        </div>
      </div>

      {isExpanded && (
        <div id={detailsId} className="mt-3 rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
          <div className="mb-4 text-xs font-medium text-gray-500">Coverage by account</div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            {coverage.map((c) => {
              const rowTotal = c.allocated + c.unallocated
              if (rowTotal <= 0) return null
              const pct = (c.allocated / rowTotal) * 100
              const label = accountLabel(c.account, accountLabels)
              return (
                <div key={c.account}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="truncate text-xs text-gray-400" title={label}>
                      {label}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-gray-600">
                      {fmtFull(rowTotal)} · {Math.round(pct)}%
                    </span>
                  </div>
                  <div
                    className="flex h-1.5 overflow-hidden rounded-full bg-gray-800"
                    title={`${fmtFull(c.allocated)} allocated / ${fmtFull(c.unallocated)} not allocated`}
                  >
                    {c.allocated > 0 && <div style={{ width: `${pct}%`, backgroundColor: SEMANTIC_COLORS.coverage }} />}
                    {c.unallocated > 0 && (
                      <div style={{ width: `${100 - pct}%`, backgroundColor: SEMANTIC_COLORS.coverageGap }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
