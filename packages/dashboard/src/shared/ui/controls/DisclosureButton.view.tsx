import { Button } from './Button.view'
import type { ButtonProps } from './controls.types'

export function DisclosureButton({
  expanded,
  ...props
}: ButtonProps & { expanded: boolean }) {
  return <Button {...props} aria-expanded={expanded} />
}
