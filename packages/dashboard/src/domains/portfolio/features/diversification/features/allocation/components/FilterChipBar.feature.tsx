import { useAtomValue } from 'jotai'

import { useFormatAllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/helpers/formatters/useFormatAllocationDimension'
import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/controls/Button.view'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function FilterChipBar() {
  const formatDimension = useFormatAllocationDimension()
  const filter = useAtomValue(dashboardDiversificationFilterAtom)
  const { clearFilter } = useDashboardDiversificationFilters()
  if (!filter) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-grid w-24 shrink-0">
        <Text variant="captionOverline" tone="subtle">
          {i18n.t('ui.filterchipbar.allocation')}
        </Text>
      </span>
      <span className="inline-grid max-w-full">
        <Button
          type="button"
          onClick={clearFilter}
          title={i18n.t('ui.filterchipbar.clearAllocationFilter')}
          variant="appliedFilter"
        >
          <Text variant="secondaryMedium">{formatDimension(filter.type)}</Text>
          <Decorative variant="faint">:</Decorative>
          <Text variant="strong">{filter.value}</Text>
          <Layout as="span" flow="inline">
            <Decorative variant="subdued">×</Decorative>
          </Layout>
        </Button>
      </span>
    </div>
  )
}
