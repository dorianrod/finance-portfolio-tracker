export const SWATCH_SHAPES = {
  dot: 'rounded-full',
  sideAccent: 'rounded-r-full',
  softDot: 'rounded',
  marker:
    'rounded-full bg-content-secondary shadow-[0_0_0_1px_var(--color-gray-900)]',
  bar: 'rounded-sm',
  line: '',
  centeredLine: 'align-middle',
} as const

export const SWATCH_TONES = {
  default: 'bg-content',
  secondary: 'bg-content-secondary',
  muted: 'bg-content-muted',
  subtle: 'bg-content-subtle',
  accent: 'bg-accent',
  positive: 'bg-positive',
  negative: 'bg-danger',
  warning: 'bg-warning',
  decorative: 'bg-decorative',
  attention: 'bg-attention',
  highlight: 'bg-highlight',
  contrast: 'bg-contrast',
  secondarySeries: 'bg-secondary-series',
} as const
