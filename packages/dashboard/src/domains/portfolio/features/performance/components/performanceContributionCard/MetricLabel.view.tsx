import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import type { FilterScopeContext } from '@/domains/portfolio/shared/types/filterScopeContext.type'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Text } from '@/shared/ui/Text.view'

export function MetricLabel({
  label,
  tooltip,
  scope,
  scopeContext,
}: {
  label: string
  tooltip: string
  scope: FilterScopeSpec
  scopeContext: FilterScopeContext
}) {
  return (
    <Text as="div" variant="microOverline" tone="subtle">
      <Inline as="div" align="center">
        <span>{label}</span>
        <InfoTooltip text={tooltip}>
          <InfoTooltip.Footer>
            <FilterScopePresentation
              scope={scope}
              scopeContext={scopeContext}
            />
          </InfoTooltip.Footer>
        </InfoTooltip>
      </Inline>
    </Text>
  )
}
