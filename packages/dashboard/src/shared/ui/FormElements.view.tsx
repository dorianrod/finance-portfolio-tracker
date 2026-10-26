import type { ComponentPropsWithoutRef } from 'react'

import { Decorative, DecorativeSvg } from './Controls.view'
import { CHOICE_ROW_VARIANTS, SELECTION_FRAME_STATES } from './fieldAppearance'

export function ChoiceRow({
  variant = 'default',
  className,
  ...props
}: ComponentPropsWithoutRef<'label'> & {
  variant?: keyof typeof CHOICE_ROW_VARIANTS
}) {
  return (
    <label
      {...props}
      className={[CHOICE_ROW_VARIANTS[variant], className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function SelectionFrame({
  selected,
  className,
  ...props
}: ComponentPropsWithoutRef<'div'> & { selected: boolean }) {
  return (
    <div
      {...props}
      className={[
        'rounded-lg border text-xs transition-colors',
        SELECTION_FRAME_STATES[selected ? 'active' : 'inactive'],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function FieldSeparator() {
  return <Decorative className="text-xs text-content-subtle">→</Decorative>
}

export function FilterIcon({ className }: { className?: string }) {
  return (
    <DecorativeSvg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M3 5h14M5.5 10h9M8 15h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </DecorativeSvg>
  )
}
