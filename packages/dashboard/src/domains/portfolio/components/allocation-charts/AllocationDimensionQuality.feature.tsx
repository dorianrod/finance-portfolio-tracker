import type { DimensionCoverage } from './allocationCoverage.logic'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useDataQualityClassificationDetails } from '@/domains/portfolio/pages/data-quality/services/actions/useDataQualityClassificationDetails'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { hasMaterialQualityGap } from '@/domains/portfolio/helpers/quality/qualityThresholds'

const LABELS: Record<DimensionCoverage['dimension'], string> = {
  geo: 'Geography', secteur: 'Sector', currency: 'Currency', classe: 'Asset class',
}

export function AllocationDimensionQuality({
  coverage,
}: {
  coverage: DimensionCoverage[]
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { openClassificationDetails } = useDataQualityClassificationDetails()
  return (
    <div className="space-y-4">
      {coverage.map((item) => {
        const total = item.allocated + item.unallocated
        const missingPct = total > 0 ? item.unallocated / total * 100 : 0
        const materialGap = hasMaterialQualityGap(missingPct)
        const actionLabel = `${item.issues.length} responsible assets · View details`
        return (
          <div key={item.dimension}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-xs text-gray-400">{LABELS[item.dimension]}</span>
              <span className={`shrink-0 text-[11px] tabular-nums ${materialGap ? 'text-amber-400' : 'text-emerald-400'}`}>{formatMoney(item.unallocated, { style: 'full' })} · {formatPercentage(missingPct)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800" title={`${formatPercentage(missingPct)} not classified for ${LABELS[item.dimension].toLowerCase()}`}>
              <div className={`h-full rounded-full ${materialGap ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, missingPct)}%` }} />
            </div>
            <button
              type="button"
              onClick={() => openClassificationDetails(item.dimension)}
              className="mt-1.5 text-[11px] text-blue-400 hover:text-blue-300"
            >
              {actionLabel}
            </button>
          </div>
        )
      })}
    </div>
  )
}
