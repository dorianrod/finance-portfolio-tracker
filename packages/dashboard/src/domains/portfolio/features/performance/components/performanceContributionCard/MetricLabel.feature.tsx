import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Text } from '@/shared/ui/Text.view'

export function MetricLabel({
  label,
  tooltip,
  scope,
}: {
  label: string
  tooltip: string
  scope: FilterScopeSpec
}) {
  return (
    <Text as="div" variant="microOverline" tone="subtle">
      <Inline as="div" align="center">
        <span>{label}</span>
        <ScopedInfoTooltip text={tooltip} scope={scope} />
      </Inline>
    </Text>
  )
}
