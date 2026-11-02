import type { BUTTON_VARIANTS } from './buttonVariants'
import { NAVIGATION_STATES } from './navigationStates'

export function getNavigationStateClass(
  variant: keyof typeof BUTTON_VARIANTS,
  active: boolean,
) {
  if (variant !== 'tab' && variant !== 'separatedTab') return undefined
  return NAVIGATION_STATES[variant][active ? 'active' : 'inactive']
}
