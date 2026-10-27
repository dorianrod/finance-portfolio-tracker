import type { ComponentPropsWithoutRef } from 'react'

export function CompactBadge({
  tone,
  ...props
}: Omit<ComponentPropsWithoutRef<'span'>, 'className' | 'style'> & {
  tone: keyof typeof COMPACT_TONES
}) {
  return (
    <span
      {...props}
      className={[COMPACT_BASE, COMPACT_TONES[tone]].filter(Boolean).join(' ')}
    />
  )
}

const COMPACT_TONES = {
  accent: 'border-accent/70 bg-accent-muted/60 text-accent',
  default: 'border-border-strong bg-canvas/45 text-content-subtle',
  warning: 'border-warning/60 bg-warning-muted/35 text-warning',
} as const

const COMPACT_BASE =
  'inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal'
