import i18n from '@/i18n/i18n'
import { useAtomValue } from 'jotai'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { catColor } from '@/shared/theme/chartColors'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import type { MatchingIsinRow } from './allocationCharts.types'
import { useDashboardAllocationFilters } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationFilters'
import { useDashboardAllocationPositions } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationPositions'
import { dashboardAllocationFilterAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'

function FilteredPositionRow({ color, index, row }: { color: string; index: number; row: MatchingIsinRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const percentage = row.totalValue > 0 ? row.filteredValue / row.totalValue * 100 : 0
  return <tr className={`border-b border-gray-800/50 ${index % 2 === 0 ? '' : 'bg-gray-800/20'}`}><td className="px-4 py-2.5"><div className="max-w-[180px] truncate text-xs font-medium leading-tight text-gray-200">{row.name}</div><div className="text-[11px] text-gray-600">{row.isin}</div></td><td className="px-4 py-2.5 text-right text-xs tabular-nums text-gray-400">{formatMoney(row.totalValue, { style: 'full' })}</td><td className="px-4 py-2.5 text-right"><div className="text-xs font-medium tabular-nums text-gray-200">{formatMoney(row.filteredValue, { style: 'full' })}</div><div className="mt-0.5 flex items-center justify-end gap-1.5"><div className="h-1 w-12 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, background: color }} /></div><span className="w-8 text-right text-[11px] tabular-nums text-gray-500">{formatPercentage(percentage, { decimals: 0 })}</span></div></td></tr>
}

export function FilteredPositionsTable({
  rows,
}: {
  rows: MatchingIsinRow[]
}) {
  const formatMoney = useFormatMoney()
  const filter = useAtomValue(dashboardAllocationFilterAtom)
  const { clearFilter } = useDashboardAllocationFilters()
  const { closePositions } = useDashboardAllocationPositions()
  if (!filter) return null
  const totalFiltered = rows.reduce((s, r) => s + r.filteredValue, 0)
  const filterColor = catColor(filter.value)

  return (
    <SidePanel
      title={<>{i18n.t('ui.filteredpositionstable.positions')} <span style={{ color: catColor(filter.value) }}>{filter.value}</span></>}
      description={i18n.t('ui.filteredpositionstable.exposureSummary', {
        count: rows.length,
        amount: formatMoney(totalFiltered, { style: 'full' }),
      })}
      onClose={closePositions}
      closeLabel={i18n.t('ui.filteredpositionstable.closePositions')}
      headerActions={(
        <button
          type="button"
          onClick={clearFilter}
          className="cursor-pointer rounded-lg border border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-500 hover:bg-gray-800 hover:text-gray-200"
        >

          {i18n.t('ui.filteredpositionstable.clearFilter')}
        </button>
      )}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-900">
          <tr className="border-b border-gray-800">
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{i18n.t('ui.filteredpositionstable.name')}</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-gray-500">{i18n.t('ui.filteredpositionstable.total')}</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide" style={{ color: catColor(filter.value) }}>
              {filter.value}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => <FilteredPositionRow key={row.isin} color={filterColor} index={index} row={row} />)}
        </tbody>
      </table>
    </SidePanel>
  )
}
