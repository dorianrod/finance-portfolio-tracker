import { useFormatOverviewPeriodRange } from '@/domains/portfolio/features/overview/helpers/formatters/useFormatOverviewPeriodRange'
import type { OverviewWindows } from '@/domains/portfolio/features/overview/helpers/transformers/buildOverviewComparison/buildOverviewComparison.types'
import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/controls/Button.view'
import { Group } from '@/shared/ui/controls/Group.view'
import { PeriodFilterIcon } from '@/shared/ui/icons/PeriodFilterIcon.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function OverviewPeriodFilterView({
  windows,
  onOpen,
}: OverviewPeriodFilterProps & { onOpen: () => void }) {
  const formatOverviewPeriodRange = useFormatOverviewPeriodRange()

  return (
    <div className="w-full min-w-0 overflow-hidden sm:w-auto">
      <Group
        variant="card"
        label={i18n.t('ui.overviewperiodfilter.comparisonPeriods')}
      >
        <Stack flow="responsiveRow" gap="none">
          <Layout as="span" flow="control">
            <Button
              type="button"
              onClick={onOpen}
              label={i18n.t(
                'ui.overviewperiodfilter.editCurrentComparisonPeriod',
              )}
              variant="period"
            >
              <Layout as="span" flow="inline" sizing="fixed">
                <Text variant="compactEyebrow" tone="accent">
                  {i18n.t('ui.overviewperiodfilter.current')}
                </Text>
              </Layout>
              <Text variant="captionLabel" tone="secondary" truncate>
                {formatOverviewPeriodRange(windows.current)}
              </Text>
              <PeriodFilterIcon />
            </Button>
          </Layout>
          <Layout>
            <Surface variant="responsiveInset">
              <Inline as="div" align="center" gap="default" inset="compact">
                <Layout as="span" flow="inline" sizing="fixed">
                  <Text variant="compactEyebrow" tone="subtle">
                    {i18n.t('ui.overviewperiodfilter.previous')}
                  </Text>
                </Layout>
                <Text variant="caption" tone="subtle" truncate>
                  {formatOverviewPeriodRange(windows.previous)}
                </Text>
              </Inline>
            </Surface>
          </Layout>
        </Stack>
      </Group>
    </div>
  )
}

type OverviewPeriodFilterProps = {
  windows: OverviewWindows
}
