import { BUTTON_VARIANTS } from './buttonVariants'

export function getButtonClassName(
  variant: keyof typeof BUTTON_VARIANTS,
  selected = false,
) {
  const selection =
    variant in BUTTON_SELECTION_STATES
      ? BUTTON_SELECTION_STATES[
          variant as keyof typeof BUTTON_SELECTION_STATES
        ][selected ? 'active' : 'inactive']
      : undefined
  return (
    [
      'inline-flex items-center justify-center',
      BUTTON_VARIANTS[variant],
      selection,
    ]
      .filter(Boolean)
      .join(' ') || undefined
  )
}

const BUTTON_SELECTION_STATES = {
  choice: {
    active: 'border-accent-solid bg-accent-solid text-on-accent',
    inactive:
      'border-border-strong bg-surface-raised text-content-muted hover:bg-surface-hover hover:text-content-secondary',
  },
  outlinedChoice: {
    active: 'border-accent bg-accent-solid text-content',
    inactive:
      'border-border-strong text-content-muted hover:border-border-strong hover:bg-surface-raised hover:text-content-secondary',
  },
  metricChoice: {
    active: 'bg-surface-hover text-content',
    inactive: 'text-content-subtle hover:text-content-secondary',
  },
  compactChoice: {
    active: 'bg-surface-hover text-content',
    inactive: 'text-content-subtle hover:text-content-secondary',
  },
  optionalCompactChoice: {
    active: 'bg-surface-hover text-content',
    inactive: 'text-content-subtle hover:text-content-secondary',
  },
  outlinedFilter: {
    active: 'border-accent bg-accent-muted/50 text-accent',
    inactive:
      'border-border-strong text-content-subtle hover:text-content-secondary',
  },

  filter: {
    active:
      'border-accent bg-accent-muted/30 text-accent hover:bg-accent-muted/45',
    inactive:
      'border-border-strong bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary',
  },
  preset: {
    active: 'border-accent bg-accent-muted/40 text-accent',
    inactive:
      'border-border-strong text-content-muted hover:border-border-strong hover:text-content-secondary',
  },
  sectionChoice: {
    active: 'bg-accent-muted/35 text-accent',
    inactive: 'text-content-secondary hover:bg-surface-raised',
  },
} as const
