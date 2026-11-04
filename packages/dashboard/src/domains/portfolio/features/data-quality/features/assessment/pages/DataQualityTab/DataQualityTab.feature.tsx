import type { ReactNode } from 'react'

import { ClassificationCoverageState } from '@/domains/portfolio/features/data-quality/features/assessment/components/ClassificationCoverageState.state'
import { FundDataQualityPanel } from '@/domains/portfolio/features/data-quality/features/assessment/components/FundDataQualityPanel/FundDataQualityPanel.feature'
import { AffectedAssetsPanel } from '@/domains/portfolio/features/data-quality/features/assessment/pages/AffectedAssetsPanel.feature'
import { DataQualityHeader } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityHeader.view'
import { useDataQualityInspection } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/useDataQualityInspection'
import { useDataQualityViewModel } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/useDataQualityViewModel'
import { LookThroughQualityContent } from '@/domains/portfolio/features/data-quality/features/assessment/pages/LookThroughQualityContent.feature'
import { QualityThemeNavigation } from '@/domains/portfolio/features/data-quality/features/assessment/pages/QualityThemeNavigation.view'
import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Tabs } from '@/shared/ui/Tabs.view'

import { PipelinePanel } from './PipelinePanel.view'
import { PricesPanel } from './PricesPanel.view'

export function DataQualityTab({
  children,
  positions,
  errors,
  manualPriceOverrides,
  fundStatuses,
  fundReport,
  fundHoldings,
  fundSnapshots,
  fundUnresolved,
  rawData,
}: DataQualityTabProps & { children: ReactNode }) {
  const { slot: pipelinePanel, content: remaining } = partitionSlot(
    children,
    PipelinePanel,
  )
  const { slot: pricesPanel } = partitionSlot(remaining, PricesPanel)
  const {
    activeTheme,
    activeThemeId,
    affectedAssets,
    classificationApplicableValue,
    classificationViewState,
    fundIssueCount,
    hasLookThroughScope,
    scopedFundData,
    setSelectedQualityTheme,
    themes,
  } = useDataQualityViewModel({
    positions,
    errors,
    manualPriceOverrides,
    fundStatuses,
    fundReport,
    fundHoldings,
    fundSnapshots,
    fundUnresolved,
    rawData,
  })
  const activeDetailAction = useDataQualityInspection({
    activeThemeId,
    affectedAssetCount: affectedAssets.length,
    classificationApplicableValue,
    fundIssueCount,
    fundStatusCount: scopedFundData.statuses.length,
    hasLookThroughScope,
  })

  return (
    <div className="mb-6">
      <Surface variant="cardGroup">
        <Tabs
          orientation="vertical"
          value={activeThemeId}
          onValueChange={(value) => {
            const theme = themes.find((theme) => theme.id === value)
            if (theme) setSelectedQualityTheme(theme.id)
          }}
        >
          <Grid arrangement="sidebar" align="start" gap="relaxed">
            <QualityThemeNavigation
              themes={themes}
              activeThemeId={activeThemeId}
              onThemeChange={setSelectedQualityTheme}
            />

            <Layout>
              <Tabs.Content value={activeThemeId}>
                <DataQualityHeader
                  theme={activeTheme}
                  action={activeDetailAction}
                />

                {activeThemeId === 'pipeline' && pipelinePanel}

                {activeThemeId === 'prices' && pricesPanel}

                {activeThemeId === 'classification' && (
                  <ClassificationCoverageState
                    state={classificationViewState}
                  />
                )}

                {activeThemeId === 'lookthrough' && (
                  <LookThroughQualityContent
                    report={scopedFundData.report}
                    notApplicableValue={scopedFundData.notApplicableValue}
                  />
                )}
              </Tabs.Content>
            </Layout>
          </Grid>
        </Tabs>

        <FundDataQualityPanel
          statuses={scopedFundData.statuses}
          holdings={scopedFundData.holdings}
          snapshots={scopedFundData.snapshots}
          unresolved={scopedFundData.unresolved}
        />

        <AffectedAssetsPanel assets={affectedAssets} />
      </Surface>
    </div>
  )
}

export type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'

DataQualityTab.Pipeline = PipelinePanel
DataQualityTab.Prices = PricesPanel
