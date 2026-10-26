export const BADGE_BASE =
  'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold'

export const BADGE_TONES = {
  positive: 'border-positive bg-positive-muted/60 text-positive',
  accent: 'border-accent bg-accent-muted/60 text-accent',
  warning: 'border-warning bg-warning-muted/60 text-warning',
  negative: 'border-danger bg-danger-muted/60 text-danger',
} as const

export const COUNT_BADGE_TONES = {
  negative: 'bg-danger-muted/60 text-danger',
  warning: 'bg-warning-muted/60 text-warning',
} as const

export const DELTA_VARIANTS = {
  summary:
    'inline-flex items-center gap-1 rounded-full bg-canvas/55 px-2 py-1 text-[11px] font-semibold tabular-nums',
  inline:
    'inline-flex rounded-full bg-canvas/55 px-1.5 py-0.5 font-semibold tabular-nums',
} as const
