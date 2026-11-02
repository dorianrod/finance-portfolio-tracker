import { getButtonClassName } from '@/shared/ui/buttonAppearance/getButtonClassName'
import { getNavigationStateClass } from '@/shared/ui/buttonAppearance/getNavigationStateClass'
import { BUTTON_SIZES } from '@/shared/ui/layoutAppearance/buttonSizes'

import type { ButtonProps } from './controls.types'

export function NavigationButton({
  active,
  onIntent,
  label,
  variant = 'plain',
  selected = false,
  size = 'default',
  ...props
}: ButtonProps & { active: boolean }) {
  return (
    <button
      {...props}
      type="button"
      className={
        [
          getButtonClassName(variant, selected),
          BUTTON_SIZES[size],
          'gap-2',
          getNavigationStateClass(variant, active),
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onFocus={onIntent}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        if (event.defaultPrevented) return
        onIntent?.()
      }}
    />
  )
}
