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
import { ChartText } from '@/shared/ui/ChartText.view'
import { Button } from '@/shared/ui/Controls.view'
import { Inset } from '@/shared/ui/Layout.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { FilteredPositionRow } from './FilteredPositionRow.view'

export function FilteredPositionsTable({ rows }: { rows: MatchingIsinRow[] }) {
  const formatMoney = useFormatMoney()
  const filter = useAtomValue(dashboardAllocationFilterAtom)
  const { clearFilter } = useDashboardAllocationFilters()
  const { closePositions } = useDashboardAllocationPositions()
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
  const filterValue = filter?.value ?? ''
  const totalFiltered = rows.reduce((s, r) => s + r.filteredValue, 0)

  return (
    <SidePanel
      open={positionsOpen && filter !== null && rows.length > 0}
      onClose={closePositions}
      closeLabel={i18n.t('ui.filteredpositionstable.closePositions')}
    >
      <SidePanel.Title>
        <>
          {i18n.t('ui.filteredpositionstable.positions')}{' '}
          <ChartText category={filterValue}>{filterValue}</ChartText>
        </>
      </SidePanel.Title>
      <SidePanel.Description>
        {i18n.t('ui.filteredpositionstable.exposureSummary', {
          count: rows.length,
          amount: formatMoney(totalFiltered, { style: 'full' }),
        })}
      </SidePanel.Description>
      <SidePanel.HeaderActions>
        <Button type="button" onClick={clearFilter} variant="filterClear">
          {i18n.t('ui.filteredpositionstable.clearFilter')}
        </Button>
      </SidePanel.HeaderActions>
      <Surface variant="bodyTable" as="table">
        <Surface as="thead" variant="plain">
          <Surface as="tr" variant="sectionEnd">
            <Inset as="th" inset="default">
              <Text as="div" variant="sectionLabel" tone="subtle" align="left">
                {i18n.t('ui.filteredpositionstable.name')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="sectionLabel" tone="subtle" align="right">
                {i18n.t('ui.filteredpositionstable.total')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <ChartText
                as="div"
                variant="sectionLabel"
                align="right"
                category={filterValue}
              >
                {filterValue}
              </ChartText>
            </Inset>
          </Surface>
        </Surface>
        <tbody>
          {rows.map((row, index) => (
            <FilteredPositionRow
              key={row.isin}
              category={filterValue}
              index={index}
              row={row}
            />
          ))}
        </tbody>
      </Surface>
    </SidePanel>
  )
}
