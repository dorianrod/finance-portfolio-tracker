import { getButtonClassName } from '@/shared/ui/buttonAppearance/getButtonClassName'
import { NAVIGATION_STATES } from '@/shared/ui/buttonAppearance/navigationStates'
import { BUTTON_SIZES } from '@/shared/ui/layoutAppearance/buttonSizes'

import type { ButtonProps } from './controls.types'

// eslint-disable-next-line complexity -- reviewed: 2026-10-27; Selected appearance and current-page accessibility state belong to the same navigation button.
export function NavigationButton({
  active,
  onIntent,
  label,
  variant = 'plain',
  selected = false,
  size = 'default',
  ...props
}: ButtonProps & { active: boolean }) {
  const stateClass =
    variant === 'tab' || variant === 'separatedTab'
      ? NAVIGATION_STATES[variant][active ? 'active' : 'inactive']
      : undefined
  return (
    <button
      {...props}
      type="button"
      className={
        [
          getButtonClassName(variant, selected),
          BUTTON_SIZES[size],
          'gap-2',
          stateClass,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onFocus={onIntent}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        onIntent?.()
      }}
    />
  )
}
