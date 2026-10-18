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
  const [fundDiagnosticsOpen, setFundDiagnosticsOpen] = useState(false)
  const rawData = useRawIsinData()
  const coverage = useMemo(
    () => rawData.loading ? [] : computeAllocationCoverageByAccount(positions, rawData),
    [positions, rawData],
  )
  const dimensionCoverage = useMemo(
    () => rawData.loading ? [] : computeAllocationCoverageByDimension(positions, rawData),
    [positions, rawData],
  )
  return (
    <div className="mb-6 space-y-8">
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Pipeline controls</h2>
          <p className="mt-1 text-xs text-gray-500">Import and market-data anomalies detected during the latest pipeline run.</p>
        </div>
        <ErrorsTab errors={errors} />
      </section>
      <ManualPriceOverridesPanel manualPriceOverrides={manualPriceOverrides} />
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Diversification coverage</h2>
          <p className="mt-1 text-xs text-gray-500">Data coverage across asset class, geography, sector and currency.</p>
        </div>
        {coverage.length > 0 ? <AllocationCoverageCard coverage={coverage} dimensionCoverage={dimensionCoverage} accountLabels={accountLabels} /> : <p className="text-sm text-gray-500">No allocation coverage data available.</p>}
      </section>
      <section>
        <div className="mb-3 flex flex-wrap items-start gap-3">
          <div className="mr-auto">
            <h2 className="text-base font-semibold text-white">Look-through completeness</h2>
            <p className="mt-1 text-xs text-gray-500">Portfolio split into identified and unresolved exposure, with source reliability shown as a nested quality view.</p>
          </div>
          {fundStatuses.length > 0 && (
            <button
              type="button"
              onClick={() => setFundDiagnosticsOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={fundDiagnosticsOpen}
              className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${fundDiagnosticsOpen ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800 hover:text-gray-200'}`}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h11" />
                <circle cx="5" cy="3.5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="10.5" cy="8" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="7" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Fund data diagnostics
              <span className="rounded-full bg-gray-800/70 px-1.5 py-0.5 text-[10px] tabular-nums text-gray-300">
                {fundStatuses.length}
              </span>
            </button>
          )}
        </div>
        <LookThroughCoverageSummary report={fundReport} />
        {fundDiagnosticsOpen && (
          <FundDataQualityPanel
            statuses={fundStatuses}
            holdings={fundHoldings}
            snapshots={fundSnapshots}
            unresolved={fundUnresolved}
            onClose={() => setFundDiagnosticsOpen(false)}
          />
        )}
      </section>
    </div>
  )
}
