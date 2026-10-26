import { CHOICE_CHIP_BASE, CHOICE_CHIP_STATES } from './buttonAppearance'
import { type ButtonProps, ToggleButton } from './Controls.view'

export function ChoiceChip({
  active,
  className,
  ...props
}: ButtonProps & { active: boolean }) {
  return (
    <ToggleButton
      {...props}
      active={active}
      className={[
        CHOICE_CHIP_BASE,
        CHOICE_CHIP_STATES[active ? 'active' : 'inactive'],
        'px-3 py-1.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
