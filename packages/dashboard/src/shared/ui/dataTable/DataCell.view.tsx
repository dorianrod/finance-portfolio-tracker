import type { ComponentPropsWithoutRef } from 'react'

import { DATA_CELL_VARIANTS } from '@/shared/ui/dataTableAppearance'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

export function DataCell({
  variant = 'body',
  tone,
  align,
  numeric = false,
  ...props
}: Omit<ComponentPropsWithoutRef<'td'>, 'className' | 'style'> & {
  variant?: keyof typeof DATA_CELL_VARIANTS
  tone?: TextTone
  align?: 'left' | 'right'
  numeric?: boolean
}) {
  return (
    <td
      {...props}
      className={[
        DATA_CELL_VARIANTS[variant],
        tone && TEXT_TONES[tone],
        align === 'right' && 'text-right',
        numeric && 'tabular-nums',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
