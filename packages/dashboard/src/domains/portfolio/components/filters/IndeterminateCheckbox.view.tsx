import { useEffect, useRef } from 'react'

// Needs a ref to set the DOM-only `indeterminate` property.
export function IndeterminateCheckbox({
  checked, indeterminate, onChange, className,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  className?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={className ?? 'w-3.5 h-3.5 accent-blue-500 cursor-pointer'}
    />
  )
}
