import { DATA_QUALITY_DIMENSION_LABELS } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/dataQualityDimensionLabels'
import { type AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualityViewModel'
import { Surface } from '@/shared/ui/Surface.view'

export function AffectedDimensionBadge({
  dimension,
}: {
  dimension: AffectedAsset['dimensions'][number]
}) {
  return (
    <Surface as="span" variant="quietChip" tone="muted">
      {DATA_QUALITY_DIMENSION_LABELS[dimension]}
    </Surface>
  )
}
