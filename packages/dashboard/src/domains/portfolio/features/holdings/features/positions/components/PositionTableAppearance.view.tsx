import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react'

import { InlineBadge, TableRowSurface } from '@/shared/ui/TableRow.view'

export function PositionRowSurface({
  kind,
  closed,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className' | 'style'> & {
  kind: 'position' | 'group' | 'detail'
  closed: boolean
}) {
  const variants = {
    position: 'interactive',
    group: 'raised',
    detail: 'detail',
  } as const
  return <TableRowSurface {...props} variant={variants[kind]} dimmed={closed} />
}

export function TransactionBadge({
  kind,
  ...props
}: Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'style'> & {
  kind: 'buy' | 'sell' | 'other'
}) {
  const tones = {
    buy: 'accent',
    sell: 'attention',
    other: 'decorative',
  } as const
  return <InlineBadge {...props} tone={tones[kind]} />
}
