import type { ComponentPropsWithoutRef } from 'react'

export function StripedRow({
  shaded,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className'> & { shaded: boolean }) {
  return (
    <tr
      {...props}
      className={['border-b border-border/50', shaded && 'bg-surface-raised/20']
        .filter(Boolean)
        .join(' ')}
    />
  )
}
