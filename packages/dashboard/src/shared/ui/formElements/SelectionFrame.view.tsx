import type { ComponentPropsWithoutRef } from 'react'

import { SELECTION_FRAME_STATES } from '@/shared/ui/fieldAppearance/selectionFrameStates'

export function SelectionFrame({
  selected,
  ...props
}: Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'style'> & {
  selected: boolean
}) {
  return (
    <div
      {...props}
      className={[
        'rounded-lg border text-xs transition-colors',
        SELECTION_FRAME_STATES[selected ? 'active' : 'inactive'],
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
