import type { ChangeEventHandler } from 'react'

import { CHECKBOX_SIZES } from './fieldAppearance'
import { useIndeterminateInput } from './services/useIndeterminateInput'

// Needs a ref to set the DOM-only `indeterminate` property.
export function Checkbox({
  checked,
  indeterminate,
  onChange,
  className,
  size = 'small',
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>
  className?: string
  size?: 'small' | 'standard'
}) {
  const ref = useIndeterminateInput(indeterminate)
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={[
        'accent-accent cursor-pointer',
        CHECKBOX_SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
