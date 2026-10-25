// eslint-disable-next-line local/component-role -- This UI service only synchronizes the native checkbox's indeterminate property.
import { useIndeterminateInput } from './services/useIndeterminateInput'

// Needs a ref to set the DOM-only `indeterminate` property.
export function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  className,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  className?: string
}) {
  const ref = useIndeterminateInput(indeterminate)
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className ?? 'w-3.5 h-3.5 accent-accent cursor-pointer'}
    />
  )
}
