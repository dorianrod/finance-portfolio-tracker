import type { ContentProps } from './controls.types'

export function Progress({
  label,
  value,
  variant,
  ...props
}: ContentProps & { label: string; value: number; variant?: 'track' }) {
  return (
    <div
      {...props}
      className={[
        'size-full',
        variant === 'track' && 'rounded-full bg-surface-raised',
      ]
        .filter(Boolean)
        .join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    />
  )
}
