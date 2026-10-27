import type { ComponentPropsWithoutRef } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import {
  getTableRowClassName,
  type TableRowVariant,
} from '@/shared/ui/tableRowAppearance'

export function TableRowSurface({
  variant,
  dimmed = false,
  ...props
}: ControlProps<ComponentPropsWithoutRef<'tr'>> & {
  variant: TableRowVariant
  dimmed?: boolean
}) {
  return <tr {...props} className={getTableRowClassName(variant, dimmed)} />
}
