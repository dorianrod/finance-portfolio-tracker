import { useMemo } from 'react'
import type { PositionRow } from '@/types/domain'
import type { ErrorRow } from '@/hooks/useErrors'
import type { ManualPriceOverride } from '@/hooks/useManualPriceOverrides'
import { useRawIsinData } from '@/hooks/useRawIsinData'
import { AllocationCoverageCard } from '@/features/allocation-charts/AllocationCoverageCard'
import { computeAllocationCoverageByAccount } from '@/features/allocation-charts/allocationCoverage.logic'
import { ErrorsTab } from '@/features/errors/ErrorsTab'

export function DataQualityTab({ positions, accountLabels, errors, manualPriceOverrides }: {
  positions: PositionRow[]
  accountLabels: Record<string, string>
  errors: ErrorRow[]
  manualPriceOverrides: ManualPriceOverride[]
}) {
  const rawData = useRawIsinData()
  const coverage = useMemo(
    () => rawData.loading ? [] : computeAllocationCoverageByAccount(positions, rawData),
    [positions, rawData],
  )
  return (
    <div className="mb-6 space-y-8">
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">Allocation data completeness</h2>
          <p className="mt-1 text-xs text-gray-500">Coverage measures whether current holdings can be broken down by geography, sector, currency or asset class.</p>
        </div>
        {coverage.length > 0 ? <AllocationCoverageCard coverage={coverage} accountLabels={accountLabels} /> : <p className="text-sm text-gray-500">No allocation coverage data available.</p>}
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
