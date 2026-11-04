const GROUP_CELL =
  'px-3 py-1.5 text-xs bg-surface-raised border-t-2 border-border-strong border-b border-border-strong'

export const DATA_CELL_VARIANTS = {
  body: '',
  group: GROUP_CELL,
  groupLabel: `${GROUP_CELL} font-semibold uppercase tracking-widest text-content-muted`,
  groupValue: `${GROUP_CELL} font-medium text-content-secondary`,
} as const
