import { useMemo, useState } from 'react'
import type { PositionRow } from '@/types/domain'
import type { ErrorRow } from '@/hooks/useErrors'
import type { ManualPriceOverride } from '@/hooks/useManualPriceOverrides'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { AllocationCoverageCard } from '@/features/allocation-charts/AllocationCoverageCard'
import { computeAllocationCoverageByAccount, computeAllocationCoverageByDimension } from '@/features/allocation-charts/allocationCoverage.logic'
import { ErrorsTab, ManualPriceOverridesPanel } from '@/features/errors/ErrorsTab'
import type { FundCoverageReport, FundHolding, FundHoldingStatus, FundSnapshot, FundUnresolved } from '@/hooks/useFundHoldings'
import { LookThroughCoverageSummary } from '@/features/fund-holdings/LookThroughCoverageSummary'
import { FundDataQualityPanel } from '@/features/fund-holdings/FundDataQualityPanel'
import { scopeFundQualityData } from '@/features/fund-holdings/fundQualityScope.logic'
import { SidePanel } from '@/shared/ui/SidePanel'
import { fmtFull } from '@/shared/format/money'
import { formatPercentage, partitionPercentages } from '@/shared/format/percentage'
import { hasMaterialQualityGap } from '@/shared/quality/qualityThresholds'

type QualityThemeId = 'pipeline' | 'prices' | 'classification' | 'lookthrough'
type QualityTone = 'healthy' | 'warning' | 'critical' | 'unavailable'

interface QualityTheme {
  id: QualityThemeId
  label: string
  description: string
  metric: string
  metricLabel: string
  tone: QualityTone
  priority: number
}

interface AffectedAsset {
  id: string
  name: string
  value: number
  dimensions: Array<keyof typeof DIMENSION_LABELS>
  largestGapValue: number
  largestGapPct: number
}

const DIMENSION_LABELS = {
  geo: 'geography',
  secteur: 'sector',
  currency: 'currency',
  classe: 'asset class',
} as const

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

