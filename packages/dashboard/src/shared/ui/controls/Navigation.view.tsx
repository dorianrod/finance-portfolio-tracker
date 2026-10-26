import type { ContentProps } from './controls.types'

export function Navigation({
  label,
  variant = 'plain',
  ...props
}: ContentProps & { label: string; variant?: 'plain' | 'tabs' }) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={
        [variant === 'tabs' && 'border-b border-border']
          .filter(Boolean)
          .join(' ') || undefined
      }
    />
  )
}
