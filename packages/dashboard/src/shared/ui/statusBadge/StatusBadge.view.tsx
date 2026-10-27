import type { ComponentPropsWithoutRef } from 'react'

export function StatusBadge({
  tone,
  ...props
}: Omit<ComponentPropsWithoutRef<'span'>, 'className' | 'style'> & {
  tone: keyof typeof STATUS_TONES
}) {
  return (
    <span
      {...props}
      className={[
        'rounded-full border text-[10px] font-semibold',
        STATUS_TONES[tone],
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

const STATUS_TONES = {
  positive: 'border-positive bg-positive-muted/40 text-positive',
  warning: 'border-warning bg-warning-muted/40 text-warning',
  negative: 'border-danger bg-danger-muted/40 text-danger',
} as const
