import type { ButtonHTMLAttributes } from 'react'

import { getButtonClassName } from '@/shared/ui/buttonAppearance/getButtonClassName'
import { BUTTON_SIZES } from '@/shared/ui/layoutAppearance/buttonSizes'

import type { ButtonProps } from './controls.types'

export function Button({
  label,
  onIntent,
  type = 'button',
  variant = 'plain',
  selected = false,
  dimmed = false,
  size = 'default',
  ...props
}: ButtonProps) {
  const nativeProps = props as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className'
  >
  return (
    <button
      {...props}
      type={type}
      className={[
        getButtonClassName(variant, selected),
        BUTTON_SIZES[size],
        'gap-2',
        dimmed && 'opacity-[0.35]',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label ?? nativeProps['aria-label']}
      onFocus={(event) => {
        nativeProps.onFocus?.(event)
        onIntent?.()
      }}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        onIntent?.()
      }}
    />
  )
}