export function DataQualityTab({
  positions, accountLabels, errors, manualPriceOverrides, fundStatuses, fundReport,
  fundHoldings, fundSnapshots, fundUnresolved,
}: {
  positions: PositionRow[]
  accountLabels: Record<string, string>
  errors: ErrorRow[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
  fundHoldings: FundHolding[]
  fundSnapshots: FundSnapshot[]
  fundUnresolved: FundUnresolved[]
}) {
  const [selectedTheme, setSelectedTheme] = useState<QualityThemeId | null>(null)
  const [fundDiagnosticsOpen, setFundDiagnosticsOpen] = useState(false)
  const [classificationDetailsOpen, setClassificationDetailsOpen] = useState(false)
  const [classificationDimension, setClassificationDimension] = useState<keyof typeof DIMENSION_LABELS | null>(null)
  const rawData = useRawIsinData()
  const coverage = useMemo(
    () => rawData.loading ? [] : computeAllocationCoverageByAccount(positions, rawData),
    [positions, rawData],
  )
  const dimensionCoverage = useMemo(
    () => rawData.loading ? [] : computeAllocationCoverageByDimension(positions, rawData),
    [positions, rawData],
  )
  const scopedFundData = useMemo(
    () => scopeFundQualityData(
      positions,
      fundHoldings,
      fundStatuses,
      fundSnapshots,
      fundUnresolved,
      fundReport,
    ),
    [positions, fundHoldings, fundStatuses, fundSnapshots, fundUnresolved, fundReport],
  )

  const errorCount = errors.filter((item) => item.level === 'error').length
  const warningCount = errors.length - errorCount
  const classificationMappedValue = coverage.reduce((sum, item) => sum + item.allocated, 0)
  const classificationUnmappedValue = coverage.reduce((sum, item) => sum + item.unallocated, 0)
  const classificationApplicableValue = classificationMappedValue + classificationUnmappedValue
  const classificationNotApplicableValue = coverage.reduce(
    (sum, item) => sum + item.notApplicable,
    0,
  )
  const [, classificationGap] = partitionPercentages([
    classificationMappedValue,
    classificationUnmappedValue,
    classificationNotApplicableValue,
  ])
  const classificationIsNotApplicable = !rawData.loading
    && classificationApplicableValue <= 0
    && classificationNotApplicableValue > 0
  const affectedAssets = useMemo(() => {
    const byAsset = new Map<string, AffectedAsset>()
    for (const dimension of dimensionCoverage) {
      for (const issue of dimension.issues) {
        const gapPct = issue.value > 0 ? issue.unallocated / issue.value * 100 : 0
        const current: AffectedAsset = byAsset.get(issue.id) ?? {
          id: issue.id,
          name: issue.name,
          value: issue.value,
          dimensions: [],
          largestGapValue: 0,
          largestGapPct: 0,
        }
        current.value = Math.max(current.value, issue.value)
        if (!current.dimensions.includes(dimension.dimension)) current.dimensions.push(dimension.dimension)
        if (issue.unallocated > current.largestGapValue) {
          current.largestGapValue = issue.unallocated
          current.largestGapPct = gapPct
        }
        byAsset.set(issue.id, current)
      }
    }
    return [...byAsset.values()].sort((a, b) => b.largestGapValue - a.largestGapValue)
  }, [dimensionCoverage])
  const unresolvedValue = scopedFundData.report
    ? scopedFundData.report.undisclosedFundValue + scopedFundData.report.opaqueValue
    : 0
  const identifiedValue = scopedFundData.report
    ? scopedFundData.report.directIdentifiedValue + scopedFundData.report.decomposedValue
    : 0
  const [, unresolvedPct] = partitionPercentages([
    identifiedValue,
    unresolvedValue,
    scopedFundData.notApplicableValue,
  ])
  const fundErrorCount = scopedFundData.statuses.filter((status) => status.validationStatus === 'error').length
  const fundIssueCount = scopedFundData.statuses.filter(
    (status) => status.validationStatus !== 'ok' || hasMaterialQualityGap(status.residualPct),
  ).length
  const hasLookThroughScope = !!scopedFundData.report && scopedFundData.report.portfolioValue > 0

  const themes: QualityTheme[] = [
    {
      id: 'pipeline',
      label: 'Pipeline',
      description: 'Import and market-data anomalies detected during the latest run.',
      metric: String(errors.length),
      metricLabel: errors.length === 1 ? 'anomaly' : 'anomalies',
      tone: errorCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'healthy',
      priority: errorCount > 0 ? 1_000 + errorCount : warningCount > 0 ? 700 + warningCount : 0,
    },
    {
      id: 'prices',
      label: 'Manual prices',
      description: 'Overrides that replace automatic market prices.',
      metric: String(manualPriceOverrides.length),
      metricLabel: manualPriceOverrides.length === 1 ? 'override' : 'overrides',
      tone: manualPriceOverrides.length > 0 ? 'warning' : 'healthy',
      priority: manualPriceOverrides.length > 0 ? 400 + manualPriceOverrides.length : 0,
    },
    {
      id: 'classification',
      label: 'Diversification',
      description: 'Completeness of asset class, geography, sector and currency data.',
      metric: rawData.loading ? '—' : classificationIsNotApplicable ? 'N/A' : `${formatPercentage(classificationGap)}%`,
      metricLabel: rawData.loading
        ? 'loading'
        : classificationIsNotApplicable
          ? 'not applicable'
          : 'unmapped',
      tone: rawData.loading || classificationIsNotApplicable ? 'unavailable' : hasMaterialQualityGap(classificationGap) ? 'warning' : 'healthy',
      priority: rawData.loading || classificationIsNotApplicable ? -1 : hasMaterialQualityGap(classificationGap) ? 500 + classificationGap : 0,
    },
    {
      id: 'lookthrough',
      label: 'Underlying assets',
      description: 'Transparency and source reliability of underlying fund exposures.',
      metric: hasLookThroughScope ? `${formatPercentage(unresolvedPct)}%` : scopedFundData.report ? 'N/A' : '—',
      metricLabel: hasLookThroughScope ? 'unresolved' : scopedFundData.report ? 'not applicable' : 'not available',
      tone: !hasLookThroughScope
        ? 'unavailable'
        : fundErrorCount > 0
          ? 'critical'
          : hasMaterialQualityGap(unresolvedPct)
            ? 'warning'
            : 'healthy',
      priority: !hasLookThroughScope
        ? -1
        : fundErrorCount > 0
          ? 900 + fundErrorCount
          : hasMaterialQualityGap(unresolvedPct)
            ? 600 + unresolvedPct
            : 0,
    },
  ]

  const recommendedTheme = themes.reduce(
    (highest, theme) => theme.priority > highest.priority ? theme : highest,
    themes[0],
  )
  const activeThemeId = selectedTheme ?? recommendedTheme.id
  const activeTheme = themes.find((theme) => theme.id === activeThemeId) ?? themes[0]
  const activeDetailAction = activeThemeId === 'lookthrough' && hasLookThroughScope && scopedFundData.statuses.length > 0
    ? {
        label: 'Inspect',
        detail: `${fundIssueCount} issue${fundIssueCount === 1 ? '' : 's'} to inspect`,
        expanded: fundDiagnosticsOpen,
        onClick: () => setFundDiagnosticsOpen(true),
      }
    : activeThemeId === 'classification' && classificationApplicableValue > 0
      ? {
          label: 'Inspect',
          detail: affectedAssets.length > 0
            ? `${affectedAssets.length} asset${affectedAssets.length === 1 ? '' : 's'} to inspect`
            : 'No affected asset',
          expanded: classificationDetailsOpen,
          onClick: () => {
            setClassificationDimension(null)
            setClassificationDetailsOpen(true)
          },
        }
      : null

  return (
    <div className="data-quality-view mb-6">
      <div className="grid items-start gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="md:hidden">
          <label htmlFor="quality-theme" className="mb-1.5 block text-xs font-medium text-gray-500">Quality theme</label>
          <select
            id="quality-theme"
            value={activeThemeId}
            onChange={(event) => setSelectedTheme(event.target.value as QualityThemeId)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.label} · {theme.metric} {theme.metricLabel}</option>
            ))}
          </select>
        </div>

        <nav className="hidden space-y-1 md:block md:border-r md:border-gray-800 md:pr-4" aria-label="Data quality themes" role="tablist" aria-orientation="vertical">
          {themes.map((theme) => {
            const active = theme.id === activeThemeId
            const styles = TONE_STYLES[theme.tone]
            return (
              <button
                key={theme.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="quality-theme-panel"
                onClick={() => setSelectedTheme(theme.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${active ? 'bg-blue-900/50' : 'hover:bg-gray-900'}`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 ring-1 ring-gray-800" aria-hidden="true">
                  <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>{theme.label}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-gray-600">{theme.metricLabel}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-100">{theme.metric}</span>
              </button>
            )
          })}
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
            <ManualPriceOverridesPanel manualPriceOverrides={manualPriceOverrides} showHeader={false} />
          )}

          {activeThemeId === 'classification' && (
            classificationIsNotApplicable
              ? <EmptyQualityState message="Classification is not applicable to savings, checking and brokerage-cash accounts." />
              : coverage.length > 0
              ? (
                  <AllocationCoverageCard
                    coverage={coverage}
                    dimensionCoverage={dimensionCoverage}
                    accountLabels={accountLabels}
                    onOpenAffectedAssets={(dimension) => {
                      setClassificationDimension(dimension ?? null)
                      setClassificationDetailsOpen(true)
                    }}
                  />
                )
              : <EmptyQualityState message={rawData.loading ? 'Loading classification coverage…' : 'No classification coverage data available.'} />
          )}

          {activeThemeId === 'lookthrough' && (
            hasLookThroughScope
              ? <LookThroughCoverageSummary
                  report={scopedFundData.report}
                  notApplicableValue={scopedFundData.notApplicableValue}
                />
              : <EmptyQualityState message={scopedFundData.report
                  ? 'Look-through is not applicable to savings, checking and brokerage-cash accounts.'
                  : 'No look-through quality report. Run the portfolio pipeline to generate it.'} />
          )}
        </section>
      </div>

      {fundDiagnosticsOpen && (
        <FundDataQualityPanel
          statuses={scopedFundData.statuses}
          holdings={scopedFundData.holdings}
          snapshots={scopedFundData.snapshots}
          unresolved={scopedFundData.unresolved}
          onClose={() => setFundDiagnosticsOpen(false)}
        />
      )}

      {classificationDetailsOpen && (
        <SidePanel
          title={classificationDimension ? `Affected assets · ${DIMENSION_LABELS[classificationDimension]}` : 'Affected assets'}
          description="Positions contributing to undocumented diversification data, sorted by their largest monetary gap."
          onClose={() => {
            setClassificationDetailsOpen(false)
            setClassificationDimension(null)
          }}
          closeLabel="Close affected assets details"
          size="medium"
        >
          <AffectedAssetsTable
            assets={classificationDimension
              ? affectedAssets.filter((asset) => asset.dimensions.includes(classificationDimension))
              : affectedAssets}
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
          {assets.map((asset) => (
            <tr key={asset.id} className="border-b border-gray-800/70 align-top hover:bg-gray-950/40">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-200">{asset.name}</div>
                <div className="mt-1 break-all font-mono text-[10px] text-gray-600">{asset.id}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {asset.dimensions.map((dimension) => (
                    <span key={dimension} className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">
                      {DIMENSION_LABELS[dimension]}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                <div className="font-medium text-amber-400">{fmtFull(asset.largestGapValue)}</div>
                <div className="mt-1 text-[10px] text-gray-600">{formatPercentage(asset.largestGapPct)}%</div>
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-300">{fmtFull(asset.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
