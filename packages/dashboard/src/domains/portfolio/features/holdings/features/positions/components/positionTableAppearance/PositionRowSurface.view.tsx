import type { ComponentPropsWithoutRef } from 'react'

import { TableRowSurface } from '@/shared/ui/tableRow/TableRowSurface.view'

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
