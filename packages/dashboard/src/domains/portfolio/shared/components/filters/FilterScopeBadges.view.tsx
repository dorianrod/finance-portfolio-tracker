import { CompactBadge } from '@/shared/ui/StatusBadge.view'

import { type ScopeBadge as ScopeBadgeData } from './helpers/presenters/buildFilterScopeBadges'

export function FilterScopeBadge({ badge }: { badge: ScopeBadgeData }) {
  const tones = {
    applied: 'accent',
    ignored: 'warning',
    default: 'default',
  } as const
  return (
    <CompactBadge title={badge.detail} tone={tones[badge.tone]}>
      {badge.label}
    </CompactBadge>
  )
}
