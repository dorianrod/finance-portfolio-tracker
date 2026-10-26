import { ScopeBadge } from '@/shared/ui/StatusBadge.view'

import { type ScopeBadge as ScopeBadgeData } from './helpers/presenters/buildFilterScopeBadges'

export function FilterScopeBadge({ badge }: { badge: ScopeBadgeData }) {
  return (
    <ScopeBadge title={badge.detail} tone={badge.tone}>
      {badge.label}
    </ScopeBadge>
  )
}
