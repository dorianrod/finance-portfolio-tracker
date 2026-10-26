export const CHECKBOX_SIZES = {
  small: 'w-3.5 h-3.5',
  standard: 'w-4 h-4',
} as const

export const FIELD_VARIANTS = {
  canvasSearch:
    'w-full px-3 py-2 rounded-lg border border-border-strong bg-canvas text-sm text-content-secondary outline-none focus:border-accent',
  canvasSelect:
    'w-full px-3 py-2.5 rounded-lg border border-border-strong bg-canvas text-sm text-content-secondary',
  stacked:
    'w-full px-2.5 py-2 rounded-lg border border-border-strong bg-surface text-sm text-content-secondary focus:border-accent focus:outline-none',
  compact:
    'w-full px-2 py-1 rounded border border-border-strong bg-surface-raised text-xs text-content-secondary focus:border-border-strong focus:outline-none',
  timeline: 'accent-accent',

  plain: '',
  filter:
    'w-full p-2 bg-surface-raised border border-border-strong text-content-secondary text-xs rounded-lg focus:outline-none focus:border-accent',
} as const

export const CHOICE_ROW_VARIANTS = {
  default: 'cursor-pointer hover:bg-surface-hover',
  nested: 'cursor-pointer hover:bg-surface-raised/80',
  card: 'cursor-pointer rounded-lg border border-border-strong bg-canvas/35',
} as const

export const SELECTION_FRAME_STATES = {
  active: 'border-accent bg-accent-muted/40 text-accent',
  inactive:
    'border-border-strong bg-surface-raised text-content-muted hover:border-border-strong hover:text-content-secondary',
} as const
