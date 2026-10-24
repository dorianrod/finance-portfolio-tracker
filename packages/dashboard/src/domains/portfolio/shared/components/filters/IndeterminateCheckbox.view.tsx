import i18n from '@/i18n/i18n'

import { useIndeterminateInput } from './helpers/presenters/useIndeterminateInput'

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
      className={
        className ?? i18n.t('ui.indeterminatecheckbox.w35H35AccentBlue500')
      }
    />
  )
}
