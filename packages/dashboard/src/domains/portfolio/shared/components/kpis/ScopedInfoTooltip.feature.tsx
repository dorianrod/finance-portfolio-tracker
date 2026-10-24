import {
  FilterScopeBadges,
  type FilterScopeSpec,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'

import { InfoTooltip } from './InfoTooltip.view'

export function ScopedInfoTooltip({
  text,
  scope,
}: {
  text: string
  scope?: FilterScopeSpec
}) {
  return (
    <InfoTooltip text={text}>
      {scope && (
        <InfoTooltip.Footer>
          <FilterScopeBadges {...scope} />
        </InfoTooltip.Footer>
      )}
    </InfoTooltip>
  )
}
