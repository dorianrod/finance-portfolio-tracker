import { ClassificationCoverageState } from '@/domains/portfolio/features/data-quality/components/ClassificationCoverageState.state'
import { FundDataQualityPanel } from '@/domains/portfolio/features/data-quality/components/FundDataQualityPanel.feature'
import { LookThroughCoverageSummary } from '@/domains/portfolio/features/data-quality/components/LookThroughCoverageSummary.feature'
import { ErrorsTab } from '@/domains/portfolio/features/data-quality/features/errors/components/ErrorsTab.feature'
import { ManualPriceOverridesTable } from '@/domains/portfolio/features/data-quality/features/errors/components/ManualPriceOverridesTable.view'
import { DATA_QUALITY_DIMENSION_LABELS } from '@/domains/portfolio/features/data-quality/helpers/formatters/dataQualityDimensionLabels'
import { TONE_STYLES } from '@/domains/portfolio/features/data-quality/pages/helpers/presenters/dataQualityToneStyles'
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
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { useMemo } from 'react'
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
        ? affectedAssets.filter((asset) => asset.dimensions.includes(classificationDimension))
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
        detail: i18n.t('ui.dataqualitytab.issuesToInspect', { count: fundIssueCount }),
        expanded: fundDiagnosticsOpen,
        onClick: openFundDiagnostics,
      }
    }

    if (activeThemeId === 'classification' && classificationApplicableValue > 0) {
      return {
        label: i18n.t('ui.dataqualitytab.inspect'),
        detail:
          affectedAssets.length > 0
            ? i18n.t('ui.dataqualitytab.assetsToInspect', { count: affectedAssets.length })
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
          ? i18n.t('ui.dataqualitytab.lookThroughIsNotApplicableToSavingsCheckingAnd')
          : i18n.t('ui.dataqualitytab.noLookThroughQualityReportRunThePortfolioPipeline')
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
    <div className="data-quality-view mb-6">
      <div className="grid items-start gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="md:hidden">
          <label
            htmlFor="quality-theme"
            className="mb-1.5 block text-xs font-medium text-content-subtle"
          >
            {i18n.t('ui.dataqualitytab.qualityTheme')}
          </label>
          <select
            id="quality-theme"
            value={activeThemeId}
            onChange={(event) => setSelectedQualityTheme(event.target.value as QualityThemeId)}
            className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-content-secondary focus:border-accent focus:outline-none"
          >
            {themes.map((theme) => (
              <QualityThemeOption key={theme.id} theme={theme} />
            ))}
          </select>
        </div>

        <nav
          className="hidden space-y-1 md:block md:border-r md:border-border md:pr-4"
          aria-label={i18n.t('ui.dataqualitytab.dataQualityThemes')}
          role="tablist"
          aria-orientation="vertical"
        >
          {themes.map((theme) => (
            <QualityThemeTab
              key={theme.id}
              activeThemeId={activeThemeId}
              onSelect={setSelectedQualityTheme}
              theme={theme}
            />
          ))}
        </nav>

        <section
          id="quality-theme-panel"
          role="tabpanel"
          aria-labelledby={`quality-theme-${activeThemeId}`}
          className="min-w-0"
        >
          <div className="mb-5 flex flex-wrap items-start gap-3 border-b border-border pb-4">
            <div className="mr-auto min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-canvas ring-1 ring-border"
                  aria-hidden="true"
                >
                  <span className={`h-2 w-2 rounded-full ${TONE_STYLES[activeTheme.tone].dot}`} />
                </span>
                <h2 className="text-base font-semibold text-content">{activeTheme.label}</h2>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-content-subtle">
                {activeTheme.description}
              </p>
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
                <div className="relative min-w-[8rem] overflow-hidden rounded-md bg-canvas/70 px-4 py-3 text-right">
                  <span
                    className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full ${TONE_STYLES[activeTheme.tone].accent}`}
                    aria-hidden="true"
                  />
                  <div className="text-xl font-semibold tabular-nums leading-none tracking-tight text-content">
                    {activeTheme.metric}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-content-subtle">
                    {activeTheme.metricLabel}
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeThemeId === 'pipeline' && <ErrorsTab errors={errors} />}

          {activeThemeId === 'prices' && (
            <ManualPriceOverridesTable manualPriceOverrides={manualPriceOverrides} />
          )}

          {activeThemeId === 'classification' && (
            <ClassificationCoverageState state={classificationViewState} />
          )}

          {activeThemeId === 'lookthrough' && lookThroughContent}
        </section>
      </div>

      <FundDataQualityPanel
        statuses={scopedFundData.statuses}
        holdings={scopedFundData.holdings}
        snapshots={scopedFundData.snapshots}
        unresolved={scopedFundData.unresolved}
      />

      <SidePanel
        open={classificationDetailsOpen}
        title={
          classificationDimension
            ? i18n.t('ui.dataqualitytab.affectedAssetsValue0', {
                value0: DATA_QUALITY_DIMENSION_LABELS[classificationDimension],
              })
            : i18n.t('ui.dataqualitytab.affectedAssets')
        }
        description={i18n.t(
          'ui.dataqualitytab.positionsContributingToUndocumentedDiversificationDataSortedByTheir',
        )}
        onClose={closeClassificationDetails}
        closeLabel={i18n.t('ui.dataqualitytab.closeAffectedAssetsDetails')}
        size="medium"
      >
        <AffectedAssetsTable assets={visibleAffectedAssets} />
      </SidePanel>
    </div>
  )
}
