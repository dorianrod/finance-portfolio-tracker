import { useState } from 'react'

import type { OverviewConcentrationComparison } from '@/domains/portfolio/features/overview/helpers/calculators/buildOverviewComparison/buildOverviewComparison.types'
import { OverviewConcentrationRow } from '@/domains/portfolio/features/overview/pages/overviewChartDetails/OverviewConcentrationRow.view'
import { ConcentrationModeToggle } from '@/domains/portfolio/shared/components/ConcentrationModeToggle.view'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'

import { buildOverviewConcentrationRows } from './helpers/presenters/buildOverviewConcentrationRows'

export function OverviewConcentrationChart({
  heldConcentration,
  underlyingConcentration,
}: {
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
}) {
  const [mode, setMode] = useState<ConcentrationMode>('lookThrough')
  const lookThroughDisabled = underlyingConcentration.current == null
  const displayedMode =
    mode === 'lookThrough' && lookThroughDisabled ? 'held' : mode
  const concentration =
    displayedMode === 'held' ? heldConcentration : underlyingConcentration
  const { rows, scaleMax, previousAvailable } =
    buildOverviewConcentrationRows(concentration)

  const description =
    displayedMode === 'lookThrough'
      ? i18n.t(
          'ui.overviewcharts.directAndFundLookThroughExposureAvoidingWrapperLevel',
        )
      : i18n.t(
          'ui.overviewcharts.productsAndInstrumentsAsHeldIncludingPortfolioWrappers',
        )

  return (
    <Surface as="section" variant="panel">
      <Stack gap="default" align="start" justify="between">
        <div>
          <Text as="h3" variant="bodyStrong" tone="secondary">
            <Inline as="span" align="center">
              {displayedMode === 'lookThrough'
                ? i18n.t('ui.overviewcharts.largestUnderlyingAssets')
                : i18n.t('ui.overviewcharts.largestHeldPositions')}
              <ScopedInfoTooltip
                // eslint-disable-next-line local/no-prop-drilling -- Mode-specific chart copy is owned by this feature.
                text={description}
                // eslint-disable-next-line local/no-prop-drilling -- This feature owns the effective concentration snapshot scope.
                scope={{
                  account: 'filterable',
                  period: 'as-of',
                  effectiveDate: concentration.current?.date,
                }}
              />
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
          onChange={setMode}
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
