import type { ComponentPropsWithoutRef } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'

export function StatusTableRow({
  level,
  ...props
}: ControlProps<ComponentPropsWithoutRef<'tr'>> & {
  level: 'error' | 'warning'
}) {
  return (
    <tr
      {...props}
      className={[
        'border-b border-border/50',
        level === 'error'
          ? 'bg-danger-muted/20 hover:bg-danger-muted/30'
          : 'bg-warning-muted/10 hover:bg-warning-muted/20',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
