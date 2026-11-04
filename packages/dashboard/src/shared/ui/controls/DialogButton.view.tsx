import { Button } from './Button.view'
import type { ButtonProps } from './controls.types'

export function DialogButton({
  expanded,
  ...props
}: ButtonProps & { expanded: boolean }) {
  return <Button {...props} aria-haspopup="dialog" aria-expanded={expanded} />
}
