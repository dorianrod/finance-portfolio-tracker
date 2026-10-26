import { useMemo } from 'react'

import { ClassificationCoverageState } from '@/domains/portfolio/features/data-quality/components/ClassificationCoverageState.state'
import { FundDataQualityPanel } from '@/domains/portfolio/features/data-quality/components/FundDataQualityPanel.feature'
import { LookThroughCoverageSummary } from '@/domains/portfolio/features/data-quality/components/LookThroughCoverageSummary.feature'
import { ErrorsTab } from '@/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab.feature'
import { ManualPriceOverridesTable } from '@/domains/portfolio/features/data-quality/features/errors/components/ManualPriceOverridesTable.view'
import { DATA_QUALITY_DIMENSION_LABELS } from '@/domains/portfolio/features/data-quality/helpers/formatters/dataQualityDimensionLabels'
import { QUALITY_TONES } from '@/domains/portfolio/features/data-quality/pages/helpers/presenters/dataQualityToneStyles'
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
import { Select } from '@/shared/ui/Controls.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Tabs } from '@/shared/ui/Tabs.view'
import { Text } from '@/shared/ui/Text.view'

import {
  AffectedAssetsTable,
  DetailKpiButton,
  EmptyQualityState,
  QualityThemeOption,
  QualityThemeTab,
} from './DataQualityDetails.view'

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
    classificationDimension,
    closeClassificationDetails,
    fundDiagnosticsOpen,
    openAllClassificationDetails,
    openFundDiagnostics,
  } = useDataQualityPanels()
  const visibleAffectedAssets = useMemo(
    () =>
      classificationDimension
        ? affectedAssets.filter((asset) =>
            asset.dimensions.includes(classificationDimension),
          )
        : affectedAssets,
    [affectedAssets, classificationDimension],
  )
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
  let lookThroughContent = (
    <EmptyQualityState
      message={
        scopedFundData.report
          ? i18n.t(
              'ui.dataqualitytab.lookThroughIsNotApplicableToSavingsCheckingAnd',
            )
          : i18n.t(
              'ui.dataqualitytab.noLookThroughQualityReportRunThePortfolioPipeline',
            )
      }
    />
  )
  if (hasLookThroughScope) {
    lookThroughContent = (
      <LookThroughCoverageSummary
        report={scopedFundData.report}
        notApplicableValue={scopedFundData.notApplicableValue}
      />
    )
  }

  return (
    <Surface variant="qualityPage" className="mb-6">
      <Tabs
        orientation="vertical"
        value={activeThemeId}
        onValueChange={(value) =>
          setSelectedQualityTheme(value as QualityThemeId)
        }
        className="grid items-start gap-5 md:grid-cols-[14rem_minmax(0,1fr)]"
      >
        <div className="md:hidden">
          <Text
            htmlFor="quality-theme"
            as="label"
            variant="captionLabel"
            tone="subtle"
            className="mb-1.5 block"
          >
            {i18n.t('ui.dataqualitytab.qualityTheme')}
          </Text>
          <Select
            label={i18n.t('ui.dataqualitytab.qualityTheme')}
            id="quality-theme"
            value={activeThemeId}
            onChange={(event) =>
              setSelectedQualityTheme(event.target.value as QualityThemeId)
            }
            variant="quality"
            className="w-full px-3 py-2.5"
          >
            {themes.map((theme) => (
              <QualityThemeOption key={theme.id} theme={theme} />
            ))}
          </Select>
        </div>

        <Tabs.List
          variant="sidebar"
          className="hidden space-y-1 md:block md:pr-4"
          label={i18n.t('ui.dataqualitytab.dataQualityThemes')}
        >
          {themes.map((theme) => (
            <QualityThemeTab
              key={theme.id}
              activeThemeId={activeThemeId}
              theme={theme}
            />
          ))}
        </Tabs.List>

        <Tabs.Content value={activeThemeId} className="min-w-0">
          <Surface
            variant="sectionEnd"
            className="mb-5 flex flex-wrap items-start gap-3 pb-4"
          >
            <div className="mr-auto min-w-0">
              <div className="flex items-center gap-2">
                <Surface
                  as="span"
                  variant="statusCanvasFrame"
                  className="flex h-5 w-5 shrink-0 items-center justify-center"
                >
                  <ToneSwatch
                    tone={QUALITY_TONES[activeTheme.tone]}
                    shape="dot"
                    className="h-2 w-2"
                  />
                </Surface>
                <Text as="h2" variant="heading" tone="default">
                  {activeTheme.label}
                </Text>
              </div>
              <Text
                as="p"
                variant="helper"
                tone="subtle"
                className="mt-1 max-w-2xl"
              >
                {activeTheme.description}
              </Text>
            </div>
            <div className="shrink-0">
              {activeDetailAction ? (
                <DetailKpiButton
                  theme={activeTheme}
                  actionLabel={activeDetailAction.label}
                  detailLabel={activeDetailAction.detail}
                  expanded={activeDetailAction.expanded}
                  onClick={activeDetailAction.onClick}
                />
              ) : (
                <Surface
                  variant="insetStatistic"
                  align="right"
                  className="relative min-w-[8rem] overflow-hidden px-4 py-3"
                >
                  <ToneSwatch
                    tone={QUALITY_TONES[activeTheme.tone]}
                    shape="sideAccent"
                    className="absolute inset-y-2 left-0 w-0.5"
                  />
                  <Text as="div" variant="compactMetric" tone="default" numeric>
                    {activeTheme.metric}
                  </Text>
                  <Text
                    as="div"
                    variant="eyebrowLabel"
                    tone="subtle"
                    className="mt-1.5"
                  >
                    {activeTheme.metricLabel}
                  </Text>
                </Surface>
              )}
            </div>
          </Surface>

          {activeThemeId === 'pipeline' && <ErrorsTab errors={errors} />}

          {activeThemeId === 'prices' && (
            <ManualPriceOverridesTable
              manualPriceOverrides={manualPriceOverrides}
            />
          )}

          {activeThemeId === 'classification' && (
            <ClassificationCoverageState state={classificationViewState} />
          )}

          {activeThemeId === 'lookthrough' && lookThroughContent}
        </Tabs.Content>
      </Tabs>

      <FundDataQualityPanel
        statuses={scopedFundData.statuses}
        holdings={scopedFundData.holdings}
        snapshots={scopedFundData.snapshots}
        unresolved={scopedFundData.unresolved}
      />

      <SidePanel
        open={classificationDetailsOpen}
        onClose={closeClassificationDetails}
        closeLabel={i18n.t('ui.dataqualitytab.closeAffectedAssetsDetails')}
        size="medium"
      >
        <SidePanel.Title>
          {classificationDimension
            ? i18n.t('ui.dataqualitytab.affectedAssetsValue0', {
                value0: DATA_QUALITY_DIMENSION_LABELS[classificationDimension],
              })
            : i18n.t('ui.dataqualitytab.affectedAssets')}
        </SidePanel.Title>
        <SidePanel.Description>
          {i18n.t(
            'ui.dataqualitytab.positionsContributingToUndocumentedDiversificationDataSortedByTheir',
          )}
        </SidePanel.Description>
        <AffectedAssetsTable assets={visibleAffectedAssets} />
      </SidePanel>
    </Surface>
  )
}
