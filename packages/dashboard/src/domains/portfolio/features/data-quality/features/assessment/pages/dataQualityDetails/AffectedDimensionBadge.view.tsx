import { useFormatDataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatDataQualityDimension'
import type { AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/types/affectedAsset.type'
import { Surface } from '@/shared/ui/Surface.view'

export function AffectedDimensionBadge({
  dimension,
}: {
  dimension: AffectedAsset['dimensions'][number]
}) {
  const formatDimension = useFormatDataQualityDimension()
  return (
    <Surface as="span" variant="quietChip" tone="muted">
      {formatDimension(dimension)}
    </Surface>
  )
}
