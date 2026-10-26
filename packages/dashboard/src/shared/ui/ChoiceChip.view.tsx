import { type ButtonProps, ToggleButton } from './Controls.view'

export function ChoiceChip({
  active,
  ...props
}: ButtonProps & { active: boolean }) {
  return <ToggleButton {...props} active={active} variant="choice" />
}
