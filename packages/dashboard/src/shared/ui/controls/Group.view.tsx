import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'

import type { ContentProps } from './controls.types'

export function Group({
  label,
  variant,
  ...props
}: ContentProps & { label: string; variant?: keyof typeof SURFACE_VARIANTS }) {
  return (
    <div
      {...props}
      className={['size-full', variant && SURFACE_VARIANTS[variant]]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={label}
    />
  )
}
