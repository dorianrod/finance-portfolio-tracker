import type { InputHTMLAttributes } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { FIELD_VARIANTS } from '@/shared/ui/fieldAppearance/fieldVariants'

export function Input({
  label,
  variant = 'plain',
  ...props
}: ControlProps<InputHTMLAttributes<HTMLInputElement>> & {
  label: string
  variant?: keyof typeof FIELD_VARIANTS
}) {
  return (
    <input
      {...props}
      aria-label={label}
      className={
        [FIELD_VARIANTS[variant]].filter(Boolean).join(' ') || undefined
      }
    />
  )
}
