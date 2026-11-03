export const CHOICE_ROW_VARIANTS = {
  default:
    'flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-surface-hover',
  nested:
    'flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-surface-raised/80',
  treeItem:
    'flex items-center gap-2 py-1.5 pl-8 pr-3 cursor-pointer hover:bg-surface-raised/80',
  selectItem:
    'flex items-center gap-2 py-1 pl-7 pr-3 cursor-pointer hover:bg-surface-hover',
  card: 'flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer rounded-lg border border-border-strong bg-canvas/35',
} as const
