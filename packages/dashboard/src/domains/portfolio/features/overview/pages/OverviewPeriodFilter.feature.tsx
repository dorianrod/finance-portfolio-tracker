import { formatOverviewPeriodRange } from '@/domains/portfolio/features/overview/helpers/formatters/formatOverviewPeriodRange'
import type { OverviewWindows } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import { useDashboardFilters } from '@/domains/portfolio/shared/services/actions/useDashboardFilters'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { Button, Group } from '@/shared/ui/Controls.view'
import { PeriodFilterIcon } from '@/shared/ui/Icons.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

type OverviewPeriodFilterProps = {
  windows: OverviewWindows
}

export function OverviewPeriodFilter({ windows }: OverviewPeriodFilterProps) {
  const formatDate = useFormatDate()
  const { openFilters } = useDashboardFilters()

  return (
    <Group
      variant="card"
      className="flex w-full min-w-0 flex-col overflow-hidden sm:w-auto sm:flex-row"
      label={i18n.t('ui.overviewperiodfilter.comparisonPeriods')}
    >
      <Button
        type="button"
        onClick={openFilters}
        label={i18n.t('ui.overviewperiodfilter.editCurrentComparisonPeriod')}
        variant="period"
        className="flex min-w-0 items-center gap-2.5 px-3 py-2"
      >
        <Text variant="compactEyebrow" tone="accent" className="shrink-0">
          {i18n.t('ui.overviewperiodfilter.current')}
        </Text>
        <Text variant="captionLabel" tone="secondary" truncate>
          {formatOverviewPeriodRange(windows.current, formatDate)}
        </Text>
        <PeriodFilterIcon />
      </Button>
      <Surface
        variant="responsiveInset"
        className="flex min-w-0 items-center gap-2.5 px-3 py-2"
      >
        <Text variant="compactEyebrow" tone="subtle" className="shrink-0">
          {i18n.t('ui.overviewperiodfilter.previous')}
        </Text>
        <Text variant="caption" tone="subtle" truncate>
          {formatOverviewPeriodRange(windows.previous, formatDate)}
        </Text>
      </Surface>
    </Group>
  )
}
