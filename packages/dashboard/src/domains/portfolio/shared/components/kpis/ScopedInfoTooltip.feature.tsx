import type { ReactNode } from 'react'

import {
  FilterScopeBadges,
  type FilterScopeSpec,
} from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'

import { InfoTooltip } from './InfoTooltip.view'

export function ScopedInfoTooltip({
  text,
  scope,
}: {
  text: ReactNode
  scope?: FilterScopeSpec
}) {
  return (
    <InfoTooltip
      text={text}
      footer={scope ? <FilterScopeBadges {...scope} /> : undefined}
    />
  )
}
