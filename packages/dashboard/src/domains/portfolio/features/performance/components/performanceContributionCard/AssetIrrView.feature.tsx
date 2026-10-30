import { buildAssetIrrRankings } from '@/domains/portfolio/features/performance/helpers/transformers/buildAssetIrrRankings'
import type { AssetIrrSummary } from '@/domains/portfolio/features/performance/types/assetIrr.type'
import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'

import { AssetIrrResultsView } from './AssetIrrResults.view'
import { MetricLabel } from './MetricLabel.feature'

/*
 * @architecture-decision prepared-asset-irr-results
 * @rules arch-component-roles, arch-component-module-boundaries
 * @choice Resolve availability and rank assets here; render prepared results in AssetIrrResultsView.
 * @reason The result summary and rankings can render independently; live metric scope remains caller-owned children.
 * @alternative Moving ranking into the view would introduce a business dependency; a mixed module obscures the result contract.
 * @revisit Results acquire a new independent business interaction or the ranking policy changes.
 */
export function AssetIrrView({
  summary,
  status,
}: {
  summary: AssetIrrSummary
  status: IrrStatus
}) {
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
    <AssetIrrResultsView
      measuredCount={measuredCount}
      topReturns={topReturns}
      underperformers={underperformers}
      startDate={summary.start_date}
      endDate={summary.end_date}
    >
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
    </AssetIrrResultsView>
  )
}
