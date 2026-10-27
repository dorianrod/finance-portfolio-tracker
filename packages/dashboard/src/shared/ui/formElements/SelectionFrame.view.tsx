import type { ComponentPropsWithoutRef } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { SELECTION_FRAME_STATES } from '@/shared/ui/fieldAppearance/selectionFrameStates'

export function SelectionFrame({
  selected,
  ...props
}: ControlProps<ComponentPropsWithoutRef<'div'>> & {
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
