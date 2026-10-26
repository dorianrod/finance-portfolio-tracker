import type { ButtonHTMLAttributes, ReactNode } from 'react'

import type { ControlProps } from './controlProps'
import { BUTTON_SIZES } from './layoutAppearance'

export function SegmentedControl({
  label,
  children,
  density = 'default',
}: {
  label: string
  children: ReactNode
  density?: 'compact' | 'default'
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex max-w-full rounded-control border border-border bg-surface ${density === 'compact' ? 'p-0.5' : 'p-1'} `}
    >
      {children}
    </div>
  )
}

export function SegmentedControlItem({
  active,
  children,
  size = 'default',
  tone = 'accent',

  type = 'button',
  ...props
}: ControlProps<ButtonHTMLAttributes<HTMLButtonElement>> & {
  active: boolean
  size?: SegmentedControlSize
  tone?: SegmentedControlTone
}) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`shrink-0 rounded-control font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${BUTTON_SIZES[size]} ${active ? ACTIVE_CLASSES[tone] : 'text-content-subtle hover:bg-surface-raised hover:text-content-secondary'} `}
      {...props}
    >
      {children}
    </button>
  )
}

type SegmentedControlSize = 'compact' | 'default' | 'large'
type SegmentedControlTone = 'accent' | 'neutral'

const ACTIVE_CLASSES: Record<SegmentedControlTone, string> = {
  accent: 'bg-accent-solid text-on-accent shadow-sm',
  neutral: 'bg-surface-hover text-content shadow-sm',
}
