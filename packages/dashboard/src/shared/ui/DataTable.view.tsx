import type { ComponentPropsWithoutRef } from 'react'

import { DATA_CELL_VARIANTS } from './dataTableAppearance'
import { TEXT_TONES, type TextTone } from './textAppearance'

export function DataCell({
  variant = 'body',
  tone,
  align,
  numeric = false,
  ...props
}: Omit<ComponentPropsWithoutRef<'td'>, 'className'> & {
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

export function TableColumn({
  kind = 'value',
}: {
  kind?: keyof typeof COLUMN_WIDTHS
}) {
  return <col style={{ width: COLUMN_WIDTHS[kind] }} />
}

const COLUMN_WIDTHS = {
  expander: '28px',
  label: '27%',
  value: '9%',
  compact: '8%',
  description: '40%',
} as const
