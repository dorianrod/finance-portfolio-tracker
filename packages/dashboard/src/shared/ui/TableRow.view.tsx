import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react'

import {
  getTableRowClassName,
  type TableRowVariant,
} from './tableRowAppearance'

export function TableRowSurface({
  variant,
  dimmed = false,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className'> & {
  variant: TableRowVariant
  dimmed?: boolean
}) {
  return <tr {...props} className={getTableRowClassName(variant, dimmed)} />
}

export function InlineBadge({
  tone,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & {
  tone: 'accent' | 'attention' | 'decorative'
}) {
  const appearance = {
    accent: 'bg-accent-muted text-accent',
    attention: 'bg-attention-muted text-attention',
    decorative: 'bg-decorative-muted text-decorative',
  }[tone]
  return (
    <span
      {...props}
      className={['font-mono text-xs px-1.5 py-0.5 rounded', appearance].join(
        ' ',
      )}
    />
  )
}

export function StripedRow({
  shaded,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className'> & { shaded: boolean }) {
  return (
    <tr
      {...props}
      className={['border-b border-border/50', shaded && 'bg-surface-raised/20']
        .filter(Boolean)
        .join(' ')}
    />
  )
}
