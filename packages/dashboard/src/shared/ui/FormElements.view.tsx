import type { ComponentPropsWithoutRef } from 'react'

import { CHOICE_ROW_VARIANTS, SELECTION_FRAME_STATES } from './fieldAppearance'

export function ChoiceRow({
  variant = 'default',
  ...props
}: Omit<ComponentPropsWithoutRef<'label'>, 'className'> & {
  variant?: keyof typeof CHOICE_ROW_VARIANTS
}) {
  return (
    <label
      {...props}
      className={[CHOICE_ROW_VARIANTS[variant]].filter(Boolean).join(' ')}
    />
  )
}

export function SelectionFrame({
  selected,
  ...props
}: Omit<ComponentPropsWithoutRef<'div'>, 'className'> & { selected: boolean }) {
  return (
    <div
      {...props}
      className={[
        'rounded-lg border text-xs transition-colors',
        SELECTION_FRAME_STATES[selected ? 'active' : 'inactive'],
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function FieldSeparator() {
  return (
    <span aria-hidden="true" className="text-xs text-content-subtle">
      →
    </span>
  )
}

export function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="none"
      className="size-4"
    >
      <path
        d="M3 5h14M5.5 10h9M8 15h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
