import { type ScopeBadge } from './helpers/presenters/buildFilterScopeBadges'

const TONE_CLASSES = {
  applied: 'border-accent/70 bg-accent-muted/60 text-accent',
  default: 'border-border-strong bg-canvas/45 text-content-subtle',
  ignored: 'border-warning/60 bg-warning-muted/35 text-warning',
} as const

export function FilterScopeBadge({ badge }: { badge: ScopeBadge }) {
  return (
    <span
      title={badge.detail}
      className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal ${TONE_CLASSES[badge.tone]}`}
    >
      {badge.label}
    </span>
  )
}
