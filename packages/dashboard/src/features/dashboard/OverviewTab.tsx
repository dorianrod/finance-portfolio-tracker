import { useState } from 'react'
import type { IrrStatus } from '@/types/history'
import type { ConcentrationMode } from '@/features/portfolio-charts/ConcentrationModeToggle'
import type { OverviewComparison } from './overviewComparison.logic'
import { OverviewSummaryCards, type OverviewDestination } from './OverviewSummaryCards'
import { OverviewConcentrationChart, OverviewDriversChart, OverviewValueChart } from './OverviewCharts'

interface OverviewTabProps {
  comparison: OverviewComparison | null
  globalTri: number | null
  irrStatus: IrrStatus
  onNavigate: (destination: OverviewDestination) => void
}

export function OverviewTab({ comparison, globalTri, irrStatus, onNavigate }: OverviewTabProps) {
  const [concentrationMode, setConcentrationMode] = useState<ConcentrationMode>('lookThrough')

  if (!comparison) {
    return (
      <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-200">Overview unavailable</h3>
        <p className="mt-2 text-sm text-gray-500">Choose a valid period with available portfolio history.</p>
      </div>
    )
  }

  const lookThroughDisabled = comparison.lookThroughConcentration.current == null
  const displayedConcentrationMode = concentrationMode === 'lookThrough' && lookThroughDisabled
    ? 'held'
    : concentrationMode
  const concentration = displayedConcentrationMode === 'held'
    ? comparison.heldConcentration
    : comparison.lookThroughConcentration

  return (
    <div className="mb-6 space-y-4">
      <OverviewSummaryCards
        comparison={comparison}
        heldConcentration={comparison.heldConcentration}
        underlyingConcentration={comparison.lookThroughConcentration}
        globalTri={globalTri}
        irrStatus={irrStatus}
        onNavigate={onNavigate}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OverviewValueChart comparison={comparison} />
        <OverviewDriversChart comparison={comparison} />
        <OverviewConcentrationChart
          concentration={concentration}
          mode={displayedConcentrationMode}
          onModeChange={setConcentrationMode}
          lookThroughDisabled={lookThroughDisabled}
        />
      </div>
    </div>
  )
}
