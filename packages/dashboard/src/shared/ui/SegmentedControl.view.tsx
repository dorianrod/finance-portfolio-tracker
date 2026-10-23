import i18n from '@/i18n/i18n'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type SegmentedControlSize = 'compact' | 'default' | 'large'
type SegmentedControlTone = 'accent' | 'neutral'

const SIZE_CLASSES: Record<SegmentedControlSize, string> = {
  compact: 'px-2 py-1 text-[11px]',
  default: i18n.t('ui.segmentedcontrol.px3Py15TextXs'),
  large: 'px-3 py-2 text-sm',
}

const ACTIVE_CLASSES: Record<SegmentedControlTone, string> = {
  accent: 'bg-accent-solid text-on-accent shadow-sm',
  neutral: 'bg-surface-hover text-content shadow-sm',
}

export function SegmentedControl({
  label,
  children,
  density = 'default',
  className = '',
}: {
  label: string
  children: ReactNode
  density?: 'compact' | 'default'
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex max-w-full rounded-control border border-border bg-surface ${density === 'compact' ? i18n.t('ui.segmentedcontrol.p05') : 'p-1'} ${className}`}
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
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean
  size?: SegmentedControlSize
  tone?: SegmentedControlTone
}) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`shrink-0 rounded-control font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${SIZE_CLASSES[size]} ${active ? ACTIVE_CLASSES[tone] : 'text-content-subtle hover:bg-surface-raised hover:text-content-secondary'} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
