import { useEffect, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import type { PositionRow } from '@/domains/portfolio/types/domain'
import type { ErrorRow } from '@/domains/portfolio/apis/queries/useErrors'
import type { ManualPriceOverride } from '@/domains/portfolio/apis/queries/useManualPriceOverrides'
import type { RawIsinData } from '@/domains/portfolio/apis/queries/useRawIsinData'
import { AllocationCoverageCard } from '@/domains/portfolio/components/allocation-charts/AllocationCoverageCard.feature'
import { ErrorsTab, ManualPriceOverridesTable } from '@/domains/portfolio/components/errors/ErrorsTab.feature'
import type { FundCoverageReport, FundHolding, FundHoldingStatus, FundSnapshot, FundUnresolved } from '@/domains/portfolio/apis/queries/useFundHoldings'
import { LookThroughCoverageSummary } from '@/domains/portfolio/components/fund-holdings/LookThroughCoverageSummary.feature'
import { FundDataQualityPanel } from '@/domains/portfolio/components/fund-holdings/FundDataQualityPanel.feature'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import {
  buildDataQualityViewModel,
  DATA_QUALITY_DIMENSION_LABELS,
  type AffectedAsset,
  type QualityTheme,
} from './data-quality/helpers/mappers/buildDataQualityViewModel'
import { useDataQualityClassificationDetails } from './data-quality/services/actions/useDataQualityClassificationDetails'
import { useDataQualityFundDiagnostics } from './data-quality/services/actions/useDataQualityFundDiagnostics'
import {
  dataQualityClassificationDetailsOpenAtom,
  dataQualityClassificationDimensionAtom,
  dataQualityFundDiagnosticsOpenAtom,
} from './data-quality/stores/dataQualityPanels.atoms'
import type { QualityThemeId, QualityTone } from '@/domains/portfolio/types/quality'
import { useDashboardQuality } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardQuality'
import { dashboardSelectedQualityThemeAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardQuality.atoms'

export type { QualityThemeId } from '@/domains/portfolio/types/quality'

interface DataQualityTabProps {
  positions: PositionRow[]
  errors: ErrorRow[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
  fundHoldings: FundHolding[]
  fundSnapshots: FundSnapshot[]
  fundUnresolved: FundUnresolved[]
  rawData: RawIsinData
}

const TONE_STYLES: Record<QualityTone, { dot: string; accent: string }> = {
  healthy: {
    dot: 'bg-emerald-500',
    accent: 'bg-emerald-500',
  },
  warning: {
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
  },
  critical: {
    dot: 'bg-red-500',
    accent: 'bg-red-500',
  },
  unavailable: {
    dot: 'bg-gray-600',
    accent: 'bg-gray-500',
  },
}

function QualityThemeOption({ theme }: { theme: QualityTheme }) {
  return <option value={theme.id}>{theme.label} · {theme.metric} {theme.metricLabel}</option>
}

function QualityThemeTab({ activeThemeId, onSelect, theme }: { activeThemeId: QualityThemeId; onSelect: (theme: QualityThemeId) => void; theme: QualityTheme }) {
  const active = theme.id === activeThemeId
  const styles = TONE_STYLES[theme.tone]
  return <button type="button" role="tab" aria-selected={active} aria-controls="quality-theme-panel" onClick={() => onSelect(theme.id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${active ? 'bg-blue-900/50' : 'hover:bg-gray-900'}`}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 ring-1 ring-gray-800" aria-hidden="true"><span className={`h-2 w-2 rounded-full ${styles.dot}`} /></span><span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>{theme.label}</span><span className="mt-0.5 block truncate text-[11px] text-gray-600">{theme.metricLabel}</span></span><span className="shrink-0 text-sm font-semibold tabular-nums text-gray-100">{theme.metric}</span></button>
}

function useDataQualityViewModel({
  positions, errors, manualPriceOverrides, fundStatuses, fundReport,
  fundHoldings, fundSnapshots, fundUnresolved, rawData,
}: DataQualityTabProps) {
  const formatPercentage = useFormatPercentage()
  const selectedTheme = useAtomValue(dashboardSelectedQualityThemeAtom)
  const { setSelectedQualityTheme } = useDashboardQuality()
  const viewModel = useMemo(
    () => buildDataQualityViewModel({
      positions,
      errors,
      manualPriceOverrides,
      fundStatuses,
      fundReport,
      fundHoldings,
      fundSnapshots,
      fundUnresolved,
      rawData,
      formatPercentage,
    }),
    [
      positions,
      errors,
      manualPriceOverrides,
      fundStatuses,
      fundReport,
      fundHoldings,
      fundSnapshots,
      fundUnresolved,
      rawData,
      formatPercentage,
    ],
  )
  const activeThemeId = selectedTheme ?? viewModel.recommendedTheme.id
  const activeTheme = viewModel.themes.find((theme) => theme.id === activeThemeId) ?? viewModel.themes[0]
  return { ...viewModel, activeTheme, activeThemeId, setSelectedQualityTheme }
}

function useDataQualityPanels() {
  const fundDiagnosticsOpen = useAtomValue(dataQualityFundDiagnosticsOpenAtom)
  const classificationDetailsOpen = useAtomValue(dataQualityClassificationDetailsOpenAtom)
  const classificationDimension = useAtomValue(dataQualityClassificationDimensionAtom)
  const {
    closeClassificationDetails,
    openAllClassificationDetails,
  } = useDataQualityClassificationDetails()
  const {
    closeFundDiagnostics,
    openFundDiagnostics,
  } = useDataQualityFundDiagnostics()

  useEffect(() => () => {
    closeClassificationDetails()
    closeFundDiagnostics()
  }, [closeClassificationDetails, closeFundDiagnostics])

  return {
    classificationDetailsOpen,
    classificationDimension,
    closeClassificationDetails,
    fundDiagnosticsOpen,
    openAllClassificationDetails,
    openFundDiagnostics,
  }
}

export function DataQualityTab({
  positions, errors, manualPriceOverrides, fundStatuses, fundReport,
  fundHoldings, fundSnapshots, fundUnresolved, rawData,
}: DataQualityTabProps) {
  const {
    activeTheme,
    activeThemeId,
    affectedAssets,
    classificationApplicableValue,
    classificationIsNotApplicable,
    coverage,
    dimensionCoverage,
    fundIssueCount,
    hasLookThroughScope,
    scopedFundData,
    setSelectedQualityTheme,
    themes,
  } = useDataQualityViewModel({
    positions, errors, manualPriceOverrides, fundStatuses, fundReport,
    fundHoldings, fundSnapshots, fundUnresolved, rawData,
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
    () => classificationDimension
      ? affectedAssets.filter((asset) => asset.dimensions.includes(classificationDimension))
      : affectedAssets,
    [affectedAssets, classificationDimension],
  )
  const activeDetailAction = useMemo(() => {
    if (
      activeThemeId === 'lookthrough'
      && hasLookThroughScope
      && scopedFundData.statuses.length > 0
    ) {
      return {
        label: 'Inspect',
        detail: `${fundIssueCount} issue${fundIssueCount === 1 ? '' : 's'} to inspect`,
        expanded: fundDiagnosticsOpen,
        onClick: openFundDiagnostics,
      }
    }

    if (activeThemeId === 'classification' && classificationApplicableValue > 0) {
      return {
        label: 'Inspect',
        detail: affectedAssets.length > 0
          ? `${affectedAssets.length} asset${affectedAssets.length === 1 ? '' : 's'} to inspect`
          : 'No affected asset',
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
  let classificationContent = (
    // eslint-disable-next-line local/no-prop-drilling -- Loading-state copy is selected by the owning page feature.
    <EmptyQualityState message={rawData.loading ? 'Loading classification coverage…' : 'No classification coverage data available.'} />
  )
  if (classificationIsNotApplicable) {
    classificationContent = <EmptyQualityState message="Classification is not applicable to savings, checking and brokerage-cash accounts." />
  } else if (coverage.length > 0) {
    classificationContent = (
      <AllocationCoverageCard
        coverage={coverage}
        dimensionCoverage={dimensionCoverage}
      />
    )
  }

  let lookThroughContent = (
    <EmptyQualityState message={scopedFundData.report
      ? 'Look-through is not applicable to savings, checking and brokerage-cash accounts.'
      : 'No look-through quality report. Run the portfolio pipeline to generate it.'} />
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
          <label htmlFor="quality-theme" className="mb-1.5 block text-xs font-medium text-gray-500">Quality theme</label>
          <select
            id="quality-theme"
            value={activeThemeId}
            onChange={(event) => setSelectedQualityTheme(event.target.value as QualityThemeId)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            {themes.map((theme) => <QualityThemeOption key={theme.id} theme={theme} />)}
          </select>
        </div>

        <nav className="hidden space-y-1 md:block md:border-r md:border-gray-800 md:pr-4" aria-label="Data quality themes" role="tablist" aria-orientation="vertical">
          {themes.map((theme) => <QualityThemeTab key={theme.id} activeThemeId={activeThemeId} onSelect={setSelectedQualityTheme} theme={theme} />)}
        </nav>

        <section
          id="quality-theme-panel"
          role="tabpanel"
          className="min-w-0"
        >
          <div className="mb-5 flex flex-wrap items-start gap-3 border-b border-gray-800 pb-4">
            <div className="mr-auto min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-950 ring-1 ring-gray-800" aria-hidden="true">
                  <span className={`h-2 w-2 rounded-full ${TONE_STYLES[activeTheme.tone].dot}`} />
                </span>
                <h2 className="text-base font-semibold text-white">{activeTheme.label}</h2>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">{activeTheme.description}</p>
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
                <div className="relative min-w-[8rem] overflow-hidden rounded-md bg-gray-950/70 px-4 py-3 text-right">
                  <span className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full ${TONE_STYLES[activeTheme.tone].accent}`} aria-hidden="true" />
                  <div className="text-xl font-semibold tabular-nums leading-none tracking-tight text-gray-100">{activeTheme.metric}</div>
                  <div className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">{activeTheme.metricLabel}</div>
                </div>
              )}
            </div>
          </div>

          {activeThemeId === 'pipeline' && <ErrorsTab errors={errors} />}

          {activeThemeId === 'prices' && (
            <ManualPriceOverridesTable manualPriceOverrides={manualPriceOverrides} />
          )}

          {activeThemeId === 'classification' && classificationContent}

          {activeThemeId === 'lookthrough' && lookThroughContent}
        </section>
      </div>

      {fundDiagnosticsOpen && (
        <FundDataQualityPanel
          statuses={scopedFundData.statuses}
          holdings={scopedFundData.holdings}
          snapshots={scopedFundData.snapshots}
          unresolved={scopedFundData.unresolved}
        />
      )}

      {classificationDetailsOpen && (
        <SidePanel
          title={classificationDimension ? `Affected assets · ${DATA_QUALITY_DIMENSION_LABELS[classificationDimension]}` : 'Affected assets'}
          description="Positions contributing to undocumented diversification data, sorted by their largest monetary gap."
          onClose={closeClassificationDetails}
          closeLabel="Close affected assets details"
          size="medium"
        >
          <AffectedAssetsTable
            assets={visibleAffectedAssets}
          />
        </SidePanel>
      )}
    </div>
  )
}

function AffectedAssetsTable({ assets }: { assets: AffectedAsset[] }) {
  if (assets.length === 0) {
    return <p className="p-6 text-center text-sm text-gray-500">No affected asset for this scope.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 z-10 bg-gray-900 text-gray-500">
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 font-medium">Asset</th>
            <th className="px-4 py-3 font-medium">Affected dimensions</th>
            <th className="px-4 py-3 text-right font-medium">Largest gap</th>
            <th className="px-4 py-3 text-right font-medium">Position value</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => <AffectedAssetRow key={asset.id} asset={asset} />)}
        </tbody>
      </table>
    </div>
  )
}

