import { ScopeProvider } from 'jotai-scope'
import { useState } from 'react'

import { useContributionHorizon } from '@/domains/portfolio/features/performance/services/useContributionHorizon'
import { contributionHorizonAtom } from '@/domains/portfolio/features/performance/stores/contributionHorizon.atoms'
import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import type {
  ContributionHorizon,
  PerformanceContribution,
  PerformanceContributionSummary,
} from '@/domains/portfolio/features/performance/types/performanceContributionSummary.type'
import type {
  FilterScopeSpec,
  PeriodScopeMode,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { Group } from '@/shared/ui/controls/Group.view'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AssetIrrView } from './AssetIrrView.feature'
import { ContributionListView } from './ContributionList.view'
import { ContributionSummaryMetricsView } from './ContributionSummaryMetrics.view'
import { MetricLabel } from './MetricLabel.feature'

export function PerformanceContributionCard(props: Props) {
  return (
    <ScopeProvider atoms={CONTRIBUTION_ATOMS}>
      <PerformanceContributionContent {...props} />
    </ScopeProvider>
  )
}

const CONTRIBUTION_ATOMS = [contributionHorizonAtom]

function PerformanceContributionContent({
  assetIrr,
  assetIrrStatus,
  sinceTracking,
  trailingThreeYears,
  sinceTrackingIrr,
  trailingThreeYearIrr,
  irrStatus,
}: Props) {
  const [view, setView] = useState<PerformanceView>('contribution')
  const { activeHorizon, irr, summary, threeYearUnavailable, setHorizon } =
    useContributionHorizon({
      sinceTracking,
      sinceTrackingIrr,
      trailingThreeYears,
      trailingThreeYearIrr,
    })

  const description =
    view === 'contribution'
      ? i18n.t(
          'ui.performancecontributioncard.mainAssetsCreatingOrReducingPortfolioValue',
        )
      : i18n.t(
          'ui.performancecontributioncard.annualizedMoneyWeightedReturnByAssetOverTheSelected',
        )
  const showUnavailableContribution =
    view === 'contribution' && !summary.available
  const showContributionDetails = view === 'contribution' && summary.available

  return (
    <Surface as="section" variant="card">
      <Stack gap="default" align="start" justify="between">
        <div>
          <Text as="h2" variant="label" tone="muted">
            {i18n.t('ui.performancecontributioncard.performanceByAsset')}
          </Text>
          <Layout spaceBefore="compact">
            <Text as="p" variant="caption" tone="subtle">
              {description}
            </Text>
          </Layout>
        </div>
        <Layout>
          <Group
            variant="canvasOutline"
            label={i18n.t('ui.performancecontributioncard.performanceMetric')}
          >
            <Inline as="div" inset="compact">
              <ToggleButton
                type="button"
                onClick={() => setView('contribution')}
                active={view === 'contribution'}
                variant="metricChoice"
              >
                {i18n.t('ui.performancecontributioncard.contribution.7ffdcf')}
              </ToggleButton>
              <ToggleButton
                type="button"
                onClick={() => setView('irr')}
                active={view === 'irr'}
                variant="metricChoice"
              >
                {i18n.t('ui.performancecontributioncard.irr.a0fb95')}
              </ToggleButton>
            </Inline>
          </Group>
        </Layout>
      </Stack>

      {view === 'irr' && (
        <AssetIrrView summary={assetIrr} status={assetIrrStatus} />
      )}
      {showUnavailableContribution && (
        <Layout spaceBefore="spacious">
          <Surface variant="empty" tone="subtle" align="center">
            {i18n.t(
              'ui.performancecontributioncard.contributionHistoryIsNotAvailableForThisSelection',
            )}
          </Surface>
        </Layout>
      )}
      {showContributionDetails && (
        <>
          <ContributionSummaryMetrics
            summary={summary}
            irr={irr}
            irrStatus={irrStatus}
            activeHorizon={activeHorizon}
            threeYearUnavailable={threeYearUnavailable}
            onHorizonChange={setHorizon}
          />
          <ContributionRankings summary={summary} scopePeriod={activeHorizon} />
        </>
      )}
    </Surface>
  )
}

