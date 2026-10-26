import type { ComponentPropsWithoutRef } from 'react'

import { DATA_CELL_VARIANTS } from './dataTableAppearance'
import { TEXT_TONES, type TextTone } from './textAppearance'

export function DataCell({
  variant = 'body',
  tone,
  className,
  ...props
}: ComponentPropsWithoutRef<'td'> & {
  variant?: keyof typeof DATA_CELL_VARIANTS
  tone?: TextTone
}) {
  return (
    <td
      {...props}
      className={[
        DATA_CELL_VARIANTS[variant],
        tone && TEXT_TONES[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