function AffectedDimensionBadge({ dimension }: { dimension: AffectedAsset['dimensions'][number] }) {
  return <span className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">{DATA_QUALITY_DIMENSION_LABELS[dimension]}</span>
}

function AffectedAssetRow({ asset }: { asset: AffectedAsset }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return <tr className="border-b border-gray-800/70 align-top hover:bg-gray-950/40"><td className="px-4 py-3"><div className="font-medium text-gray-200">{asset.name}</div><div className="mt-1 break-all font-mono text-[10px] text-gray-600">{asset.id}</div></td><td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">{asset.dimensions.map((dimension) => <AffectedDimensionBadge key={dimension} dimension={dimension} />)}</div></td><td className="px-4 py-3 text-right tabular-nums"><div className="font-medium text-amber-400">{formatMoney(asset.largestGapValue, { style: 'full' })}</div><div className="mt-1 text-[10px] text-gray-600">{formatPercentage(asset.largestGapPct)}</div></td><td className="px-4 py-3 text-right font-medium tabular-nums text-gray-300">{formatMoney(asset.value, { style: 'full' })}</td></tr>
}

function DetailKpiButton({
  theme, actionLabel, detailLabel, expanded, onClick,
}: {
  theme: QualityTheme
  actionLabel: string
  detailLabel: string
  expanded: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-label={`${actionLabel}: ${theme.metric} ${theme.metricLabel}, ${detailLabel}`}
      className="group relative flex min-w-[19rem] items-center gap-4 overflow-hidden rounded-md bg-gray-950/70 px-5 py-4 text-left text-gray-100 transition-colors hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
    >
      <span className={`absolute inset-y-2 left-0 w-0.5 rounded-r-full ${TONE_STYLES[theme.tone].accent}`} aria-hidden="true" />
      <span>
        <span className="block text-2xl font-semibold tabular-nums leading-none tracking-tight">{theme.metric}</span>
        <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-500">{theme.metricLabel}</span>
      </span>
      <span className="ml-auto flex items-center gap-3 border-l border-gray-800 pl-4">
        <span>
          <span className="block text-xs font-semibold text-blue-400">{actionLabel}</span>
          <span className="mt-0.5 block text-[10px] text-gray-500">{detailLabel}</span>
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900/60 text-blue-300">
          <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.22 14.78a.75.75 0 0 1 0-1.06L10.94 10 7.22 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
          </svg>
        </span>
      </span>
    </button>
  )
}

function EmptyQualityState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950/30 px-4 py-8 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}