type Props = {
  assetIrr: AssetIrrSummary
  assetIrrStatus: IrrStatus
  sinceTracking: PerformanceContributionSummary
  trailingThreeYears: PerformanceContributionSummary
  // Missing or insufficient cash flows may not define a since-tracking return.
  sinceTrackingIrr: number | null
  // The available cash flows may not define a full three-year return.
  trailingThreeYearIrr: number | null
  irrStatus: IrrStatus
}

type PerformanceView = 'contribution' | 'irr'

function ContributionList({
  title,
  items,
  positive,
  scope,
}: {
  title: string
  items: PerformanceContribution[]
  positive: boolean
  scope: FilterScopeSpec
}) {
  return (
    <ContributionListView title={title} items={items} positive={positive}>
      <ScopedInfoTooltip
        // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This contribution list selects positive versus negative explanatory copy; ScopedInfoTooltip only renders it with live filter badges.
        text={
          positive
            ? i18n.t(
                'ui.performancecontributioncard.assetsThatCreatedTheMostPortfolioValueOverThe',
              )
            : i18n.t(
                'ui.performancecontributioncard.assetsThatReducedPortfolioValueTheMostOverThe',
              )
        }
        scope={scope}
      />
    </ContributionListView>
  )
}

function ContributionSummaryMetrics({
  summary,
  irr,
  irrStatus,
  activeHorizon,
  threeYearUnavailable,
  onHorizonChange,
}: {
  summary: PerformanceContributionSummary
  // Missing or insufficient cash flows may not define a return.
  irr: number | null
  irrStatus: IrrStatus
  activeHorizon: ContributionHorizon
  threeYearUnavailable: boolean
  onHorizonChange: (horizon: ContributionHorizon) => void
}) {
  return (
    <ContributionSummaryMetricsView
      summary={summary}
      irr={irr}
      irrStatus={irrStatus}
      activeHorizon={activeHorizon}
      threeYearUnavailable={threeYearUnavailable}
      onHorizonChange={onHorizonChange}
    >
      <ContributionSummaryMetricsView.IrrLabel>
        <MetricLabel
          label={i18n.t('ui.performancecontributioncard.irrContext')}
          tooltip={i18n.t(
            'ui.performancecontributioncard.annualizedMoneyWeightedReturnOverThisHorizonItAccounts',
          )}
          // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The contribution card selects the horizon and summary end date; MetricLabel only presents that specification with live filter badges.
          scope={{
            account: 'filterable',
            period: activeHorizon,
            effectiveDate: summary.endDate ?? undefined,
          }}
        />
      </ContributionSummaryMetricsView.IrrLabel>
      <ContributionSummaryMetricsView.NetLabel>
        <MetricLabel
          label={i18n.t(
            'ui.performancecontributioncard.attributedNetPerformance',
          )}
          tooltip={i18n.t(
            'ui.performancecontributioncard.sumOfTheAttributedEuroContributionsAcrossTheSelected',
          )}
          // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The contribution card selects the horizon and summary end date; MetricLabel only presents that specification with live filter badges.
          scope={{
            account: 'filterable',
            period: activeHorizon,
            effectiveDate: summary.endDate ?? undefined,
          }}
        />
      </ContributionSummaryMetricsView.NetLabel>
    </ContributionSummaryMetricsView>
  )
}

function ContributionRankings({
  summary,
  scopePeriod,
}: {
  summary: PerformanceContributionSummary
  scopePeriod: PeriodScopeMode
}) {
  return (
    <Grid columns={2} spaceBefore="spacious" gap="spacious">
      <ContributionList
        title={i18n.t('ui.performancecontributioncard.topContributors')}

        items={summary.contributors}
        positive
        // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This card supplies the contributor and detractor lists from one summary and reporting horizon; each list only composes its tooltip and rows.
        scope={{
          account: 'filterable',
          period: scopePeriod,
          effectiveDate: summary.endDate ?? undefined,
        }}
      />
      <ContributionList
        title={i18n.t('ui.performancecontributioncard.mainDetractors')}

        items={summary.detractors}
        positive={false}
        // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; This card supplies the contributor and detractor lists from one summary and reporting horizon; each list only composes its tooltip and rows.
        scope={{
          account: 'filterable',
          period: scopePeriod,
          effectiveDate: summary.endDate ?? undefined,
        }}
      />
    </Grid>
  )
}
