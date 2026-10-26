import { useMemo } from 'react'

import { ClassificationCoverageState } from '@/domains/portfolio/features/data-quality/components/ClassificationCoverageState.state'
import { FundDataQualityPanel } from '@/domains/portfolio/features/data-quality/components/FundDataQualityPanel.feature'
import { ErrorsTab } from '@/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab.feature'
import { ManualPriceOverridesTable } from '@/domains/portfolio/features/data-quality/features/errors/components/ManualPriceOverridesTable.view'
import { useDataQualityPanels } from '@/domains/portfolio/features/data-quality/services/useDataQualityPanels'
import { useDataQualityViewModel } from '@/domains/portfolio/features/data-quality/services/useDataQualityViewModel'
import type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'
import type {
  FundCoverageReport,
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/shared/types/pipelineError.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'
import i18n from '@/i18n/i18n'
import { Grid, Layout } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Tabs } from '@/shared/ui/Tabs.view'

import { AffectedAssetsPanel } from './AffectedAssetsPanel.feature'
import { DataQualityHeader } from './DataQualityHeader.view'
import { LookThroughQualityContent } from './LookThroughQualityContent.feature'
import { QualityThemeNavigation } from './QualityThemeNavigation.view'

export type { QualityThemeId } from '@/domains/portfolio/shared/types/dataQuality.type'

type DataQualityTabProps = {
  positions: PositionRow[]
  errors: PipelineError[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
  fundHoldings: FundHolding[]
  fundSnapshots: FundSnapshot[]
  fundUnresolved: FundUnresolved[]
  rawData: RawIsinData
}

export function DataQualityTab({
  positions,
  errors,
  manualPriceOverrides,
  fundStatuses,
  fundReport,
  fundHoldings,
  fundSnapshots,
  fundUnresolved,
  rawData,
}: DataQualityTabProps) {
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

                {activeThemeId === 'pipeline' && <ErrorsTab errors={errors} />}

                {activeThemeId === 'prices' && (
                  <ManualPriceOverridesTable
                    manualPriceOverrides={manualPriceOverrides}
                  />
                )}

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
