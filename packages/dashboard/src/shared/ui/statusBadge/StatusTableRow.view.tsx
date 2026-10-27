import type { ComponentPropsWithoutRef } from 'react'

export function StatusTableRow({
  level,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className' | 'style'> & {
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
