import { createPortal } from 'react-dom'
import { fmtFull } from '@/shared/format/money'
import { catColor } from '@/shared/format/colors'
import type { AllocationFilter, MatchingIsinRow } from './allocationCharts.types'

export function FilteredPositionsTable({
  rows,
  filter,
  onClose,
}: {
  rows: MatchingIsinRow[]
  filter: AllocationFilter
  onClose: () => void
}) {
  const totalFiltered = rows.reduce((s, r) => s + r.filteredValue, 0)

  return createPortal(
    <div
      style={{ position: 'fixed', top: 0, right: 0, width: 480, height: '100vh', zIndex: 9990 }}
      className="bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Positions — <span style={{ color: catColor(filter.value) }}>{filter.value}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {rows.length} positions · {fmtFull(totalFiltered)} in exposure
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 text-lg leading-none cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: catColor(filter.value) }}>
                {filter.value}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const pct = row.totalValue > 0 ? (row.filteredValue / row.totalValue) * 100 : 0
              return (
                <tr key={row.isin} className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-gray-800/20'}`}>
                  <td className="px-4 py-2.5">
                    <div className="text-gray-200 font-medium text-xs leading-tight truncate max-w-[180px]">{row.name}</div>
                    <div className="text-gray-600 text-[11px]">{row.isin}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums text-xs">
                    {fmtFull(row.totalValue)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="text-gray-200 tabular-nums text-xs font-medium">{fmtFull(row.filteredValue)}</div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, background: catColor(filter.value) }}
                        />
                      </div>
                      <span className="text-gray-500 text-[11px] tabular-nums w-8 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>,
    document.body,
  )
}
