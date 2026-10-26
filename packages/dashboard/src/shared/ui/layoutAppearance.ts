/** Shared layout vocabulary: callers choose structure, never CSS strings. */
export const LAYOUT_GAPS = {
  none: 'gap-0',
  compact: 'gap-1',
  default: 'gap-2',
  comfortable: 'gap-3',
  relaxed: 'gap-4',
  spacious: 'gap-6',
} as const
export const LAYOUT_INSETS = {
  none: '',
  compact: 'p-2',
  default: 'p-4',
  spacious: 'p-6',
} as const
export const LAYOUT_BEFORE = {
  none: '',
  compact: 'mt-1',
  default: 'mt-3',
  spacious: 'mt-6',
} as const
export const LAYOUT_AFTER = {
  none: '',
  compact: 'mb-1',
  default: 'mb-3',
  spacious: 'mb-6',
} as const
export const LAYOUT_WIDTHS = {
  full: 'w-full',
  half: 'w-1/2',
  content: 'w-fit',
  reading: 'max-w-prose',
  compactReading: 'max-w-sm',
  wide: 'w-96 max-w-full',
  icon: 'w-4',
  indicator: 'w-2',
  divider: 'w-px',
} as const
export const LAYOUT_HEIGHTS = {
  full: 'h-full',
  chart: 'h-72',
  miniChart: 'h-40',
  icon: 'h-4',
  indicator: 'h-2',
  track: 'h-1.5',
  connector: 'h-10',
  branchConnector: 'h-8',
  shortConnector: 'h-6',
  divider: 'h-px',
  marker: 'h-3',
} as const
export const LAYOUT_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
} as const
export const LAYOUT_PRESETS = {
  labelTwoValues: 'grid-cols-[minmax(0,1fr)_4rem_6rem]',
  labelThreeValues: 'grid-cols-[minmax(0,1fr)_6rem_5rem_5rem]',
  sidebar: 'grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)]',
  comparison: 'grid-cols-2',
  pairSmall: 'grid-cols-1 sm:grid-cols-2',
  pairLarge: 'grid-cols-1 lg:grid-cols-2',
  thirdsSmall: 'grid-cols-1 sm:grid-cols-3',
  thirdsMedium: 'grid-cols-1 md:grid-cols-3',
  quartersMedium: 'grid-cols-1 md:grid-cols-4',
} as const
export const LAYOUT_ALIGNMENTS = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
} as const
export const LAYOUT_JUSTIFICATION = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const
export const LAYOUT_FLOWS = {
  block: 'block',
  inline: 'inline-block',
  row: 'flex',
  responsiveRow: 'flex flex-col sm:flex-row',
  control: 'inline-grid min-w-0',
  column: 'flex flex-col',
  grid: 'grid',
  inlineGrid: 'inline-grid',
  wrap: 'flex flex-wrap',
} as const
export const LAYOUT_SIZING = {
  content: 'w-fit',
  fill: 'size-full',
  flexible: 'min-w-0 flex-1',
  fixed: 'shrink-0',
} as const
export const LAYOUT_OVERFLOW = {
  auto: 'overflow-auto',
  scroll: 'overflow-y-auto',
  clip: 'overflow-hidden',
} as const
export const LAYOUT_PLACEMENTS = {
  leading: 'mr-auto',
  trailing: 'ml-auto',
  overlay: 'absolute inset-0',
  inset: 'relative',
  centered: 'mx-auto',
  centeredRelative: 'relative mx-auto',
} as const
export const LAYOUT_RESPONSIVENESS = {
  small: 'hidden sm:block',
  medium: 'hidden md:block',
  large: 'hidden lg:block',
} as const
export const BUTTON_SIZES = {
  compact: 'px-2 py-1 text-[11px]',
  default: 'px-3 py-1.5 text-xs',
  large: 'px-3 py-2 text-sm',
} as const
export const TOOLTIP_SIZES = {
  compact: 'w-56',
  default: 'w-72',
  wide: 'w-96',
} as const

export const TOOLTIP_DENSITIES = {
  compact: 'p-2',
  default: 'px-3 py-2',
  spacious: 'p-4',
} as const
export const PREVIEW_SIZES = {
  compact: 'w-[min(480px,calc(100vw-2rem))]',
  default: 'w-[min(560px,calc(100vw-2rem))]',
  wide: 'w-[min(640px,calc(100vw-2rem))]',
} as const

export const SWATCH_SIZES = {
  compact: 'inline-block size-1.5 shrink-0',
  default: 'inline-block size-2 shrink-0',
  large: 'inline-block size-3 shrink-0',
} as const

export const TREE_CONNECTOR_POSITIONS = {
  stem: 'absolute left-1/2 top-0 h-5 w-px',
  bridge: 'absolute left-[16.667%] right-[16.667%] top-5 h-px',
  pairBridge: 'absolute left-1/4 right-1/4 top-5 h-px',
  left: 'absolute bottom-0 left-[16.667%] top-5 w-px',
  center: 'absolute bottom-0 left-1/2 top-5 w-px',
  right: 'absolute bottom-0 left-[83.333%] top-5 w-px',
  pairLeft: 'absolute bottom-0 left-1/4 top-5 w-px',
  pairRight: 'absolute bottom-0 left-3/4 top-5 w-px',
} as const

export const LAYOUT_HIDDEN_FROM = {
  small: 'sm:hidden',
  medium: 'md:hidden',
  large: 'lg:hidden',
} as const
