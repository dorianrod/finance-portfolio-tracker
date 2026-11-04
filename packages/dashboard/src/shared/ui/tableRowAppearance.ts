export function getTableRowClassName(
  variant: TableRowVariant,
  dimmed: boolean,
) {
  return [
    'border-b border-border transition-colors',
    dimmed && 'opacity-40 hover:opacity-70',
    ROW_SURFACES[variant][dimmed ? 'dimmed' : 'normal'],
  ]
    .filter(Boolean)
    .join(' ')
}

const ROW_SURFACES = {
  interactive: {
    normal: 'cursor-pointer bg-surface hover:bg-surface-raised',
    dimmed: 'cursor-pointer bg-canvas',
  },
  raised: {
    normal: 'bg-surface-raised cursor-pointer hover:bg-surface-raised',
    dimmed: 'cursor-pointer bg-canvas',
  },
  detail: { normal: 'bg-canvas', dimmed: 'bg-canvas' },
} as const

export type TableRowVariant = keyof typeof ROW_SURFACES
