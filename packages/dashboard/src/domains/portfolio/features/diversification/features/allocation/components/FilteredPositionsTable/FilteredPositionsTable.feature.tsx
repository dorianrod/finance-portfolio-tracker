import { useAtomValue } from 'jotai'

import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { useDashboardDiversificationPositions } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationPositions'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilterAtom'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpenAtom'
import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { getAllocationTone } from '@/domains/portfolio/shared/helpers/presenters/getPortfolioSeriesTone/getAllocationTone'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { ChartText } from '@/shared/ui/ChartText.view'
import { Button } from '@/shared/ui/controls/Button.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { FilteredPositionRow } from '../FilteredPositionRow/FilteredPositionRow.view'
import { sumFilteredPositionValues } from './helpers/calculators/sumFilteredPositionValues'

export function FilteredPositionsTable({ rows }: { rows: MatchingIsinRow[] }) {
  const formatMoney = useFormatMoney()
  const filter = useAtomValue(dashboardDiversificationFilterAtom)
  const { clearFilter } = useDashboardDiversificationFilters()
  const { closePositions } = useDashboardDiversificationPositions()
  const positionsOpen = useAtomValue(dashboardDiversificationPositionsOpenAtom)
  const filterValue = filter?.value ?? ''
  const totalFiltered = sumFilteredPositionValues(rows)

  return (
    <SidePanel
      open={positionsOpen && filter !== null && rows.length > 0}
      onClose={closePositions}
      closeLabel={i18n.t('ui.filteredpositionstable.closePositions')}
    >
      <SidePanel.Title>
        <>
          {i18n.t('ui.filteredpositionstable.positions')}{' '}
          <ChartText tone={getAllocationTone(filterValue)}>
            {filterValue}
          </ChartText>
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
                tone={getAllocationTone(filterValue)}
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
