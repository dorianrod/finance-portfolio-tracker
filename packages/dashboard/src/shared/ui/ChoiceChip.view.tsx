import type { ButtonProps } from '@/shared/ui/controls/controls.types'
import { ToggleButton } from '@/shared/ui/controls/ToggleButton.view'

export function ChoiceChip({
  active,
  ...props
}: ButtonProps & { active: boolean }) {
  return <ToggleButton {...props} active={active} variant="choice" />
}
