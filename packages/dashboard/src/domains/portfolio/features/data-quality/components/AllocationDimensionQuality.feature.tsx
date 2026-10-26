import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/services/actions/useDataQualityClassificationDetails'
import type { DimensionCoverage } from '@/domains/portfolio/shared/helpers/quality/computeAllocationCoverage'
import { hasMaterialQualityGap } from '@/domains/portfolio/shared/helpers/quality/qualityThresholds'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/Controls.view'
import { Surface } from '@/shared/ui/Surface.view'
import { ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

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
        <Text variant="caption" tone="muted" truncate>
          {label}
        </Text>
        <Text
          variant="micro"
          numeric
          tone={materialGap ? 'warning' : 'positive'}
          className="shrink-0"
        >
          {formatMoney(item.unallocated, { style: 'full' })} ·{' '}
          {formatPercentage(missingPct)}
        </Text>
      </div>
      <Surface
        variant="track"
        className="h-1.5 overflow-hidden"
        title={i18n.t(
          'ui.allocationdimensionquality.value0NotClassifiedForValue1',
          {
            value0: formatPercentage(missingPct),
            value1: label.toLowerCase(),
          },
        )}
      >
        <ToneSwatch
          as="div"
          shape="dot"
          tone={materialGap ? 'warning' : 'positive'}
          className="h-full"
          style={{ width: `${Math.min(100, missingPct)}%` }}
        />
      </Surface>
      <Button
        type="button"
        onClick={() => openClassificationDetails(item.dimension)}
        variant="dimensionDetail"
        className="mt-1.5"
      >
        {i18n.t('ui.allocationdimensionquality.responsibleAssetCount', {
          count: item.issues.length,
        })}
      </Button>
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
