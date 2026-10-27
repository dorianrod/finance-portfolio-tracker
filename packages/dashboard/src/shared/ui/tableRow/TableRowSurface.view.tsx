import type { ComponentPropsWithoutRef } from 'react'

import {
  getTableRowClassName,
  type TableRowVariant,
} from '@/shared/ui/tableRowAppearance'

export function TableRowSurface({
  variant,
  dimmed = false,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className' | 'style'> & {
  variant: TableRowVariant
  dimmed?: boolean
}) {
  return <tr {...props} className={getTableRowClassName(variant, dimmed)} />
}
