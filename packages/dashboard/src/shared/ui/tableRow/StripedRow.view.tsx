import type { ComponentPropsWithoutRef } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'

export function StripedRow({
  shaded,
  ...props
}: ControlProps<ComponentPropsWithoutRef<'tr'>> & {
  shaded: boolean
}) {
  return (
    <tr
      {...props}
      className={['border-b border-border/50', shaded && 'bg-surface-raised/20']
        .filter(Boolean)
        .join(' ')}
    />
  )
}
