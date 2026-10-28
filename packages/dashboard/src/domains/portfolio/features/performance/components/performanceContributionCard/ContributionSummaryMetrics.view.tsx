import type { ReactNode } from 'react'

import { useFormatPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatPerformanceDateRange'
import { useFormatPerformanceIrrLabel } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatPerformanceIrrLabel'
import type {
  ContributionHorizon,
  PerformanceContributionSummary,
} from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Group } from '@/shared/ui/controls/Group.view'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function ContributionSummaryMetricsView({
  summary,
  irr,
  irrStatus,
  activeHorizon,
  threeYearUnavailable,
  onHorizonChange,
  children,
}: {
  summary: PerformanceContributionSummary
  irr: number | null
  irrStatus: IrrStatus
  activeHorizon: ContributionHorizon
  threeYearUnavailable: boolean
  onHorizonChange: (horizon: ContributionHorizon) => void
  children: ReactNode
}) {
  const { slot: irrLabel, content } = partitionSlot(children, IrrLabel)
  const { slot: netLabel } = partitionSlot(content, NetLabel)
  const formatPerformanceIrrLabel = useFormatPerformanceIrrLabel()
  const formatPerformanceDateRange = useFormatPerformanceDateRange()
  const formatMoney = useFormatMoney()
  const netTone = summary.netContribution >= 0 ? 'positive' : 'negative'
  return (
    <Layout spaceBefore="spacious">
      <Surface variant="inset">
        <Grid columns={3} gap="default" inset="default">
          <div>
            {irrLabel}
            <Layout spaceBefore="compact">
              <Text as="div" variant="statistic" tone={'contrast'} numeric>
                {formatPerformanceIrrLabel(irr, irrStatus)}
              </Text>
            </Layout>
          </div>
          <div>
            {netLabel}
            <Layout spaceBefore="compact">
              <Text as="div" variant="statistic" tone={netTone} numeric>
                {formatMoney(summary.netContribution, {
                  style: 'full',
                })}
              </Text>
            </Layout>
          </div>
          <div>
            <Text as="div" variant="microOverline" tone="subtle">
              {i18n.t('ui.performancecontributioncard.period')}
            </Text>
            <Inline
              as="div"
              flow="wrap"
              spaceBefore="default"
              align="center"
              justify="between"
              gap="default"
            >
              <Layout>
                <Text as="div" variant="label" tone="muted" wrap="nowrap">
                  {formatPerformanceDateRange(summary)}
                </Text>
              </Layout>
              <Layout sizing="fixed">
                <Group
                  variant="inset"
                  label={i18n.t(
                    'ui.performancecontributioncard.contributionHorizon',
                  )}
                >
                  <Inline as="div" inset="compact">
                    <ToggleButton
                      type="button"
                      onClick={() => onHorizonChange('since-tracking')}
                      active={activeHorizon === 'since-tracking'}
                      variant="compactChoice"
                    >
                      {i18n.t('ui.performancecontributioncard.sinceTracking')}
                    </ToggleButton>
                    <ToggleButton
                      type="button"
                      onClick={() => onHorizonChange('trailing-3y')}
                      disabled={threeYearUnavailable}
                      active={activeHorizon === 'trailing-3y'}
                      title={
                        threeYearUnavailable
                          ? i18n.t(
                              'ui.performancecontributioncard.threeYearsOfHistoryAreNotYetAvailable',
                            )
                          : undefined
                      }
                      variant="optionalCompactChoice"
                    >
                      {i18n.t('ui.performancecontributioncard.trailing3Years')}
                    </ToggleButton>
                  </Inline>
                </Group>
              </Layout>
            </Inline>
          </div>
        </Grid>
      </Surface>
    </Layout>
  )
}

function IrrLabel({ children }: { children: ReactNode }) {
  return <>{children}</>
}
function NetLabel({ children }: { children: ReactNode }) {
  return <>{children}</>
}
ContributionSummaryMetricsView.IrrLabel = IrrLabel
ContributionSummaryMetricsView.NetLabel = NetLabel
