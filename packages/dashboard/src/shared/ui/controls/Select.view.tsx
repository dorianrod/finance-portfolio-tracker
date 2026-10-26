import type { SelectHTMLAttributes } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { FIELD_VARIANTS } from '@/shared/ui/fieldAppearance/fieldVariants'

export function Select({
  label,
  variant = 'plain',
  ...props
}: ControlProps<SelectHTMLAttributes<HTMLSelectElement>> & {
  label: string
  variant?: keyof typeof FIELD_VARIANTS
}) {
  return (
    <select
      {...props}
      aria-label={label}
      className={
        [FIELD_VARIANTS[variant]].filter(Boolean).join(' ') || undefined
      }
    />
  )
}
