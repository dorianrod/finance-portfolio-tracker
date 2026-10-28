import type { ReactNode } from 'react'

import { OverviewConcentrationRow } from '@/domains/portfolio/features/overview/pages/overviewChartDetails/OverviewConcentrationRow.view'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

import type { buildOverviewConcentrationRows } from './helpers/presenters/buildOverviewConcentrationRows'

export function OverviewConcentrationChartView({
  presentation,
  displayedMode,
  lookThroughDisabled,
  description,
  onModeChange,
  children,
}: {
  presentation: ReturnType<typeof buildOverviewConcentrationRows>
  displayedMode: ConcentrationMode
  lookThroughDisabled: boolean
  description: string
  onModeChange: (mode: ConcentrationMode) => void
  children: ReactNode
}) {
  const { rows, scaleMax, previousAvailable } = presentation
  return (
    <Surface as="section" variant="panel">
      <Stack gap="default" align="start" justify="between">
        <div>
          <Text as="h3" variant="bodyStrong" tone="secondary">
            <Inline as="span" align="center">
              {displayedMode === 'lookThrough'
                ? i18n.t('ui.overviewcharts.largestUnderlyingAssets')
                : i18n.t('ui.overviewcharts.largestHeldPositions')}
              {children}
            </Inline>
          </Text>
          <Layout spaceBefore="compact">
            <Text as="p" variant="caption" tone="subtle">
              {description}
            </Text>
          </Layout>
        </div>
        <ConcentrationModeToggle
          value={displayedMode}
          onChange={onModeChange}
          lookThroughDisabled={lookThroughDisabled}
        />
      </Stack>
      {rows.length === 0 ? (
        <Layout height="chart">
          <Text as="div" variant="body" tone="subtle" align="center">
            <Inline as="div" align="center" justify="center">
              {i18n.t(
                'ui.overviewcharts.historicalConcentrationIsUnavailableForThisPeriod',
              )}
            </Inline>
          </Text>
        </Layout>
      ) : (
        <Stack spaceBefore="spacious" gap="relaxed">
          {rows.map((row) => (
            <OverviewConcentrationRow
              key={row.key}
              previousAvailable={previousAvailable}
              row={row}
              scaleMax={scaleMax}
            />
          ))}
          <Text as="div" variant="tiny" tone="subtle">
            <Inline
              as="div"
              align="center"
              justify="end"
              gap="compact"
              inset="compact"
            >
              <Layout as="span" flow="inline" height="marker" width="divider">
                <ToneSwatch tone="secondary" />
              </Layout>{' '}
              {i18n.t('ui.overviewcharts.previousPeriodEnd')}
            </Inline>
          </Text>
        </Stack>
      )}
    </Surface>
  )
}
