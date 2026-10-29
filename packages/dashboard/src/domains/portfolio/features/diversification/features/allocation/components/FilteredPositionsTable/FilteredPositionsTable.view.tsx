import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/matchingIsinRow.type'
import { AllocationCategory } from '@/domains/portfolio/shared/components/AllocationCategory/AllocationCategory.view'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Button } from '@/shared/ui/controls/Button.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { FilteredPositionRow } from '../FilteredPositionRow/FilteredPositionRow.view'

export function FilteredPositionsTableView({
  rows,
  filterValue,
  totalFiltered,
  open,
  onClose,
  onClear,
}: {
  rows: MatchingIsinRow[]
  filterValue: string
  totalFiltered: number
  open: boolean
  onClose: () => void
  onClear: () => void
}) {
  const formatMoney = useFormatMoney()
  return (
    <SidePanel
      open={open}
      onClose={onClose}
      closeLabel={i18n.t('ui.filteredpositionstable.closePositions')}
    >
      <SidePanel.Title>
        <>
          {i18n.t('ui.filteredpositionstable.positions')}{' '}
          <AllocationCategory category={filterValue}>
            {filterValue}
          </AllocationCategory>
        </>
      </SidePanel.Title>
      <SidePanel.Description>
        {i18n.t('ui.filteredpositionstable.exposureSummary', {
          count: rows.length,
          amount: formatMoney(totalFiltered, { style: 'full' }),
        })}
      </SidePanel.Description>
      <SidePanel.HeaderActions>
        <Button type="button" onClick={onClear} variant="filterClear">
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
              <AllocationCategory
                as="div"
                variant="sectionLabel"
                align="right"
                category={filterValue}
              >
                {filterValue}
              </AllocationCategory>
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
