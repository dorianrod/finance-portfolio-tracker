import { IrrList } from '@/domains/portfolio/features/performance/components/PerformanceRankingLists/performanceRankingLists/IrrList.view'
import { useFormatExactPerformanceDateRange } from '@/domains/portfolio/features/performance/helpers/formatters/useFormatExactPerformanceDateRange'
import { buildAssetIrrRankings } from '@/domains/portfolio/features/performance/helpers/mappers/buildPerformanceContributionViewModel/buildAssetIrrRankings'
import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { MetricLabel } from './MetricLabel.feature'

export function AssetIrrView({
  summary,
  status,
}: {
  summary: AssetIrrSummary
  status: IrrStatus
}) {
  const formatExactPerformanceDateRange = useFormatExactPerformanceDateRange()
  if (status === 'loading') {
    return (
      <Layout spaceBefore="spacious">
        <Surface variant="empty" tone="subtle" align="center">
          {i18n.t('ui.performancecontributioncard.calculatingAssetIrr')}
        </Surface>
      </Layout>
    )
  }
  if (status === 'error' || !summary.available) {
    return (
      <Layout spaceBefore="spacious">
        <Surface variant="empty" tone="subtle" align="center">
          {i18n.t(
            'ui.performancecontributioncard.assetIrrIsNotAvailableForThisSelection',
          )}
        </Surface>
      </Layout>
    )
  }

  const { measuredCount, topReturns, underperformers } =
    buildAssetIrrRankings(summary)

  return (
    <>
      <Layout spaceBefore="spacious">
        <Surface variant="inset">
          <Grid columns={2} gap="default" inset="default">
            <div>
              <MetricLabel
                label={i18n.t('ui.performancecontributioncard.assetsMeasured')}
                tooltip={i18n.t(
                  'ui.performancecontributioncard.numberOfAssetsWithEnoughPositiveAndNegativeCash',
                )}
                // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The asset-IRR result supplies its actual end date; MetricLabel only presents the label and adds live filter badges.
                scope={{
                  account: 'filterable',
                  period: 'range',
                  effectiveDate: summary.end_date ?? undefined,
                }}
              />
              <Layout spaceBefore="compact">
                <Text as="div" variant="statistic" tone="secondary" numeric>
                  {measuredCount}
                </Text>
              </Layout>
            </div>
            <div>
              <Text as="div" variant="microOverline" tone="subtle">
                {i18n.t('ui.performancecontributioncard.period')}
              </Text>
              <Layout spaceBefore="compact">
                <Text as="div" variant="label" tone="muted">
                  {formatExactPerformanceDateRange({
                    startDate: summary.start_date,
                    endDate: summary.end_date,
                  })}
                </Text>
              </Layout>
            </div>
          </Grid>
        </Surface>
      </Layout>
      <Grid columns={2} spaceBefore="spacious" gap="spacious">
        <IrrList
          title={i18n.t('ui.performancecontributioncard.topIrrs')}
          items={topReturns}
          positive
        />

        <IrrList
          title={i18n.t('ui.performancecontributioncard.lowestIrrs')}
          items={underperformers}
          positive={false}
        />
      </Grid>
    </>
  )
}
