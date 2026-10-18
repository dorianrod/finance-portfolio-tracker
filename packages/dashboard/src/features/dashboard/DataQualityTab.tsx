import { useMemo } from 'react'
import type { PositionRow } from '@/types/domain'
import type { ErrorRow } from '@/hooks/useErrors'
import type { ManualPriceOverride } from '@/hooks/useManualPriceOverrides'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { AllocationCoverageCard } from '@/features/allocation-charts/AllocationCoverageCard'
import { computeAllocationCoverageByAccount, computeAllocationCoverageByDimension } from '@/features/allocation-charts/allocationCoverage.logic'
import { ErrorsTab } from '@/features/errors/ErrorsTab'
import type { FundCoverageReport, FundHoldingStatus } from '@/hooks/useFundHoldings'
import { LookThroughCoverageSummary } from '@/features/fund-holdings/LookThroughCoverageSummary'
import { FundDataQualityPanel } from '@/features/fund-holdings/FundDataQualityPanel'

export function DataQualityTab({
  positions, accountLabels, errors, manualPriceOverrides, fundStatuses, fundReport,
}: {
  positions: PositionRow[]
  accountLabels: Record<string, string>
  errors: ErrorRow[]
  manualPriceOverrides: ManualPriceOverride[]
  fundStatuses: FundHoldingStatus[]
  fundReport: FundCoverageReport | null
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
          <h2 className="text-base font-semibold text-white">Look-through completeness</h2>
          <p className="mt-1 text-xs text-gray-500">High-confidence ETF/fund coverage and the parts that remain undisclosed or intrinsically opaque.</p>
        </div>
        <LookThroughCoverageSummary report={fundReport} />
      </section>
      {fundStatuses.length > 0 && <FundDataQualityPanel statuses={fundStatuses} />}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Allocation data completeness</h2>
          <p className="mt-1 text-xs text-gray-500">Portfolio scope split into mapped and unmapped positions, with a consistent detail level for each branch.</p>
        </div>
        {coverage.length > 0 ? <AllocationCoverageCard coverage={coverage} dimensionCoverage={dimensionCoverage} accountLabels={accountLabels} /> : <p className="text-sm text-gray-500">No allocation coverage data available.</p>}
      </section>
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Pipeline controls</h2>
          <p className="mt-1 text-xs text-gray-500">Import anomalies and manual market-price overrides.</p>
        </div>
        <ErrorsTab errors={errors} manualPriceOverrides={manualPriceOverrides} />
      </section>
    </div>
  )
}
