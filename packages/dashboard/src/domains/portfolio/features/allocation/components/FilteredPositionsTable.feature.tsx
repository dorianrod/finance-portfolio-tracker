import { useAtomValue } from 'jotai'

import { useDashboardAllocationFilters } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationFilters'
import { useDashboardAllocationPositions } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationPositions'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type { MatchingIsinRow } from '@/domains/portfolio/shared/types/allocationChart.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { catColor } from '@/shared/theme/chartColors'
import { SidePanel } from '@/shared/ui/SidePanel.view'

import { FilteredPositionRow } from './FilteredPositionRow.view'

export function FilteredPositionsTable({ rows }: { rows: MatchingIsinRow[] }) {
  const formatMoney = useFormatMoney()
  const filter = useAtomValue(dashboardAllocationFilterAtom)
  const { clearFilter } = useDashboardAllocationFilters()
  const { closePositions } = useDashboardAllocationPositions()
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
  const filterValue = filter?.value ?? ''
  const totalFiltered = rows.reduce((s, r) => s + r.filteredValue, 0)
  const filterColor = catColor(filterValue)

  return (
    <SidePanel
      open={positionsOpen && filter !== null && rows.length > 0}
      onClose={closePositions}
      closeLabel={i18n.t('ui.filteredpositionstable.closePositions')}
    >
      <SidePanel.Title>
        <>
          {i18n.t('ui.filteredpositionstable.positions')}{' '}
          <span style={{ color: catColor(filterValue) }}>{filterValue}</span>
        </>
      </SidePanel.Title>
      <SidePanel.Description>
        {i18n.t('ui.filteredpositionstable.exposureSummary', {
          count: rows.length,
          amount: formatMoney(totalFiltered, { style: 'full' }),
        })}
      </SidePanel.Description>
      <SidePanel.HeaderActions>
        <button
          type="button"
          onClick={clearFilter}
          className="cursor-pointer rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-content-muted transition-colors hover:border-border-strong hover:bg-surface-raised hover:text-content-secondary"
        >
          {i18n.t('ui.filteredpositionstable.clearFilter')}
        </button>
      </SidePanel.HeaderActions>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-border">
            <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-content-subtle">
              {i18n.t('ui.filteredpositionstable.name')}
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-content-subtle">
              {i18n.t('ui.filteredpositionstable.total')}
            </th>
            <th
              className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide"
              style={{ color: catColor(filterValue) }}
            >
              {filterValue}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <FilteredPositionRow
              key={row.isin}
              color={filterColor}
              index={index}
              row={row}
            />
          ))}
        </tbody>
      </table>
    </SidePanel>
  )
}
