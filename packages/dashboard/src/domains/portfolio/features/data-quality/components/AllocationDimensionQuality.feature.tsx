import i18n from '@/i18n/i18n'
import type { DimensionCoverage } from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/services/actions/useDataQualityClassificationDetails'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds'

const LABELS: Record<DimensionCoverage['dimension'], string> = {
  geo: i18n.t('ui.allocationdimensionquality.geography'), secteur: i18n.t('ui.allocationdimensionquality.sector'), currency: i18n.t('ui.allocationdimensionquality.currency'), classe: i18n.t('ui.allocationdimensionquality.assetClass'),
}

function AllocationDimensionRow({ item }: { item: DimensionCoverage }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { openClassificationDetails } = useDataQualityClassificationDetails()
  const total = item.allocated + item.unallocated
  const missingPct = total > 0 ? item.unallocated / total * 100 : 0
  const materialGap = hasMaterialQualityGap(missingPct)
  const label = LABELS[item.dimension]

  return <div><div className="mb-1.5 flex items-baseline justify-between gap-3"><span className="truncate text-xs text-gray-400">{label}</span><span className={`shrink-0 text-[11px] tabular-nums ${materialGap ? 'text-amber-400' : 'text-emerald-400'}`}>{formatMoney(item.unallocated, { style: 'full' })} · {formatPercentage(missingPct)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-gray-800" title={i18n.t('ui.allocationdimensionquality.value0NotClassifiedForValue1', { value0: formatPercentage(missingPct), value1: label.toLowerCase() })}><div className={`h-full rounded-full ${materialGap ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, missingPct)}%` }} /></div><button type="button" onClick={() => openClassificationDetails(item.dimension)} className="mt-1.5 text-[11px] text-blue-400 hover:text-blue-300">{item.issues.length}  {i18n.t('ui.allocationdimensionquality.responsibleAssetsViewDetails')}</button></div>
}

export function AllocationDimensionQuality({
  coverage,
}: {
  coverage: DimensionCoverage[]
}) {
  return (
    <div className="space-y-4">
      {coverage.map((item) => <AllocationDimensionRow key={item.dimension} item={item} />)}
    </div>
  )
}
