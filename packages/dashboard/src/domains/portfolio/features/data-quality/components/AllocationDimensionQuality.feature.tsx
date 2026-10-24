import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/services/actions/useDataQualityClassificationDetails'
import type { DimensionCoverage } from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'

const LABELS: Record<DimensionCoverage['dimension'], string> = {
  geo: i18n.t('ui.allocationdimensionquality.geography'),
  secteur: i18n.t('ui.allocationdimensionquality.sector'),
  currency: i18n.t('ui.allocationdimensionquality.currency'),
  classe: i18n.t('ui.allocationdimensionquality.assetClass'),
}

function AllocationDimensionRow({ item }: { item: DimensionCoverage }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const { openClassificationDetails } = useDataQualityClassificationDetails()
  const total = item.allocated + item.unallocated
  const missingPct = total > 0 ? (item.unallocated / total) * 100 : 0
  const materialGap = hasMaterialQualityGap(missingPct)
  const label = LABELS[item.dimension]

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-xs text-content-muted">{label}</span>
        <span
          className={`shrink-0 text-[11px] tabular-nums ${materialGap ? 'text-warning' : 'text-positive'}`}
        >
          {formatMoney(item.unallocated, { style: 'full' })} ·{' '}
          {formatPercentage(missingPct)}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
        title={i18n.t(
          'ui.allocationdimensionquality.value0NotClassifiedForValue1',
          {
            value0: formatPercentage(missingPct),
            value1: label.toLowerCase(),
          },
        )}
      >
        <div
          className={`h-full rounded-full ${materialGap ? 'bg-warning' : 'bg-positive'}`}
          style={{ width: `${Math.min(100, missingPct)}%` }}
        />
      </div>
      <button
        type="button"
        onClick={() => openClassificationDetails(item.dimension)}
        className="mt-1.5 text-[11px] text-accent hover:text-accent"
      >
        {item.issues.length}{' '}
        {i18n.t('ui.allocationdimensionquality.responsibleAssetsViewDetails')}
      </button>
    </div>
  )
}

export function AllocationDimensionQuality({
  coverage,
}: {
  coverage: DimensionCoverage[]
}) {
  return (
    <div className="space-y-4">
      {coverage.map((item) => (
        <AllocationDimensionRow key={item.dimension} item={item} />
      ))}
    </div>
  )
}
