import { useAtomValue } from 'jotai'

import { useDashboardFilters } from '@/domains/portfolio/shared/services/actions/useDashboardFilters'
import { dashboardFiltersOpenAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpenAtom'
import i18n from '@/i18n/i18n'
import { SelectionCount } from '@/shared/ui/badge/SelectionCount.view'
import { DialogButton } from '@/shared/ui/controls/DialogButton.view'
import { FilterIcon } from '@/shared/ui/formElements/FilterIcon.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

export function FilterButton({ activeCount }: { activeCount: number }) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { openFilters } = useDashboardFilters()

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
                {activeCount}
              </Layout>
            </SelectionCount>
          </Layout>
        )}
      </DialogButton>
    </Layout>
  )
}
