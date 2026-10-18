import { useMemo } from 'react'
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
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Look-through completeness</h2>
          <p className="mt-1 text-xs text-gray-500">Portfolio split into identified and unresolved exposure, with source reliability shown as a nested quality view.</p>
        </div>
        <LookThroughCoverageSummary report={fundReport} />
        {fundStatuses.length > 0 && <div className="mt-4"><FundDataQualityPanel statuses={fundStatuses} holdings={fundHoldings} snapshots={fundSnapshots} unresolved={fundUnresolved} /></div>}
      </section>
    </div>
  )
}
