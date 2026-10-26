import { type ReactNode, useMemo } from 'react'

import { ClassificationCoverageState } from '@/domains/portfolio/features/data-quality/features/assessment/components/ClassificationCoverageState.state'
import { FundDataQualityPanel } from '@/domains/portfolio/features/data-quality/features/assessment/components/FundDataQualityPanel.feature'
import { useDataQualityPanels } from '@/domains/portfolio/features/data-quality/features/assessment/services/useDataQualityPanels'
import { useDataQualityViewModel } from '@/domains/portfolio/features/data-quality/features/assessment/services/useDataQualityViewModel'
import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'
import type { DataQualityTabProps } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityTabProps.type'
import i18n from '@/i18n/i18n'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Tabs } from '@/shared/ui/Tabs.view'

import { AffectedAssetsPanel } from './AffectedAssetsPanel.feature'
import { DataQualityHeader } from './DataQualityHeader.view'
import { LookThroughQualityContent } from './LookThroughQualityContent.feature'
import { QualityThemeNavigation } from './QualityThemeNavigation.view'

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
  const {
    classificationDetailsOpen,
    fundDiagnosticsOpen,
    openAllClassificationDetails,
    openFundDiagnostics,
  } = useDataQualityPanels()
  const activeDetailAction = useMemo(() => {
    if (
      activeThemeId === 'lookthrough' &&
      hasLookThroughScope &&
      scopedFundData.statuses.length > 0
    ) {
      return {
        label: i18n.t('ui.dataqualitytab.inspect'),
        detail: i18n.t('ui.dataqualitytab.issuesToInspect', {
          count: fundIssueCount,
        }),
        expanded: fundDiagnosticsOpen,
        onClick: openFundDiagnostics,
      }
    }

    if (
      activeThemeId === 'classification' &&
      classificationApplicableValue > 0
    ) {
      return {
        label: i18n.t('ui.dataqualitytab.inspect'),
        detail:
          affectedAssets.length > 0
            ? i18n.t('ui.dataqualitytab.assetsToInspect', {
                count: affectedAssets.length,
              })
            : i18n.t('ui.dataqualitytab.noAffectedAsset'),
        expanded: classificationDetailsOpen,
        onClick: openAllClassificationDetails,
      }
    }

    return null
  }, [
    activeThemeId,
    affectedAssets.length,
    classificationApplicableValue,
    classificationDetailsOpen,
    fundDiagnosticsOpen,
    fundIssueCount,
    hasLookThroughScope,
    openAllClassificationDetails,
    openFundDiagnostics,
    scopedFundData.statuses.length,
  ])

  return (
    <div className="mb-6">
      <Surface variant="cardGroup">
        <Tabs
          orientation="vertical"
          value={activeThemeId}
          onValueChange={(value) =>
            setSelectedQualityTheme(value as QualityThemeId)
          }
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

function PipelinePanel({ children }: { children: ReactNode }) {
  return children
}
function PricesPanel({ children }: { children: ReactNode }) {
  return children
}
DataQualityTab.Pipeline = PipelinePanel
DataQualityTab.Prices = PricesPanel
