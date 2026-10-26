import type { ComponentPropsWithoutRef } from 'react'

const STATUS_TONES = {
  positive: 'border-positive bg-positive-muted/40 text-positive',
  warning: 'border-warning bg-warning-muted/40 text-warning',
  negative: 'border-danger bg-danger-muted/40 text-danger',
} as const
const SCOPE_TONES = {
  applied: 'border-accent/70 bg-accent-muted/60 text-accent',
  default: 'border-border-strong bg-canvas/45 text-content-subtle',
  ignored: 'border-warning/60 bg-warning-muted/35 text-warning',
} as const
const LEVEL_TONES = {
  error: 'bg-danger-muted/60 text-danger',
  warning: 'bg-warning-muted/60 text-warning',
  muted: 'bg-surface-raised text-content-muted',
} as const
export function ReliabilityBadge({
  tone,
  ...props
}: Omit<ComponentPropsWithoutRef<'span'>, 'className'> & {
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
const SCOPE_BASE =
  'inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal'
const LEVEL_BASE = 'inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold'
export function ScopeBadge({
  tone,
  ...props
}: Omit<ComponentPropsWithoutRef<'span'>, 'className'> & {
  tone: keyof typeof SCOPE_TONES
}) {
  return (
    <span
      {...props}
      className={[SCOPE_BASE, SCOPE_TONES[tone]].filter(Boolean).join(' ')}
    />
  )
}
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
export function StatusTableRow({
  level,
  ...props
}: Omit<ComponentPropsWithoutRef<'tr'>, 'className'> & {
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
