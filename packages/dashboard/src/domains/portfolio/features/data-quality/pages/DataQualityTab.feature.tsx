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
import { Grid, Inline, Layout, Stack } from '@/shared/ui/Layout.view'
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
    <div className="mb-6">
      <Surface variant="qualityPage">
        <Tabs
          orientation="vertical"
          value={activeThemeId}
          onValueChange={(value) =>
            setSelectedQualityTheme(value as QualityThemeId)
          }
        >
          <Grid arrangement="sidebar" align="start" gap="relaxed">
            <Layout hideFrom="medium">
              <Layout spaceAfter="default">
                <Text
                  htmlFor="quality-theme"
                  as="label"
                  variant="captionLabel"
                  tone="subtle"
                >
                  <Layout as="span" flow="block">
                    {i18n.t('ui.dataqualitytab.qualityTheme')}
                  </Layout>
                </Text>
              </Layout>
              <Layout as="span" flow="control" width="full">
                <Select
                  label={i18n.t('ui.dataqualitytab.qualityTheme')}
                  id="quality-theme"
                  value={activeThemeId}
                  onChange={(event) =>
                    setSelectedQualityTheme(
                      event.target.value as QualityThemeId,
                    )
                  }
                  variant="quality"
                >
                  {themes.map((theme) => (
                    <QualityThemeOption key={theme.id} theme={theme} />
                  ))}
                </Select>
              </Layout>
            </Layout>

            <Tabs.List
              variant="sidebar"
              label={i18n.t('ui.dataqualitytab.dataQualityThemes')}
            >
              <Stack gap="compact" inset="default">
                {themes.map((theme) => (
                  <QualityThemeTab
                    key={theme.id}
                    activeThemeId={activeThemeId}
                    theme={theme}
                  />
                ))}
              </Stack>
            </Tabs.List>

            <Layout>
              <Tabs.Content value={activeThemeId}>
                <Layout spaceAfter="spacious">
                  <Surface variant="sectionEnd">
                    <Inline
                      as="div"
                      flow="wrap"
                      align="start"
                      gap="default"
                      inset="default"
                    >
                      <Layout placement="leading">
                        <Inline as="div" align="center" gap="default">
                          <Layout
                            as="span"
                            flow="block"
                            height="icon"
                            sizing="fixed"
                          >
                            <Surface as="span" variant="statusCanvasFrame">
                              <Inline as="span" align="center" justify="center">
                                <Layout
                                  as="span"
                                  flow="inline"
                                  height="indicator"
                                  width="indicator"
                                >
                                  <ToneSwatch
                                    tone={QUALITY_TONES[activeTheme.tone]}
                                    shape="dot"
                                  />
                                </Layout>
                              </Inline>
                            </Surface>
                          </Layout>
                          <Text as="h2" variant="heading" tone="default">
                            {activeTheme.label}
                          </Text>
                        </Inline>
                        <Layout spaceBefore="compact">
                          <Text as="p" variant="helper" tone="subtle">
                            {activeTheme.description}
                          </Text>
                        </Layout>
                      </Layout>
                      <Layout sizing="fixed">
                        {activeDetailAction ? (
                          <DetailKpiButton
                            theme={activeTheme}
                            actionLabel={activeDetailAction.label}
                            detailLabel={activeDetailAction.detail}
                            expanded={activeDetailAction.expanded}
                            onClick={activeDetailAction.onClick}
                          />
                        ) : (
                          <Layout placement="inset" overflow="clip">
                            <Surface variant="insetStatistic" align="right">
                              <Layout
                                as="span"
                                flow="inline"
                                placement="overlay"
                                width="divider"
                              >
                                <ToneSwatch
                                  tone={QUALITY_TONES[activeTheme.tone]}
                                  shape="sideAccent"
                                />
                              </Layout>
                              <Text
                                as="div"
                                variant="compactMetric"
                                tone="default"
                                numeric
                              >
                                {activeTheme.metric}
                              </Text>
                              <Layout spaceBefore="default">
                                <Text
                                  as="div"
                                  variant="eyebrowLabel"
                                  tone="subtle"
                                >
                                  {activeTheme.metricLabel}
                                </Text>
                              </Layout>
                            </Surface>
                          </Layout>
                        )}
                      </Layout>
                    </Inline>
                  </Surface>
                </Layout>

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

                {activeThemeId === 'lookthrough' && lookThroughContent}
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

        <SidePanel
          open={classificationDetailsOpen}
          onClose={closeClassificationDetails}
          closeLabel={i18n.t('ui.dataqualitytab.closeAffectedAssetsDetails')}
          size="medium"
        >
          <SidePanel.Title>
            {classificationDimension
              ? i18n.t('ui.dataqualitytab.affectedAssetsValue0', {
                  value0:
                    DATA_QUALITY_DIMENSION_LABELS[classificationDimension],
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
    </div>
  )
}
