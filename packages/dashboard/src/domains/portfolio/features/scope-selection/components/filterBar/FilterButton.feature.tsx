import { useAtomValue } from 'jotai'

import { useDashboardFilterPanel } from '@/domains/portfolio/shared/services/actions/useDashboardFilterPanel'
import { dashboardFiltersOpenAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpen.atoms'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { SelectionCount } from '@/shared/ui/badge/SelectionCount.view'
import { DialogButton } from '@/shared/ui/controls/DialogButton.view'
import { FilterIcon } from '@/shared/ui/formElements/FilterIcon.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

export function FilterButton({ activeCount }: { activeCount: number }) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { openFilters } = useDashboardFilterPanel()
  const formatNumber = useFormatNumber()

  return (
    <Layout as="span" flow="control" sizing="fixed">
      <DialogButton
        type="button"
        onClick={openFilters}
        expanded={open}
        variant="filter"
        selected={activeCount > 0}
      >
        <FilterIcon />
        <span>{i18n.t('ui.filterbar.filters')}</span>
        {activeCount > 0 && (
          <Layout as="span" flow="inline">
            <SelectionCount>
              <Layout as="span" flow="inline" inset="compact">
                {formatNumber(activeCount)}
              </Layout>
            </SelectionCount>
          </Layout>
        )}
      </DialogButton>
    </Layout>
  )
}
