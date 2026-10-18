import { fmtFull } from '@/shared/format/money'
import { catColor } from '@/shared/format/colors'
import { SidePanel } from '@/shared/ui/SidePanel'
import type { AllocationFilter, MatchingIsinRow } from './allocationCharts.types'

export function FilteredPositionsTable({
  rows,
  filter,
  onClearFilter,
  onClose,
}: {
  rows: MatchingIsinRow[]
  filter: AllocationFilter
  onClearFilter: () => void
  onClose: () => void
}) {
  const totalFiltered = rows.reduce((s, r) => s + r.filteredValue, 0)

  return (
    <SidePanel
      title={<>Positions — <span style={{ color: catColor(filter.value) }}>{filter.value}</span></>}
      description={`${rows.length} positions · ${fmtFull(totalFiltered)} in exposure`}
      onClose={onClose}
      closeLabel="Close positions"
      headerActions={(
        <button
          type="button"
          onClick={onClearFilter}
          className="cursor-pointer rounded-lg border border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-500 hover:bg-gray-800 hover:text-gray-200"
        >
          Clear filter
        </button>
      )}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-900">
          <tr className="border-b border-gray-800">
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Total</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide" style={{ color: catColor(filter.value) }}>
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
                  <div className="max-w-[180px] truncate text-xs font-medium leading-tight text-gray-200">{row.name}</div>
                  <div className="text-[11px] text-gray-600">{row.isin}</div>
                </td>
                <td className="px-4 py-2.5 text-right text-xs tabular-nums text-gray-400">
                  {fmtFull(row.totalValue)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="text-xs font-medium tabular-nums text-gray-200">{fmtFull(row.filteredValue)}</div>
                  <div className="mt-0.5 flex items-center justify-end gap-1.5">
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%`, background: catColor(filter.value) }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] tabular-nums text-gray-500">{pct.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </SidePanel>
  )
}
