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

export const BUTTON_VARIANTS = {
  choice: 'rounded-full border text-xs font-medium transition-colors',
  accentCaptionLink: 'text-xs font-medium text-accent hover:text-accent',
  plainLeft: 'text-left',

  splitAction:
    'rounded-l-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70',
  insetSummary:
    'group overflow-hidden rounded-md bg-canvas/70 text-left text-content transition-colors hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-focus/70',
  period:
    'group text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
  subtlePreview:
    'rounded text-content-subtle transition-colors hover:bg-surface-hover hover:text-accent focus-visible:bg-surface-hover focus-visible:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus',
  preview: 'cursor-help text-left',
  outlinedChoice:
    'cursor-pointer rounded-lg border text-xs font-medium transition-colors',
  appliedFilter:
    'cursor-pointer rounded-full border border-accent bg-accent-solid text-xs text-content transition-colors hover:border-accent hover:bg-accent-solid',
  metricChoice: 'rounded-md text-xs transition-colors',
  compactChoice: 'rounded-md text-[11px] transition-colors',
  optionalCompactChoice:
    'rounded-md text-[11px] transition-colors disabled:cursor-not-allowed disabled:text-content-subtle',
  outlinedFilter: 'rounded-lg border text-xs',
  separatedToggle: 'group border-t border-border text-xs font-medium',
  legend: 'cursor-pointer text-[11px] transition-opacity',

  filterClear:
    'cursor-pointer rounded-lg border border-border-strong text-xs font-medium text-content-muted transition-colors hover:border-border-strong hover:bg-surface-raised hover:text-content-secondary',
  reset: 'text-xs text-content-subtle hover:text-content-secondary',
  tableExpand:
    'rounded-lg border border-border-strong bg-canvas text-xs text-content-secondary transition-colors hover:border-border-strong hover:text-content',
  sort: 'flex cursor-pointer items-center transition-colors hover:text-content-secondary',
  wrappedSort:
    'break-words rounded-control text-content-muted transition-colors hover:text-content-secondary',
  rowDisclosure:
    'rounded-control text-content-muted transition-colors hover:bg-surface-raised hover:text-content',
  primaryCompact:
    'bg-accent-solid font-medium rounded-md text-on-accent text-xs',
  outlinedCompact:
    'border border-border-strong disabled:cursor-not-allowed disabled:opacity-40 rounded-md text-content-secondary text-xs',
  detailToggle:
    'border-border border-t font-medium hover:text-accent text-accent text-xs transition-colors',
  dimensionDetail: 'hover:text-accent text-[11px] text-accent',
  outlinedDetail:
    'border border-border-strong hover:border-border-strong rounded text-content-secondary',

  plain: '',
  secondary:
    'rounded-control border border-border-strong bg-surface text-xs font-medium text-content-muted transition-colors hover:bg-surface-raised hover:text-content-secondary',
  outlined: 'rounded-control border border-border-strong text-content',
  raised:
    'rounded-control border border-border-strong bg-surface-raised text-sm font-medium text-content hover:bg-surface',
  tab: 'border-b-2 text-sm font-medium transition-colors',
  separatedTab:
    'border-b-2 border-l border-l-border text-sm font-medium transition-colors',
  quiet:
    'rounded-md text-xs font-medium text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary',
  text: 'text-xs font-medium text-content-subtle transition-colors hover:text-content-secondary',
  accentLink: 'text-accent hover:text-content',
  filterTag:
    'rounded-full border border-accent bg-accent-muted/35 text-xs text-accent transition-colors hover:bg-accent-muted/55',
  filter: 'rounded-lg border text-sm font-medium transition-colors',
  preset: 'rounded-lg border text-xs transition-colors',
  sectionChoice: 'text-left text-sm transition-colors',
} as const

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

export const NAVIGATION_STATES = {
  tab: {
    active: 'border-accent text-content',
    inactive:
      'border-transparent text-content-subtle hover:text-content-secondary',
  },
  separatedTab: {
    active: 'border-b-accent text-content',
    inactive:
      'border-b-transparent text-content-subtle hover:text-content-secondary',
  },
} as const
