import { Button } from './Button.view'
import type { ButtonProps } from './controls.types'

export function ToggleButton({
  active,
  ...props
}: ButtonProps & { active: boolean }) {
  return <Button {...props} selected={active} aria-pressed={active} />
}
