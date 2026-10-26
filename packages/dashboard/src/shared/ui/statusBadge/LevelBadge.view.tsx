import type { ComponentPropsWithoutRef } from 'react'

export function LevelBadge({
  level,
  ...props
}: Omit<ComponentPropsWithoutRef<'span'>, 'className'> & {
  level: keyof typeof LEVEL_TONES
}) {
  return (
    <span
      {...props}
      className={[LEVEL_BASE, LEVEL_TONES[level]].filter(Boolean).join(' ')}
    />
  )
}

const LEVEL_TONES = {
  error: 'bg-danger-muted/60 text-danger',
  warning: 'bg-warning-muted/60 text-warning',
  muted: 'bg-surface-raised text-content-muted',
} as const

const LEVEL_BASE = 'inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold'
