import type { ChangeEventHandler } from 'react'

import { CHECKBOX_SIZES } from '@/shared/ui/fieldAppearance/checkboxSizes'

import { useIndeterminateInput } from './services/useIndeterminateInput'

// Needs a ref to set the DOM-only `indeterminate` property.
export function Checkbox({
  checked,
  indeterminate,
  onChange,

  size = 'small',
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: ChangeEventHandler<HTMLInputElement>

  size?: 'small' | 'standard'
}) {
  const ref = useIndeterminateInput(indeterminate)
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={['shrink-0 accent-accent cursor-pointer', CHECKBOX_SIZES[size]]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
